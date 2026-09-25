import assert from "node:assert/strict";
import test from "node:test";
import {CAMPAIGN,LEVEL_IDS,beatComplete,validLevel} from "../app/campaignLevels.ts";

const traversable=(level,x,y,bridge)=>{
 if(x<45||x>2955||y<45||y>2055)return false;
 if(level.walls.some(w=>x>w.x-37&&x<w.x+w.w+37&&y>w.y-37&&y<w.y+w.h+37))return false;
 if(level.hazard&&x>level.hazard.x&&x<level.hazard.x+level.hazard.w&&y>level.hazard.y&&y<level.hazard.y+level.hazard.h){return !!(bridge&&level.bridge&&x>level.bridge.x&&x<level.bridge.x+level.bridge.w&&y>level.bridge.y&&y<level.bridge.y+level.bridge.h)}
 return true;
};
const reachable=(level,target,bridge=false)=>{const step=40,key=(x,y)=>`${x},${y}`,start=[Math.round(level.start.x/step),Math.round(level.start.y/step)],seen=new Set([key(...start)]),q=[start];for(let i=0;i<q.length;i++){const [cx,cy]=q[i];if(Math.hypot(cx*step-target.x,cy*step-target.y)<85)return true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=cx+dx,y=cy+dy,k=key(x,y);if(!seen.has(k)&&traversable(level,x*step,y*step,bridge)){seen.add(k);q.push([x,y])}}}return false};

test("twelve authored districts span all six regions and end at Mega Dam",()=>{
 assert.equal(CAMPAIGN.length,12);
 assert.deepEqual(LEVEL_IDS,[1,2,3,4,5,6,7,8,9,11,15,18]);
 assert.equal(CAMPAIGN.at(-1).name,"MEGA DAM");
 assert.deepEqual([...new Set(CAMPAIGN.map(l=>l.classRank))],[1,2,3,4,5,6]);
 assert.equal(new Set(CAMPAIGN.map(l=>l.roads.map(r=>`${r.x},${r.y},${r.w},${r.h}`).join("|"))).size,CAMPAIGN.length,"every district needs different authored road geometry");
});
test("all objective graphs advance and all marked targets are physically reachable",()=>{
 for(const level of CAMPAIGN){assert.ok(validLevel(level),level.name);const all=new Set();for(let stage=0;stage<level.beats.length;stage++){const beat=level.beats[stage];const targetSet=level.targets.filter(t=>beat.targets.includes(t.id));assert.ok(targetSet.every(t=>t.stage===stage),`${level.name} stage ${stage} target ownership`);for(const target of targetSet){const bridge=!!level.bridge&&stage>level.beats.findIndex(b=>b.event==="bridge");assert.ok(reachable(level,target,bridge),`${level.name}: ${target.id} must be approachable`);all.add(target.id)}assert.ok(beatComplete(level,stage,new Set(beat.targets.slice(0,beat.quota??beat.targets.length))),`${level.name} stage ${stage} completion`)}assert.ok(level.targets.every(t=>all.has(t.id)),`${level.name}: every target belongs to a stage`);assert.ok(reachable(level,level.exit,!!level.bridge),`${level.name}: extraction must be reachable when unlocked`)}
});
test("landmark bridges alter connectivity in cut districts",()=>{for(const level of CAMPAIGN.filter(l=>l.hazard&&l.bridge)){assert.equal(reachable(level,level.exit,false),false,`${level.name}: no early crossing`);assert.equal(reachable(level,level.exit,true),true,`${level.name}: collapse creates crossing`)}});
test("dam requires speed, air, direction, and a final jump in separate phases",()=>{const dam=CAMPAIGN.at(-1);assert.equal(dam.beats.length,4);assert.deepEqual(dam.beats[1].targets.map(id=>dam.targets.find(t=>t.id===id).verb),["nitro","jump","west"]);assert.deepEqual(dam.beats[2].targets.map(id=>dam.targets.find(t=>t.id===id).verb),["nitro","jump","west"]);assert.equal(dam.targets.find(t=>t.id==="central-breach").verb,"jump")});
