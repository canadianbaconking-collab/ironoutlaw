type Rect={x:number;y:number;w:number;h:number};
type Wall=Rect&{kind:string};
type ObjectArt=Rect&{kind:string;dead:boolean;angle:number;hp:number;max:number;marked?:boolean};
const PI=Math.PI;
const rnd=(n:number)=>{let v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};

function poly(c:CanvasRenderingContext2D,points:number[],fill:string,stroke?:string,width=1){c.beginPath();c.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function line(c:CanvasRenderingContext2D,points:number[],color:string,width=2){c.beginPath();c.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function shadow(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,offset=20){c.fillStyle="rgba(3,8,10,.28)";c.fillRect(x+offset,y+offset,w,h)}
function hatch(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,spacing=24,color="#c0ae7b4a"){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.strokeStyle=color;c.lineWidth=3;for(let i=-h;i<w+h;i+=spacing){c.beginPath();c.moveTo(x+i,y+h);c.lineTo(x+i+h,y);c.stroke()}c.restore()}
function label(c:CanvasRenderingContext2D,x:number,y:number,text:string,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);c.fillStyle="#c2b7a188";c.font="800 24px system-ui";c.letterSpacing="3px";c.textAlign="center";c.fillText(text,0,0);c.restore()}
function road(c:CanvasRenderingContext2D,r:Rect,i:number){
  shadow(c,r.x,r.y,r.w,r.h,9);c.fillStyle="#374246";c.fillRect(r.x,r.y,r.w,r.h);
  const grd=c.createLinearGradient(r.x,r.y,r.x+r.w,r.y+r.h);grd.addColorStop(0,"#70808113");grd.addColorStop(.5,"#0d161913");grd.addColorStop(1,"#af9c651b");c.fillStyle=grd;c.fillRect(r.x,r.y,r.w,r.h);
  c.strokeStyle="#87918b42";c.lineWidth=5;c.strokeRect(r.x+6,r.y+6,r.w-12,r.h-12);
  for(let k=0;k<Math.floor(r.w*r.h/10500);k++){const x=r.x+12+rnd(i*900+k*2)*(r.w-24),y=r.y+12+rnd(i*900+k*2+1)*(r.h-24);c.fillStyle=k%3===0?"#98a09b27":"#121c2040";c.fillRect(x,y,10+rnd(k+20)*65,2+rnd(k+44)*9)}
  c.strokeStyle="#101a1e38";c.lineWidth=3;for(let k=0;k<Math.floor((r.w+r.h)/230);k++){const x=r.x+rnd(i*20+k)*r.w,y=r.y+rnd(i*23+k+5)*r.h;line(c,[x,y,x+15,y+8,x+23,y+29],"#111d2245",2)}
}
function container(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);shadow(c,-w/2,-h/2,w,h,12);c.fillStyle=color;c.fillRect(-w/2,-h/2,w,h);c.fillStyle="#d9d1a313";c.fillRect(-w/2+5,-h/2+6,w-10,13);c.strokeStyle="#0d1718aa";c.lineWidth=4;c.strokeRect(-w/2,-h/2,w,h);c.strokeStyle="#11191a55";c.lineWidth=3;for(let n=-w/2+16;n<w/2-8;n+=15)line(c,[n,-h/2+5,n,h/2-5],"#121a1d80",2);c.fillStyle="#e3d2ab88";c.fillRect(-w/2+10,-h/2+12,18,4);c.restore()}
function building(c:CanvasRenderingContext2D,w:Wall,i:number){const {x,y,h}=w,width=w.w;if(w.kind==="fence"){shadow(c,x,y,width,h,8);c.fillStyle="#8b8f83";c.fillRect(x,y,width,h);hatch(c,x,y,width,h,16,"#1522269a");for(let yy=y;yy<y+h;yy+=70){c.fillStyle="#d2b266";c.fillRect(x-7,yy,10,12)}return}
  shadow(c,x,y,width,h,28);c.fillStyle="#111d20";c.fillRect(x-10,y-10,width+20,h+20);
  const palettes=["#67716b","#586668","#766f5c","#536260","#6b756e","#686a5c","#566369","#727569"];
  c.fillStyle=palettes[i%palettes.length];c.fillRect(x,y,width,h);
  c.fillStyle="#9fa99a22";c.fillRect(x+13,y+12,width-26,19);c.fillStyle="#101b2070";c.fillRect(x+18,y+h-35,width-36,17);
  c.strokeStyle="#1b2728ad";c.lineWidth=5;for(let q=45;q<width-30;q+=84)line(c,[x+q,y+9,x+q,y+h-9],"#233035a8",5);
  c.strokeStyle="#d5d6b846";c.lineWidth=6;c.strokeRect(x+4,y+4,width-8,h-8);
  if(i%3===0){c.fillStyle="#202d30";c.fillRect(x+width*.55,y+h*.28,width*.25,h*.31);for(let q=0;q<3;q++)line(c,[x+width*.55,y+h*(.31+q*.09),x+width*.8,y+h*(.31+q*.09)],"#a6aca347",3)}
  else{c.fillStyle="#293437";c.fillRect(x+width*.15,y+h*.22,width*.22,h*.13);c.fillRect(x+width*.49,y+h*.22,width*.22,h*.13);c.fillStyle="#aec7b52e";c.fillRect(x+width*.17,y+h*.23,width*.18,h*.05)}
  if(i===0||i===4||i===7){c.fillStyle="#c5b58a";c.fillRect(x+24,y+h-70,175,35);c.fillStyle="#263135";c.font="800 19px system-ui";c.fillText(i===0?"IRONWORKS":i===4?"SCRAP  /  03":"COUNTY UTILITIES",x+34,y+h-45)}
  c.fillStyle="#aa6d3890";for(let q=0;q<width/105;q++){const sx=x+25+q*99,sy=y+15+(q%3)*12;c.fillRect(sx,sy,29,4)}
}
function machinery(c:CanvasRenderingContext2D){
  // Fixed industrial landmarks keep each route recognizable while moving.
  for(const [x,y,color] of [[420,1310,"#a66d37"],[1870,620,"#a66d37"],[2810,1510,"#687d7b"]] as const){shadow(c,x,y,120,65);c.fillStyle=color;c.fillRect(x,y,120,65);for(let k=0;k<3;k++){c.fillStyle="#263237";c.beginPath();c.arc(x+25+k*35,y+34,13,0,2*PI);c.fill()}c.fillStyle="#d9bd75";c.fillRect(x+12,y+8,68,8)}
  // Crusher: a concrete well, toothed jaws, and high-contrast power route.
  shadow(c,1145,2010,360,330);c.fillStyle="#7f8580";c.fillRect(1145,2010,360,330);c.fillStyle="#233037";c.fillRect(1190,2045,270,245);
  for(let k=0;k<6;k++){poly(c,[1204+k*43,2125,1226+k*43,2104,1247+k*43,2125,1226+k*43,2146],"#818987")}
  hatch(c,1150,2015,355,55,20,"#d4ae57a8");label(c,1325,2365,"CRUSHER / POWER");
  // Scrap stacks are irregular silhouettes, separated from destructible pickups.
  for(let k=0;k<31;k++){const zone=k<12?[1010,880,670,320]:k<20?[1850,2030,420,320]:[370,890,430,300];const x=zone[0]+rnd(k*7)*zone[2],y=zone[1]+rnd(k*7+1)*zone[3],r=13+rnd(k*7+2)*33;shadow(c,x-r,y-r,r*2,r*1.4,9);poly(c,[x-r,y+r*.45,x-r*.85,y-r*.4,x,y-r,x+r*.9,y-r*.3,x+r,y+r*.5],k%3===0?"#956a42":k%3===1?"#717a78":"#48575b");line(c,[x-r*.5,y,x+r*.4,y-r*.35,x+r*.75,y+r*.2],"#c4ad834d",3)}
  container(c,430,1120,150,72,"#8e563a",-.08);container(c,630,1110,150,72,"#607574",.07);container(c,2110,700,190,76,"#a06d44",.1);container(c,2870,1860,180,76,"#647578",-.1);
  // Crane boom reads as a real landmark from several approach angles.
  shadow(c,2020,360,115,95);c.fillStyle="#c5a65c";c.fillRect(2020,360,115,95);line(c,[2077,405,2190,275,2435,265],"#242d2e",23);line(c,[2077,405,2190,275,2435,265],"#d6aa4b",13);for(let n=0;n<7;n++)line(c,[2180+n*33,278,2190+n*33,326],"#293238",3);line(c,[2425,267,2425,435],"#161e22",4);c.fillStyle="#d0a548";c.fillRect(2406,425,38,24);
}
export function makeYardSurface(roads:Rect[],walls:Wall[]){const canvas=document.createElement("canvas");canvas.width=3300;canvas.height=2500;const c=canvas.getContext("2d")!;
  c.fillStyle="#555747";c.fillRect(0,0,3300,2500);
  for(let k=0;k<3500;k++){const x=rnd(k*3)*3300,y=rnd(k*3+1)*2500,sz=1+rnd(k*3+2)*12;c.fillStyle=k%5===0?"#b9aa7952":k%3===0?"#252e3050":"#847d5a42";c.fillRect(x,y,sz,sz*.5)}
  for(const [x,y,w,h] of [[70,1270,710,390],[80,2150,750,290],[880,650,900,300],[1850,1450,600,600],[2730,320,560,620]] as number[][]){c.fillStyle="#6e6e59";c.fillRect(x,y,w,h);for(let i=0;i<32;i++){const px=x+rnd(x+i)*w,py=y+rnd(y+i)*h;line(c,[px,py,px+15,py+4],"#b3a98435",2)}}
  roads.forEach((r,i)=>road(c,r,i));
  // Directional paint, junction markings, and cracks communicate the route without UI arrows.
  for(const [x,y,angle] of [[570,1915,0],[910,1410,-PI/2],[1620,1300,PI/2],[1760,2170,0],[2310,1150,0],[2790,1160,0]] as number[][]){c.save();c.translate(x,y);c.rotate(angle);poly(c,[-35,-14,20,-14,20,-25,55,0,20,25,20,14,-35,14],"#d8c287a6");c.restore()}
  hatch(c,768,1582,95,325,26,"#d5b96d92");hatch(c,1725,1090,65,260,21,"#d5b96d75");
  c.fillStyle="#121f24";c.fillRect(2505,0,200,2500);for(let k=0;k<27;k++){const y=k*102+25;line(c,[2520,y,2560,y-12,2630,y+7,2690,y-10],k%2?"#406372a5":"#6a817d99",6)}
  c.fillStyle="#7d827b";c.fillRect(2493,0,12,2500);c.fillRect(2705,0,11,2500);for(let y=0;y<2500;y+=140){c.fillStyle="#2e393c";c.fillRect(2480,y,13,28);c.fillRect(2716,y+40,12,28)}
  walls.forEach((w,i)=>{if(w.kind!=="ravine")building(c,w,i)});machinery(c);
  for(const [x,y,r] of [[620,1590,245],[1540,1020,310],[2130,1230,350],[2920,1120,260]] as number[][]){const glow=c.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,"#ffc46c40");glow.addColorStop(.3,"#e6a35121");glow.addColorStop(1,"#e6a35100");c.fillStyle=glow;c.fillRect(x-r,y-r,r*2,r*2);c.fillStyle="#f4c879";c.fillRect(x-7,y-7,14,14);c.fillStyle="#272f30";c.fillRect(x-3,y-3,6,6)}
  // Painted destination names live on the ground and are less visually loud than HUD labels.
  label(c,380,2040,"WRECKING APRON");label(c,1240,985,"STACKED SCRAP");label(c,1730,1615,"SCALE HOUSE");label(c,2180,1650,"MAGNET ALLEY");label(c,2890,1340,"COUNTY ROAD");
  for(const [x,y] of [[2070,1010],[2200,1010],[2360,1010],[2050,1380],[2250,1430]]){shadow(c,x,y,40,25,8);c.fillStyle="#cfa747";c.fillRect(x,y,40,25);c.fillStyle="#243137";c.fillRect(x+12,y+7,16,11)}
  return canvas;
}
export function drawGantry(c:CanvasRenderingContext2D,bridge:number){shadow(c,2300,840,155,560,25);c.fillStyle="#263337";c.fillRect(2305,850,140,525);
  for(let y=880;y<1390;y+=68){c.fillStyle="#758382";c.fillRect(2314,y,122,30);line(c,[2315,y+27,2435,y+1],"#c29b4b",6)}
  for(const y of [820,1360]){shadow(c,2250,y,300,44,9);c.fillStyle="#a17841";c.fillRect(2250,y,300,44);for(let x=2260;x<2530;x+=40)line(c,[x,y+4,x+34,y+40],"#293237",4)}
  if(bridge>0){c.save();c.translate(2470+bridge*165,1165);c.rotate(-1.57*(1-bridge));shadow(c,-260,-75,520,150,13);c.fillStyle="#5e6b6c";c.fillRect(-260,-75,520,150);for(let x=-245;x<255;x+=33){c.fillStyle="#a4824a";c.fillRect(x,-75,9,150)}c.fillStyle="#b9a162";c.fillRect(-250,-58,500,8);c.fillRect(-250,50,500,8);c.restore()}
}
export function drawPower(c:CanvasRenderingContext2D,time:number){c.save();c.translate(1350,2220);c.shadowColor="#ffa83e";c.shadowBlur=25;c.fillStyle="#df9d41";c.beginPath();c.arc(0,0,39+Math.sin(time*3)*4,0,2*PI);c.fill();c.shadowBlur=0;c.fillStyle="#29343a";c.fillRect(-23,-21,46,42);poly(c,[-3,-28,16,-4,3,-4,8,25,-17,-6,-3,-6],"#ffe8a0");c.restore()}
export function drawObject(c:CanvasRenderingContext2D,o:ObjectArt,time:number){c.save();c.translate(o.x,o.y);c.rotate(o.angle+(o.dead?.5:0));if(o.dead)c.globalAlpha=.45;const {w,h}=o;shadow(c,-w/2,-h/2,w,h,9);
  if(o.kind==="shed"){c.fillStyle="#483f36";c.fillRect(-w/2,-h/2,w,h);poly(c,[-w/2,-h/2,w/2,-h/2,w/2,h/2,-w/2,h/2],"#a26843","#412f29",4);for(let x=-w/2+11;x<w/2;x+=17)line(c,[x,-h/2+4,x,h/2-4],"#6d4232",3);c.fillStyle="#344143";c.fillRect(-w/2+12,-h/2+12,31,22)}
  else if(o.kind==="scrap"){poly(c,[-w*.48,h*.27,-w*.38,-h*.26,-w*.12,-h*.46,w*.22,-h*.31,w*.46,-h*.06,w*.38,h*.39],"#758180","#243135",4);line(c,[-w*.4,h*.13,w*.1,-h*.23,w*.33,h*.13],"#c6b389",5);c.fillStyle="#ae6a43";c.fillRect(-12,-8,29,16)}
  else if(o.kind==="support"){c.fillStyle="#273438";c.fillRect(-w*.65,-h*.65,w*1.3,h*1.3);c.fillStyle="#b8934b";c.fillRect(-w*.42,-h*.42,w*.84,h*.84);c.fillStyle="#374448";c.fillRect(-w*.22,-h*.45,w*.44,h*.9);for(let y=-h*.4;y<h*.4;y+=16)line(c,[-w*.42,y,-w*.24,y+12],"#e2c574",4);c.fillStyle="#ffe2a2";c.beginPath();c.arc(-w*.62,0,5+Math.sin(time*4)*2,0,2*PI);c.fill()}
  else if(o.kind==="gate"){c.fillStyle="#c59b52";c.fillRect(-w/2,-h/2,w,h);for(let y=-h/2+14;y<h/2;y+=28)line(c,[-w/2+6,y,w/2-6,y+14],"#29353a",10);c.fillStyle="#f0d690";c.fillRect(-w/2,-h/2,10,h);c.fillRect(w/2-10,-h/2,10,h)}
  else{c.fillStyle="#8d938b";c.fillRect(-w/2,-h/2,w,h);hatch(c,-w/2,-h/2,w,h,22,"#49545399");c.strokeStyle="#c1c1a2";c.lineWidth=4;c.strokeRect(-w/2,-h/2,w,h)}
  if(!o.dead&&o.hp<o.max){line(c,[-w*.37,-h*.29,-w*.06,h*.18,w*.28,-h*.29],"#242c2d",5)}c.restore()}
