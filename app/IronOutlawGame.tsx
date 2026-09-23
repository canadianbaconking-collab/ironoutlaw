"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import GoldDistrict from "./GoldDistrict";

type Screen = "menu" | "map" | "game" | "results" | "contracts" | "garage" | "settings" | "credits";
type District = {
  id: number; region: number; name: string; regionName: string; className: string;
  objective: string; objectiveType: string; landmark: string; palette: [string,string,string]; length: number;
};
type SaveData = { unlocked: number; completed: number[]; medals: Record<number,number>; best: Record<number,number>; score: number; contracts: number[]; reducedFlash: boolean; shake: number; autoDrive: boolean; sound: boolean };

const REGIONS = [
  ["RUST COUNTY","YARDBREAKER",["#c66b32","#44291f","#e3a33b"]],
  ["COMMERCE BELT","ROADHAMMER",["#e0a72e","#273849","#7c9bb3"]],
  ["METRO FRINGE","BLOCKBUSTER",["#44b8d8","#232f39","#d94a3c"]],
  ["CIVIC WORKS","COLOSSUS",["#e04b2a","#2a3038","#9b7c62"]],
  ["VERTICAL CITY","TOWERKILLER",["#c34269","#111926","#55b6ce"]],
  ["WATERWORKS","DAM-BREAKER",["#2c7fa3","#192c3b","#c84a3c"]],
] as const;

const RAW = [
  ["Breaker Yard","Breakthrough","Break the emergency gate and reach the county road.","Drop the scrap conveyor across the locked gate."],
  ["Split Grid","Clear corridor","Open two marked streets for the evacuation line.","Fell the water tower through the barricaded intersection."],
  ["Timberline Mill","Fell into target","Drop the sawmill frame across the drainage cut.","The mill becomes your bridge as its logs cascade."],
  ["Freight Row","Clear corridor","Clear three freight lanes to the rail depot.","Drive a loading crane boom through the final warehouse."],
  ["Dead Mall","Route choice","Breach the lockdown hub by the atrium or parking decks.","Collapse the atrium roof into the control hub."],
  ["Concrete Stack","Demolish nodes","Pancake the marked parking decks into an exit ramp.","A controlled slab collapse creates the extraction ramp."],
  ["The Interchange","Route choice","Drop selected flyovers and cross the blocked trench.","A fallen ramp becomes the only path forward."],
  ["Glass Mile","Cascade quota","Clear the emergency corridor without blocking it.","Vector Shear sends two towers sideways into the plazas."],
  ["Terminal Zero","Demolish nodes","Collapse the station roof away from the rail corridor.","The roof cascade runs platform to platform."],
  ["Foundry Basin","Demolish nodes","Disable three containment locks and breach the core.","A pipe-rack domino chain tears open the foundry."],
  ["Iron Bowl","Fell into target","Collapse one stadium quadrant into the blocked tunnel.","The seating ring rolls inward in a concrete wave."],
  ["Ring Road","Pressure escape","Stay ahead of the civic ring collapsing behind you.","The entire ring fails in a staged circular cascade."],
  ["Downtown Canyon","Breakthrough","Open a route through three dense city blocks.","Skybridges pull whole facades into the plaza."],
  ["Crosswind","Fell into target","Topple the tower into the marked containment basin.","Correct its lean, then shear it through two buildings."],
  ["Skyhook","Multi-phase","Climb, weaken the crown, and outrun the collapse fan.","The megatower folds in two stages above the city."],
  ["Spillway Town","Demolish nodes","Break the floodgate pylons and cross the channels.","A fallen floodwall redirects the water."],
  ["Turbine Spine","Cascade quota","Disable the housings and tear open the dam access.","Turbines fail in sequence down the service spine."],
  ["MEGA DAM","Multi-phase","Expose, crack, and breach the dam before flood crest.","Final Overdrive. One launch. No return."],
] as const;

export const DISTRICTS: District[] = RAW.map((d,i) => {
  const region = Math.floor(i/3); const r = REGIONS[region];
  return { id:i+1, region, name:d[0], regionName:r[0], className:r[1], objectiveType:d[1], objective:d[2], landmark:d[3], palette:[...r[2]] as [string,string,string], length: 4400 + region*320 + (i%3)*220 };
});

