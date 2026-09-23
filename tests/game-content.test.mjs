import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/IronOutlawGame.tsx", import.meta.url), "utf8");
const gold = await readFile(new URL("../app/GoldDistrict.tsx", import.meta.url), "utf8");
const topology = JSON.parse(await readFile(new URL("../public/data/breaker-yard-topology.json", import.meta.url), "utf8"));

const districtNames = [
  "Breaker Yard", "Split Grid", "Timberline Mill", "Freight Row", "Dead Mall", "Concrete Stack",
  "The Interchange", "Glass Mile", "Terminal Zero", "Foundry Basin", "Iron Bowl", "Ring Road",
  "Downtown Canyon", "Crosswind", "Skyhook", "Spillway Town", "Turbine Spine", "MEGA DAM",
];

test("reserves all 18 campaign records without producing past the gold gate", () => {
  for (const name of districtNames) assert.match(source, new RegExp(name, "i"));
  const campaignTable = source.match(/const RAW = \[([\s\S]*?)\n\] as const;/)?.[1] ?? "";
  assert.equal((campaignTable.match(/^\s*\[\"[^\"]+\",\"/gm) ?? []).length, 18);
  assert.match(source, /disabled=\{x\.id>1\}/);
});

test("includes every progression and input surface", () => {
  for (const chassis of ["YARDBREAKER", "ROADHAMMER", "BLOCKBUSTER", "COLOSSUS", "TOWERKILLER", "DAM-BREAKER"])
    assert.match(source, new RegExp(chassis));
  for (const capability of ["localStorage", "reducedFlash", "autoDrive", "Pressure escape", "Vector Shear"])
    assert.match(source, new RegExp(capability));
  for (const capability of ["getGamepads", "onPointerDown", "jumpCd", "nitroUnlocked", "overdrive"])
    assert.match(gold, new RegExp(capability));
});

test("gold district enforces authored topology and connectivity change", () => {
  for (const area of ["WRECKING APRON", "THREE-WAY FORK", "STACKED SCRAP", "SHED MAZE", "CRUSHER YARD", "SCALE HOUSE LOOP", "CONVEYOR GANTRY", "MAGNET ALLEY", "COUNTY GATE"])
    assert.match(gold, new RegExp(area));
  assert.match(gold, /s\.supports===3/);
  assert.match(gold, /s\.bridge===1/);
  assert.match(gold, /ATTACK SUPPORTS FROM THE WEST/);
  assert.match(gold, /NO ROUTE \/\/ FELL THE CONVEYOR/);
  assert.match(gold, /w\.kind===\"fence\"&&s\.z>32/);
});

test("route graph has three authored branches, two loops, and a destruction-created exit", () => {
  const edges = topology.edges;
  const neighbors = (node, bridge) => edges.filter(e => e[2] !== "bridge" || bridge).flatMap(e => e[0]===node?[e[1]]:e[1]===node?[e[0]]:[]);
  const reachable = (target, bridge) => { const seen=new Set(["start"]), queue=["start"]; while(queue.length){for(const n of neighbors(queue.shift(),bridge))if(!seen.has(n)){seen.add(n);queue.push(n)}}return seen.has(target) };
  assert.deepEqual(neighbors("fork", false).sort(), ["crusher_yard","jump_ramp","shed_maze","start"]);
  assert.ok(reachable("gantry", false), "all three branches reconnect before the landmark");
  assert.equal(reachable("exit", false), false, "exit must be disconnected before collapse");
  assert.equal(reachable("exit", true), true, "fallen conveyor must connect the county road");
  assert.equal(edges.filter(e=>e[2]!=="bridge").length-topology.nodes.length+1,2,"pre-collapse yard should contain two navigational loops");
  assert.deepEqual(topology.footprint_m, [550,420]);
});

test("production art required by the game is present", async () => {
  for (const path of ["../public/menu-bg.webp", "../public/art/concepts/veh_iron_outlaw_orthographic.png", "../public/art/icons/ico_nitro.png"])
    assert.ok((await stat(new URL(path, import.meta.url))).size > 1000, `${path} should be a real asset`);
});