export function drawTruck(c:CanvasRenderingContext2D,x:number,y:number,z:number,heading:number,boost:boolean,time:number){c.save();c.translate(x,y-z);c.rotate(heading);c.fillStyle="#0813188c";c.beginPath();c.ellipse(9,12+z*.35,71,42,0,0,2*PI);c.fill();if(boost){poly(c,[-49,-19,-110,-10,-59,0,-116,11,-50,21],"#e88333");poly(c,[-55,-8,-89,0,-55,8],"#ffe0a2")}
  for(const yy of [-42,30]){c.fillStyle="#111a1e";c.fillRect(-39,yy,35,15);c.fillRect(25,yy,31,15);c.fillStyle="#667171";c.fillRect(-31,yy+3,11,7);c.fillRect(36,yy+3,9,7)}
  poly(c,[-57,-31,34,-31,63,-22,70,0,63,22,34,31,-57,31],"#242d2d","#0c1417",5);c.fillStyle="#a76739";c.fillRect(-40,-28,67,56);c.fillStyle="#d28a4c";c.fillRect(-37,-26,61,8);c.fillStyle="#35474b";c.fillRect(27,-27,26,54);line(c,[27,-26,27,27],"#e0b268",4);c.fillStyle="#161f22";c.fillRect(-53,-22,14,44);for(const yy of [-21,14]){c.fillStyle="#f4d392";c.fillRect(59,yy,10,8)}c.fillStyle="#a7aaa0";c.fillRect(-58,-26,6,52);c.fillRect(67,-18,5,36);c.restore()}
