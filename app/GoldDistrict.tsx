"use client";

import { useEffect, useRef, useState } from "react";
import { makeYardSurface, drawGantry, drawPower, drawObject, drawTruck } from "./yardArt";

type Props={shake:number;autoDrive:boolean;reducedFlash:boolean;onExit:()=>void;onComplete:(score:number,time:number)=>void};
type Obj={id:string;x:number;y:number;w:number;h:number;hp:number;max:number;kind:"shed"|"scrap"|"support"|"gate"|"concrete";dead:boolean;angle:number;marked?:boolean;solid?:boolean};
type Wall={x:number;y:number;w:number;h:number;kind:"building"|"fence"|"ravine"};
type Particle={x:number;y:number;vx:number;vy:number;life:number;color:string;size:number};
type State={x:number;y:number;heading:number;speed:number;z:number;zv:number;jumpCd:number;nitro:number;nitroUnlocked:boolean;overdrive:number;powerTaken:boolean;score:number;combo:number;comboT:number;time:number;phase:number;lightKills:number;supports:number;bridge:number;message:string;messageT:number;shake:number;lastSafe:{x:number;y:number;heading:number};recoverT:number;finished:boolean;objs:Obj[];particles:Particle[]};

const WORLD={w:3300,h:2500};
const ROADS=[
  {x:110,y:1770,w:760,h:360}, {x:650,y:1320,w:350,h:750}, {x:820,y:950,w:900,h:300},
  {x:760,y:1570,w:1050,h:350}, {x:650,y:2050,w:1550,h:300}, {x:1550,y:1080,w:350,h:1120},
  {x:1780,y:900,w:720,h:300}, {x:1820,y:1700,w:680,h:340}, {x:2250,y:1050,w:280,h:950},
  {x:2680,y:1000,w:520,h:330},
];
const WALLS:Wall[]=[
  {x:130,y:1380,w:450,h:290,kind:"building"},{x:160,y:2160,w:400,h:230,kind:"building"},
  {x:1040,y:1290,w:370,h:210,kind:"building"},{x:1160,y:1940,w:350,h:180,kind:"building"},
  {x:1450,y:540,w:440,h:330,kind:"building"},{x:1920,y:1280,w:350,h:300,kind:"building"},
  {x:1390,y:945,w:42,h:310,kind:"fence"},
  {x:1970,y:420,w:440,h:360,kind:"building"},{x:2780,y:580,w:380,h:300,kind:"building"},
  {x:2525,y:90,w:160,h:910,kind:"ravine"},{x:2525,y:1330,w:160,h:1080,kind:"ravine"},
];
const AREAS=[
  [340,2020,"WRECKING APRON"],[780,1510,"THREE-WAY FORK"],[1160,1070,"STACKED SCRAP"],[1210,1770,"SHED MAZE"],
  [1250,2240,"CRUSHER YARD"],[1715,1470,"SCALE HOUSE LOOP"],[2200,1010,"CONVEYOR GANTRY"],[2220,1900,"MAGNET ALLEY"],[2940,1190,"COUNTY GATE"],
] as const;

