import assert from 'node:assert/strict';
import test from 'node:test';
import { CAMPAIGN } from '../app/campaignLevels.ts';

const STEP=20, R=37, W=3000, H=2100;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const circleBox=(x,y,r,b)=>Math.hypot(x-clamp(x,b.x,b.x+b.w),y-clamp(y,b.y,b.y+b.h))<r;
const targetBox=t=>({x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h});
const inside=(x,y,b)=>x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h;

function open(level,x,y,bridge){
  if(x<45||x>W-45||y<45||y>H-45)return false;
  if(level.walls.some(b=>circleBox(x,y,R,b)))return false;
  if(level.hazard&&inside(x,y,level.hazard)&&!(bridge&&level.bridge&&inside(x,y,level.bridge)))return false;
  return true;
}

function reachablePoints(level,bridge){
  const sx=Math.round(level.start.x/STEP),sy=Math.round(level.start.y/STEP);
  const width=Math.ceil(W/STEP)+1,height=Math.ceil(H/STEP)+1;
  const seen=new Uint8Array(width*height),queue=[[sx,sy]];
  seen[sy*width+sx]=1;
  for(let i=0;i<queue.length;i++){
    const [cx,cy]=queue[i];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=cx+dx,y=cy+dy,key=y*width+x;
      if(x<0||x>=width||y<0||y>=height||seen[key]||!open(level,x*STEP,y*STEP,bridge))continue;
      seen[key]=1;queue.push([x,y]);
    }
  }
  return queue.map(([x,y])=>[x*STEP,y*STEP]);
}

function hasImpactApproach(level,target,points,bridge){
  const box=targetBox(target);
  return points.some(([x,y])=>{
    if(target.verb==='west'&&x>target.x-18)return false;
    if(!circleBox(x,y,target.verb==='jump'?23:39,box))return false;
    const dx=target.x-x,dy=target.y-y,d=Math.hypot(dx,dy);
    if(d<1)return true;
    for(let f=1;f<=3;f++){
      const px=x-dx/d*f*30,py=y-dy/d*f*30;
      if(!open(level,px,py,bridge))return false;
    }
    return true;
  });
}

test('every campaign objective has a reachable impact path with vehicle clearance',()=>{
  let count=0;
  for(const level of CAMPAIGN){
    const opening=reachablePoints(level,false);
    assert.ok(opening.some(([x,y])=>Math.hypot(x-level.power.x,y-level.power.y)<78),`${level.name}: power pickup is unreachable`);
    for(let stage=0;stage<level.beats.length;stage++){
      const bridge=!!level.bridge&&stage>level.beats.findIndex(b=>b.event==='bridge');
      const points=bridge?reachablePoints(level,true):opening;
      for(const id of level.beats[stage].targets){
        const target=level.targets.find(t=>t.id===id);
        assert.ok(hasImpactApproach(level,target,points,bridge),`${level.name}: ${id} lacks an open impact approach`);
        count++;
      }
    }
    const finish=level.bridge?reachablePoints(level,true):opening;
    assert.ok(finish.some(([x,y])=>Math.hypot(x-level.exit.x,y-level.exit.y)<100),`${level.name}: extraction is unreachable`);
  }
  assert.equal(count,63);
});