const defaultSave: SaveData = { unlocked:1, completed:[], medals:{}, best:{}, score:0, contracts:[], reducedFlash:false, shake:.65, autoDrive:false, sound:true };
const menuItems: [string,string,Screen][] = [["CAMPAIGN","Play the evacuation route","map"],["CONTRACTS","Side jobs & challenge rules","contracts"],["GARAGE","Six evolving demolition chassis","garage"],["SETTINGS","Controls & accessibility","settings"],["CREDITS","Production notes","credits"]];

function loadSave(): SaveData {
  if (typeof window === "undefined") return defaultSave;
  try { return {...defaultSave,...JSON.parse(localStorage.getItem("iron-outlaw-save-v2") || "{}")}; } catch { return defaultSave; }
}

export default function IronOutlawGame(){
  const [screen,setScreen]=useState<Screen>("menu");
  const [save,setSave]=useState<SaveData>(defaultSave);
  const [selected,setSelected]=useState(1);
  const [result,setResult]=useState({score:0,time:0,medals:0,district:1});
  const [muted,setMuted]=useState(false);
  useEffect(()=>{const id=requestAnimationFrame(()=>setSave(loadSave()));return()=>cancelAnimationFrame(id)},[]);
  const persist=useCallback((next:SaveData)=>{setSave(next);localStorage.setItem("iron-outlaw-save-v2",JSON.stringify(next));},[]);
  const startDistrict=useCallback((id:number)=>{if(id!==1)return;setSelected(1);setScreen("game");},[]);
  const continueGame=()=>startDistrict(1);
  const finishGold=useCallback((score:number,time:number)=>{
    const medals=1+(time<300?1:0)+(score>=18000?1:0);
    const next={...save,unlocked:1,completed:[...new Set([...save.completed,1])],medals:{...save.medals,1:Math.max(save.medals[1]||0,medals)},best:{...save.best,1:Math.max(save.best[1]||0,Math.round(score))},score:Math.max(save.score,score)};
    persist(next);setResult({score:Math.round(score),time,medals,district:1});setTimeout(()=>setScreen("results"),900);
  },[save,persist]);
  return <main className={`shell ${screen==="game"?"in-game":""}`}>
    {screen==="menu"&&<Menu save={save} onContinue={continueGame} onNav={setScreen}/>} 
    {screen==="map"&&<CampaignMap save={save} selected={selected} setSelected={setSelected} start={startDistrict} back={()=>setScreen("menu")}/>} 
    {screen==="game"&&<GoldDistrict shake={save.shake} autoDrive={save.autoDrive} reducedFlash={save.reducedFlash} onExit={()=>setScreen("map")} onComplete={finishGold}/>} 
    {screen==="results"&&<Results result={result} district={DISTRICTS[0]} next={()=>startDistrict(1)} map={()=>setScreen("map")}/>} 
    {screen==="contracts"&&<Contracts save={save} start={startDistrict} back={()=>setScreen("menu")}/>} 
    {screen==="garage"&&<Garage save={save} back={()=>setScreen("menu")}/>} 
    {screen==="settings"&&<Settings save={save} persist={persist} muted={muted} setMuted={setMuted} back={()=>setScreen("menu")}/>} 
    {screen==="credits"&&<Credits completed={save.completed.includes(18)} back={()=>setScreen("menu")}/>} 
  </main>;
}

function Brand(){return <div className="brand"><div className="iron">IRON</div><div className="outlaw">OUTLAW</div><div className="wing">☠</div></div>}
function Menu({save,onContinue,onNav}:{save:SaveData;onContinue:()=>void;onNav:(s:Screen)=>void}){
  return <section className="menu-screen"><div className="menu-shade"/><div className="menu-left"><Brand/><div className="kicker">{"EVACUATION ROUTE COMMAND // GOLD DISTRICT BUILD"}</div><div className="menu-list"><button className="menu-entry active" onClick={onContinue}><span className="big-icon">▶</span><span><b>{save.completed.includes(1)?"REPLAY BREAKER YARD":"DEPLOY TO BREAKER YARD"}</b><small>{save.completed.includes(1)?"Gold district // chase the three medals":"One authored district. Three routes. One transformed crossing."}</small></span></button>{menuItems.slice(1).map(([a,b,s],i)=><button className="menu-entry" onClick={()=>onNav(s)} key={a}><span className="big-icon">{["▣","⚙","☷","★"][i]}</span><span><b>{a}</b><small>{b}</small></span></button>)}</div></div><div className="profile"><b>OUTLAW</b><span>{`RANK ${save.completed.includes(1)?3:1} // WRECKING CREW`}</span><strong>$ {Math.round(save.score).toLocaleString()}</strong></div><div className="broadcast"><b>OUTLAW BROADCAST</b><div className="wave">▂▅▃▆▂▇▅▂▆▃▆▂▇▃▆</div><p>{save.completed.includes(1)?"Breaker Yard cleared. Expansion remains behind the gold quality gate.":"Gold District order: prove the yard before building the world."}</p></div></section>
}