function objects():Obj[]{
  const a:Obj[]=[];
  [[720,1660],[820,1710],[920,1810],[1040,1650],[1230,1710],[1420,1810]].forEach((p,i)=>a.push({id:`shed-${i}`,x:p[0],y:p[1],w:105,h:78,hp:1,max:1,kind:"shed",dead:false,angle:(i%2)*.15}));
  [[880,1120],[1010,1050],[1180,1160],[1340,1050],[1510,1140],[720,2140],[910,2240],[1080,2130],[1370,2240],[1550,2130],[1810,2140],[2070,1870]].forEach((p,i)=>a.push({id:`scrap-${i}`,x:p[0],y:p[1],w:70+(i%3)*15,h:62,hp:1,max:1,kind:"scrap",dead:false,angle:(i%5)*.22}));
  [[2320,980],[2320,1120],[2320,1260]].forEach((p,i)=>a.push({id:`support-${i}`,x:p[0],y:p[1],w:58,h:58,hp:3,max:3,kind:"support",dead:false,angle:0,marked:true}));
  a.push({id:"county-gate",x:3070,y:1165,w:70,h:300,hp:5,max:5,kind:"gate",dead:false,angle:0,marked:true});
  [[1580,960],[1780,960],[1850,1840],[2140,1740]].forEach((p,i)=>a.push({id:`barrier-${i}`,x:p[0],y:p[1],w:115,h:65,hp:2,max:2,kind:"concrete",dead:false,angle:i*.08}));
  return a;
}
function initial():State{return{x:310,y:1930,heading:-.08,speed:0,z:0,zv:0,jumpCd:0,nitro:0,nitroUnlocked:false,overdrive:0,powerTaken:false,score:0,combo:0,comboT:0,time:0,phase:0,lightKills:0,supports:0,bridge:0,message:"BREAK SOMETHING",messageT:4,shake:0,lastSafe:{x:310,y:1930,heading:-.08},recoverT:0,finished:false,objs:objects(),particles:[]}}
function clamp(v:number,a:number,b:number){return Math.max(a,Math.min(b,v))}
function circleRect(cx:number,cy:number,r:number,o:{x:number;y:number;w:number;h:number}){const qx=clamp(cx,o.x-o.w/2,o.x+o.w/2),qy=clamp(cy,o.y-o.h/2,o.y+o.h/2);return Math.hypot(cx-qx,cy-qy)<r}
function roadAt(x:number,y:number){return ROADS.some(r=>x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h)}

export default function GoldDistrict({shake,autoDrive,reducedFlash,onExit,onComplete}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null),stateRef=useRef<State>(initial()),keys=useRef<Record<string,boolean>>({}),pausedRef=useRef(false);
  const [brief,setBrief]=useState(true),[phaseLabel,setPhaseLabel]=useState("INFILTRATE THE YARD"),[paused,setPaused]=useState(false);
  const togglePause=()=>setPaused(value=>{pausedRef.current=!value;return !value});
  useEffect(()=>{const d=(e:KeyboardEvent)=>{if(e.code==="Escape"){e.preventDefault();if(!e.repeat&&!brief)togglePause();return}keys.current[e.code]=true;if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault()};const u=(e:KeyboardEvent)=>keys.current[e.code]=false;addEventListener("keydown",d);addEventListener("keyup",u);return()=>{removeEventListener("keydown",d);removeEventListener("keyup",u)}},[brief]);
  useEffect(()=>{
    const canvas=canvasRef.current!,ctx=canvas.getContext("2d")!,surface=makeYardSurface(ROADS,WALLS);let raf=0,last=performance.now(),acc=0;
    const burst=(s:State,x:number,y:number,color:string,n=16)=>{for(let i=0;i<n;i++){const a=Math.random()*6.28,m=40+Math.random()*230;s.particles.push({x,y,vx:Math.cos(a)*m,vy:Math.sin(a)*m,life:.45+Math.random()*.7,color,size:3+Math.random()*10})}}
    const announce=(s:State,msg:string,t=3)=>{s.message=msg;s.messageT=t};
    const recover=(s:State)=>{s.x=s.lastSafe.x;s.y=s.lastSafe.y;s.heading=s.lastSafe.heading;s.speed=0;s.z=0;s.zv=0;s.combo=0;s.recoverT=1.2;announce(s,"TOW RECOVERY // ROUTE LOST",2)};
    const hit=(s:State,o:Obj,impact:number,boost:boolean)=>{
      if(o.dead)return;const damage=impact>260?2:impact>95?1:0;
      if(o.kind==="support"&&s.x>o.x+20){s.speed*=-.25;announce(s,"ATTACK SUPPORTS FROM THE WEST",1.6);return}
      if(o.kind==="gate"&&!s.bridge){s.speed*=-.25;announce(s,"NO ROUTE // FELL THE CONVEYOR",2);return}
      if(o.kind==="gate"&&!boost&&s.overdrive<=0){s.speed*=-.25;announce(s,"REINFORCED // HIT IT UNDER NITRO",2);return}
      if(damage<=0){s.speed*=-.18;return}o.hp-=damage;s.speed*=.63;s.shake=.28;burst(s,o.x,o.y,o.kind==="support"?"#e0a72e":o.kind==="shed"?"#9a4f2e":"#a6adb4");
      if(o.hp<=0){o.dead=true;s.combo++;s.comboT=2.4;s.score+=(o.kind==="support"?2200:o.kind==="gate"?5000:450)*Math.max(1,s.combo*.4);s.nitro=clamp(s.nitro+12,0,100);
        if(o.kind==="shed"||o.kind==="scrap"){s.lightKills++;if(s.lightKills===3&&!s.nitroUnlocked){s.nitroUnlocked=true;s.nitro=100;s.phase=1;setPhaseLabel("CHOOSE A ROUTE // FIND THE GANTRY");announce(s,"NITRO ONLINE // THREE ROUTES OPEN",4)}}
        if(o.kind==="support"){s.supports++;announce(s,`GANTRY SUPPORT ${s.supports}/3 DESTROYED`,2);if(s.supports===3){s.phase=2;s.bridge=.001;setPhaseLabel("LANDMARK COLLAPSE // CLEAR THE FALL ZONE");announce(s,"STRUCTURE UNSTABLE // MOVE!",4)}}
        if(o.kind==="gate"){s.phase=4;setPhaseLabel("EXTRACT TO COUNTY ROAD");announce(s,"EMERGENCY GATE BROKEN // GO!",3)}
      }
    };
    const step=(dt:number)=>{
      const s=stateRef.current;if(s.finished||brief||pausedRef.current)return;const k=keys.current,g=navigator.getGamepads?.()[0];let steer=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0),throttle=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0),boost=!!(k.ShiftLeft||k.ShiftRight),jump=!!k.Space;
      if(g){steer=Math.abs(g.axes[0])>.15?g.axes[0]:steer;throttle=Math.abs(g.axes[1])>.15?-g.axes[1]:throttle;boost=boost||g.buttons[0]?.pressed;jump=jump||g.buttons[1]?.pressed}if(autoDrive&&throttle===0)throttle=1;
      const usingBoost=boost&&s.nitroUnlocked&&s.nitro>0;const terrain=roadAt(s.x,s.y)?1:.72,max=(usingBoost?440:285)*(s.overdrive>0?1.18:1)*terrain;
      s.speed+=throttle*(usingBoost?290:175)*dt;s.speed*=Math.pow(throttle===0?.982:.996,dt*60);s.speed=clamp(s.speed,-90,max);s.heading+=steer*(1.85/(1+Math.abs(s.speed)/390))*dt*(s.speed<0?-1:1);
      if(usingBoost)s.nitro=Math.max(0,s.nitro-24*dt);else if(s.nitroUnlocked)s.nitro=Math.min(100,s.nitro+1.2*dt);s.overdrive=Math.max(0,s.overdrive-dt);
      if(jump&&s.jumpCd<=0&&s.z===0){s.zv=235;s.jumpCd=.7}if(s.jumpCd>0)s.jumpCd-=dt;s.zv-=500*dt;s.z+=s.zv*dt;if(s.z<0){if(s.zv<-175){s.shake=.4;burst(s,s.x,s.y,"#b69a6e",22)}s.z=0;s.zv=0}
      const ox=s.x,oy=s.y;s.x+=Math.cos(s.heading)*s.speed*dt;s.y+=Math.sin(s.heading)*s.speed*dt;s.x=clamp(s.x,60,WORLD.w-60);s.y=clamp(s.y,60,WORLD.h-60);
      const radius=s.z>30?25:39;for(const w of WALLS){if(w.kind==="ravine"||(w.kind==="fence"&&s.z>32))continue;if(circleRect(s.x,s.y,radius,{x:w.x+w.w/2,y:w.y+w.h/2,w:w.w,h:w.h})){s.x=ox;s.y=oy;s.speed*=-.18;s.shake=.15;if(w.kind==="fence")announce(s,"HYDRAULIC JUMP ROUTE",1.5)}}
      for(const o of s.objs){if(!o.dead&&circleRect(s.x,s.y,radius,o))hit(s,o,Math.abs(s.speed)*(usingBoost?1.7:1)*(s.z>12?1.35:1),usingBoost)}
      const inRavine=s.x>2505&&s.x<2705&&!(s.bridge>=1&&s.y>1025&&s.y<1305);if(inRavine&&s.z<35)recover(s);
      if(roadAt(s.x,s.y)&&Math.abs(s.speed)<260&&s.recoverT<=0)s.lastSafe={x:s.x,y:s.y,heading:s.heading};
      if(Math.hypot(s.x-1350,s.y-2220)<85&&s.nitroUnlocked&&!s.powerTaken){s.powerTaken=true;s.overdrive=12;s.nitro=100;s.score+=1500;announce(s,"CRUSHER CORE // OVERDRIVE 12 SEC",3)}
      if(s.bridge>0&&s.bridge<1){s.bridge=Math.min(1,s.bridge+dt/3.2);s.shake=.75;if(s.bridge===1){s.phase=3;s.score+=7000;setPhaseLabel("CROSS THE NEW BRIDGE // BREACH THE GATE");announce(s,"ROUTE TRANSFORMED // COUNTY ROAD OPEN",5);burst(s,2550,1160,"#b69a6e",80)}}
      if(s.phase===4&&s.x>3170&&s.y>1010&&s.y<1360){s.finished=true;s.score+=Math.max(0,6000-s.time*8);announce(s,"EVACUATION ROUTE CLEAR",5);onComplete(s.score,s.time)}
      s.time+=dt;s.comboT-=dt;if(s.comboT<=0)s.combo=0;s.messageT-=dt;s.shake=Math.max(0,s.shake-dt);s.recoverT=Math.max(0,s.recoverT-dt);s.particles=s.particles.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;return p.life>0}).slice(-260);
    };
    const draw=()=>{const s=stateRef.current,W=canvas.width,H=canvas.height,scale=.74,sh=s.shake*shake*13,camX=clamp(s.x+(Math.cos(s.heading)*170),W/(2*scale),WORLD.w-W/(2*scale)),camY=clamp(s.y+(Math.sin(s.heading)*120),H/(2*scale),WORLD.h-H/(2*scale));
      ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#17252a";ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W/2+(Math.random()-.5)*sh,H/2+(Math.random()-.5)*sh);ctx.scale(scale,scale);ctx.translate(-camX,-camY);
      ctx.drawImage(surface,0,0);drawGantry(ctx,s.bridge);if(!s.powerTaken)drawPower(ctx,s.time);
      for(const o of s.objs)drawObject(ctx,o,s.time);
      for(const p of s.particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)}ctx.globalAlpha=1;
      drawTruck(ctx,s.x,s.y,s.z,s.heading,(keys.current.ShiftLeft||s.overdrive>0)&&s.nitroUnlocked,s.time);ctx.restore();
      ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="rgba(7,9,10,.9)";ctx.fillRect(22,20,600,106);ctx.strokeStyle="#ffffff2b";ctx.strokeRect(22,20,600,106);ctx.fillStyle="#e0a72e";ctx.font="700 14px Arial";ctx.fillText(`BREAKER YARD // GOLD DISTRICT // ${phaseLabel}`,42,45);ctx.fillStyle="#fff";ctx.font="700 19px Arial";ctx.fillText(objective(s),42,76);ctx.fillStyle="#a6adb4";ctx.font="13px Arial";ctx.fillText(status(s),42,103);
      ctx.fillStyle="rgba(7,9,10,.88)";ctx.fillRect(W-310,20,288,116);ctx.fillStyle="#fff";ctx.font="700 17px Arial";ctx.fillText(`${Math.round(s.score).toLocaleString()} // x${Math.max(1,s.combo)}`,W-288,48);ctx.fillStyle="#34383b";ctx.fillRect(W-288,68,238,15);ctx.fillStyle=s.overdrive>0?"#ff8b32":"#e04b2a";ctx.fillRect(W-288,68,238*s.nitro/100,15);ctx.fillStyle="#a6adb4";ctx.font="12px Arial";ctx.fillText(s.nitroUnlocked?`NITRO ${Math.round(s.nitro)}%${s.overdrive>0?` // OVERDRIVE ${Math.ceil(s.overdrive)}s`:""}`:"NITRO OFFLINE",W-288,102);ctx.fillText(fmt(s.time),W-288,122);
      minimap(ctx,s,W-224,H-190);if(s.messageT>0){ctx.fillStyle="rgba(5,6,7,.88)";ctx.fillRect(W/2-340,H-100,680,58);ctx.strokeStyle="#e0a72e";ctx.strokeRect(W/2-340,H-100,680,58);ctx.fillStyle="#fff";ctx.font="800 18px Arial";ctx.textAlign="center";ctx.fillText(s.message,W/2,H-64);ctx.textAlign="left"}
    };
    const loop=(now:number)=>{acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/60){step(1/60);acc-=1/60}draw();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf)
  },[autoDrive,brief,onComplete,phaseLabel,reducedFlash,shake]);
  const touch=(code:string,on:boolean)=>{keys.current[code]=on};
  return <section className="game-wrap gold-game"><canvas ref={canvasRef} width={1440} height={900} aria-label="Playing Breaker Yard gold district"/><button className="pause" onClick={togglePause} aria-label={paused?"Resume":"Pause"} disabled={brief}>{paused?"▶":"Ⅱ"}</button>{brief&&<div className="mission-brief"><span>GOLD DISTRICT // 01</span><h1>BREAKER YARD</h1><p>The county road is across the drainage cut. The direct lane is dead. Break into the yard, choose a route, and bring the conveyor down to make your own crossing.</p><div className="route-choices"><b>▲ JUMP ROUTE</b><b>◆ DESTRUCTION ROUTE</b><b>● POWER ROUTE</b></div><button className="primary" onClick={()=>setBrief(false)}>DROP THE BRAKE</button><small>WASD steer · Space jump · Shift nitro · Esc pause</small></div>}{paused&&<div className="mission-brief pause-menu"><span>GOLD DISTRICT // 01</span><h1>PAUSED</h1><p>Breaker Yard is on hold.</p><div className="pause-actions"><button className="primary" onClick={togglePause}>RESUME</button><button onClick={onExit}>RETURN TO MAP</button></div></div>}<div className="touch"><button onPointerDown={()=>touch("KeyA",true)} onPointerUp={()=>touch("KeyA",false)}>◀</button><button onPointerDown={()=>touch("KeyD",true)} onPointerUp={()=>touch("KeyD",false)}>▶</button><button className="jump" onPointerDown={()=>touch("Space",true)} onPointerUp={()=>touch("Space",false)}>JUMP</button><button className="nitro" onPointerDown={()=>touch("ShiftLeft",true)} onPointerUp={()=>touch("ShiftLeft",false)}>NITRO</button></div></section>
}