function CampaignMap({save,selected,setSelected,start,back}:{save:SaveData;selected:number;setSelected:(n:number)=>void;start:(n:number)=>void;back:()=>void}){
 const d=DISTRICTS[selected-1],locked=selected>1;
 return <section className="panel-screen map-screen"><Top title="CAMPAIGN ROUTE // GOLD GATE" back={back}/><div className="flood-line" style={{width:save.completed.includes(1)?"12%":"5%"}}/><div className="route-map">{DISTRICTS.map((x,i)=><button key={x.id} disabled={x.id>1} onClick={()=>setSelected(x.id)} className={`node r${x.region} ${selected===x.id?"selected":""} ${save.completed.includes(x.id)?"done":""}`} style={{left:`${5+(i%6)*18}%`,top:`${12+Math.floor(i/6)*35}%`}}><span>{x.id}</span><small>{x.id===1?x.name:"HOLD"}</small></button>)}</div><aside className="mission-card"><span>{locked?"EXPANSION BLOCKED // GOLD REVIEW REQUIRED":`${d.regionName} // AUTHORED GOLD DISTRICT`}</span><h2>{locked?"NO PRODUCTION BEYOND DISTRICT 01":`${String(d.id).padStart(2,"0")} — ${d.name}`}</h2><b>{locked?"Quality gate":"Three-route destruction puzzle"}</b><p>{locked?"No later district will be built from an unproven template.":"The direct road is severed. Enter the yard, choose among jump, destruction, and power routes, then fell the conveyor to create the crossing."}</p><div className="landmark">LANDMARK<br/><strong>{locked?"Awaiting Breaker Yard approval":d.landmark}</strong></div><div className="medals">{[0,1,2].map(i=><i className={(save.medals[1]||0)>i?"earned":""} key={i}>★</i>)}</div><button className="primary" disabled={locked} onClick={()=>start(1)}>{locked?"PRODUCTION HOLD":"DEPLOY TO GOLD DISTRICT"}</button></aside></section>
}