function objective(s:State){if(s.phase===0)return"Smash through the wrecking apron.";if(s.phase===1)return"Find the conveyor gantry. Destroy its three west-facing supports.";if(s.phase===2)return"Clear the fall zone.";if(s.phase===3)return"Cross the fallen conveyor and breach the reinforced county gate.";return"Reach the county road."}
function status(s:State){if(s.phase===0)return`LIGHT STRUCTURES ${Math.min(3,s.lightKills)} / 3 // NITRO UNLOCK`;if(s.phase===1)return`GANTRY SUPPORTS ${s.supports} / 3 // WEST-FACE IMPACTS`;if(s.phase===2)return`STRUCTURAL FAILURE ${Math.round(s.bridge*100)}%`;if(s.phase===3)return"NEW CONNECTION CREATED // GATE REQUIRES NITRO";return"EXTRACTION OPEN"}
function fmt(s:number){return`${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}`}
function minimap(ctx:CanvasRenderingContext2D,s:State,x:number,y:number){const w=190,h=145;ctx.fillStyle="rgba(4,6,7,.86)";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#59636e";ctx.strokeRect(x,y,w,h);ctx.strokeStyle="#9a7a36";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+15,y+115);ctx.lineTo(x+48,y+98);ctx.lineTo(x+72,y+65);ctx.lineTo(x+118,y+72);ctx.lineTo(x+146,y+38);ctx.lineTo(x+174,y+60);ctx.stroke();ctx.strokeStyle="#2c7fa3";ctx.beginPath();ctx.moveTo(x+150,y+5);ctx.lineTo(x+150,y+135);ctx.stroke();if(s.bridge>=1){ctx.strokeStyle="#e0a72e";ctx.beginPath();ctx.moveTo(x+140,y+62);ctx.lineTo(x+160,y+62);ctx.stroke()}ctx.fillStyle="#e04b2a";ctx.beginPath();ctx.arc(x+8+s.x/WORLD.w*(w-16),y+8+s.y/WORLD.h*(h-16),5,0,6.28);ctx.fill();ctx.fillStyle="#a6adb4";ctx.font="10px Arial";ctx.fillText("YARD TOPOLOGY",x+8,y+14)}