function Results({result,district,next,map}:{result:{score:number;time:number;medals:number};district:District;next:()=>void;map:()=>void}){return <section className="panel-screen results"><div className="results-card"><span>GOLD ROUTE CLEARED</span><h1>{district.name}</h1><div className="result-medals">{[0,1,2].map(i=><i className={result.medals>i?"earned":""} key={i}>★</i>)}</div><div className="stat-grid"><div><b>{result.score.toLocaleString()}</b><small>SCORE</small></div><div><b>{fmt(result.time)}</b><small>TIME</small></div><div><b>{result.medals}/3</b><small>QUALITY MEDALS</small></div></div><div className="evolution">DISTRICT 02 REMAINS LOCKED // GOLD REVIEW REQUIRED</div><div className="actions"><button onClick={map}>ROUTE MAP</button><button className="primary" onClick={next}>REPLAY GOLD DISTRICT</button></div></div></section>}
function fmt(s:number){return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}.${String(Math.floor(s%1*100)).padStart(2,"0")}`}

function Contracts({save,start,back}:{save:SaveData;start:(n:number)=>void;back:()=>void}){return <section className="panel-screen"><Top title="CONTRACTS" back={back}/><div className="cards">{REGIONS.map((r,i)=><article className="contract" key={r[0]}><span>REGION {i+1}</span><h2>{r[0]}</h2><p>{["Nitro ration / demolition refill","Reverse route / fragile combo","Vector Shear only / chain scoring","No recovery / pressure front","Final chassis overkill / crosswind","Rising water / breach sequence"][i]}</p><button disabled={!save.contracts.includes(i)} onClick={()=>start(i*3+2)}>{save.contracts.includes(i)?"ACCEPT CONTRACT":"COMPLETE REGION TO UNLOCK"}</button></article>)}</div></section>}
function Garage({save,back}:{save:SaveData;back:()=>void}){const current=Math.min(5,Math.floor(Math.max(0,save.unlocked-1)/3));return <section className="panel-screen garage"><Top title="OUTLAW GARAGE" back={back}/><div className="vehicle-display"><Image src="/art/concepts/veh_iron_outlaw_orthographic.png" width={1024} height={1024} alt="Iron Outlaw orthographic concept"/><div><span>ACTIVE CHASSIS // CLASS {current+1}</span><h1>{REGIONS[current][1]}</h1><p>Mass, impact authority, camera scale, and debris handling evolve automatically as the evacuation route advances.</p><div className="class-track">{REGIONS.map((r,i)=><div className={i<=current?"open":""} key={r[1]}><b>{i+1}</b><small>{r[1]}</small></div>)}</div></div></div></section>}
function Settings({save,persist,muted,setMuted,back}:{save:SaveData;persist:(s:SaveData)=>void;muted:boolean;setMuted:(x:boolean)=>void;back:()=>void}){const toggle=(k:keyof SaveData,v:boolean|number)=>persist({...save,[k]:v});return <section className="panel-screen settings"><Top title="SETTINGS & ACCESSIBILITY" back={back}/><div className="settings-grid"><label>CAMERA SHAKE <input type="range" min="0" max="1" step=".05" value={save.shake} onChange={e=>toggle("shake",+e.target.value)}/><span>{Math.round(save.shake*100)}%</span></label><label>REDUCED FLASH <button className={save.reducedFlash?"on":""} onClick={()=>toggle("reducedFlash",!save.reducedFlash)}>{save.reducedFlash?"ON":"OFF"}</button></label><label>AUTO-DRIVE <button className={save.autoDrive?"on":""} onClick={()=>toggle("autoDrive",!save.autoDrive)}>{save.autoDrive?"ON":"OFF"}</button></label><label>AUDIO <button className={!muted?"on":""} onClick={()=>setMuted(!muted)}>{muted?"MUTED":"ON"}</button></label></div><div className="controls"><h2>CONTROLS</h2><p><kbd>W</kbd> THROTTLE <kbd>S</kbd> BRAKE / REVERSE <kbd>A D</kbd> STEER <kbd>SPACE</kbd> HYDRAULIC JUMP <kbd>SHIFT</kbd> NITRO <kbd>ESC</kbd> PAUSE</p><p>Gamepad and on-screen touch controls are active automatically.</p></div><button className="danger" onClick={()=>{if(confirm("Erase all campaign progress?")){localStorage.removeItem("iron-outlaw-save-v2");location.reload()}}}>ERASE SAVE</button></section>}
function Credits({completed,back}:{completed:boolean;back:()=>void}){return <section className="panel-screen credits"><div className="credits-inner"><Brand/><span>{completed?"THE LINE MADE IT ACROSS":"EVACUATION ROUTE COMMAND"}</span><h1>{completed?"NO RETURN":"THE IRON OUTLAW"}</h1><p>{completed?"The dam is gone. The valley lives. Far downstream, emergency radio catches the sound of an engine turning over.":"A destruction-routing arcade campaign."}</p><div className="credit-roll"><b>GAME DIRECTION</b><span>Richard + Codex</span><b>DESIGN FOUNDATION</b><span>Blast Corps routing // Katamari escalation // arcade chase movement</span><b>ART DIRECTION</b><span>Grounded industrial spectacle with arcade readability</span><b>CAMPAIGN</b><span>18 districts // 6 chassis classes // 12 contract remixes</span></div><button className="primary" onClick={back}>RETURN TO COMMAND</button></div></section>}
function Top({title,back}:{title:string;back:()=>void}){return <header className="top"><button onClick={back}>← COMMAND</button><h1>{title}</h1><div>IRON OUTLAW // v1.0</div></header>}
