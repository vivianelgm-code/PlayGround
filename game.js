import * as THREE from 'three';
const $=s=>document.querySelector(s), canvas=$('#scene'), mapCanvas=$('#map'), mapCtx=mapCanvas.getContext('2d');
const ui={intro:$('#intro'),result:$('#result'),start:$('#startBtn'),again:$('#againBtn'),timer:$('#timer'),lap:$('#lap'),lapProgress:$('#lapProgress'),coins:$('#coins'),speed:$('#speed'),speedArc:$('#speedArc'),countdown:$('#countdown'),toast:$('#toast'),pause:$('#pauseChip'),sound:$('#soundBtn'),touch:$('#touchControls')};
const scene=new THREE.Scene();scene.background=new THREE.Color('#f6a96a');scene.fog=new THREE.Fog('#b9be83',90,235);
const camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,450);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
scene.add(new THREE.HemisphereLight('#fff0d3','#567444',2.25));const sun=new THREE.DirectionalLight('#fff0c8',3.2);sun.position.set(-65,92,-45);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;sun.shadow.bias=-.0004;scene.add(sun);const fill=new THREE.DirectionalLight('#91baff',.65);fill.position.set(45,28,62);scene.add(fill);
const mat=(color,roughness=.8,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
const track={rx:42,rz:27,width:12,samples:256},world=new THREE.Group();scene.add(world);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),mat('#659451'));ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;world.add(ground);
function pointOnTrack(t,offset=0){const x=track.rx*Math.cos(t),z=track.rz*Math.sin(t),dx=-track.rx*Math.sin(t),dz=track.rz*Math.cos(t),len=Math.hypot(dx,dz),nx=dz/len,nz=-dx/len;return new THREE.Vector3(x+nx*offset,0,z+nz*offset);}
function strip(inner,outer,material,y){const ps=[],ix=[];for(let i=0;i<=track.samples;i++){const t=i/track.samples*Math.PI*2,a=pointOnTrack(t,inner),b=pointOnTrack(t,outer);ps.push(a.x,y,a.z,b.x,y,b.z);if(i<track.samples){const n=i*2;ix.push(n,n+2,n+1,n+1,n+2,n+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));g.setIndex(ix);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.receiveShadow=true;world.add(m);}
strip(-track.width/2,track.width/2,mat('#4b5155',.92),-.015);strip(-track.width/2-1.6,-track.width/2,mat('#e86651'),.005);strip(track.width/2,track.width/2+1.6,mat('#e86651'),.005);
const cream=mat('#f4e9cd'),red=mat('#e86651');for(let i=0;i<track.samples;i+=4){const t=i/track.samples*Math.PI*2;for(const side of [-1,1]){const p=pointOnTrack(t,side*(track.width/2+.8)),m=new THREE.Mesh(new THREE.BoxGeometry(1.05,.14,1.05),i%8===0?cream:red);m.position.set(p.x,.075,p.z);m.rotation.y=-t;m.receiveShadow=true;m.castShadow=true;world.add(m);}}
for(let i=0;i<64;i++){const t=i/64*Math.PI*2,p=pointOnTrack(t),m=new THREE.Mesh(new THREE.BoxGeometry(1.5,.025,.13),mat('#f7d88e'));m.position.set(p.x,.015,p.z);m.rotation.y=Math.atan2(track.rx*Math.sin(t),track.rz*Math.cos(t));world.add(m);}
const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(12,32,24),new THREE.MeshBasicMaterial({color:'#ffdf9a'}));sunDisc.position.set(-105,52,-175);scene.add(sunDisc);const sunGlow=new THREE.PointLight('#ffd18c',160,260,2);sunGlow.position.copy(sunDisc.position);scene.add(sunGlow);
function addTree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.28,.44,3.8,7),mat('#76563a'));trunk.position.y=1.9;trunk.castShadow=true;g.add(trunk);const colors=['#2f694c','#39764f','#558958'];for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(2.5-i*.32,1),mat(colors[((i+Math.floor(x+z))%3+3)%3]));c.position.set((i%2-.5)*.8,4.2+i*1.35,(i-1)*.35);c.scale.set(1.1,.95,1);c.castShadow=true;g.add(c);}world.add(g);}
for(let i=0;i<58;i++){const t=i/58*Math.PI*2,s=i%2?1:-1,p=pointOnTrack(t,s*(track.width/2+8+(i%4)*2));addTree(p.x,p.z,.72+(i%5)*.12);}
for(let i=0;i<90;i++){const x=(Math.random()-.5)*68,z=(Math.random()-.5)*42,n=x*x/(track.rx*track.rx)+z*z/(track.rz*track.rz);if(n<.65||n>2.2)continue;const f=new THREE.Mesh(new THREE.SphereGeometry(.12,6,5),mat(i%3?'#fff0c0':'#f1a0a2'));f.position.set(x,.12,z);world.add(f);}

function billboard(t,side,title,color){
  const p=pointOnTrack(t,side*(track.width/2+6));
  const post=new THREE.Mesh(new THREE.BoxGeometry(.24,3.6,.24),mat('#624c38'));post.position.set(p.x,1.8,p.z);post.castShadow=true;world.add(post);
  const board=new THREE.Group();board.position.set(p.x,3.3,p.z);board.rotation.y=-t+Math.PI/2;
  const face=new THREE.Mesh(new THREE.BoxGeometry(7,2.1,.22),mat(color,.55,{emissive:color,emissiveIntensity:.13}));face.castShadow=true;board.add(face);
  const sc=document.createElement('canvas');sc.width=512;sc.height=128;const c=sc.getContext('2d');c.fillStyle=color;c.fillRect(0,0,512,128);c.fillStyle='#fff4d8';c.font='900 62px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(title,256,61);
  const tx=new THREE.CanvasTexture(sc);tx.colorSpace=THREE.SRGBColorSpace;const text=new THREE.Mesh(new THREE.PlaneGeometry(6.7,1.65),new THREE.MeshBasicMaterial({map:tx}));text.position.z=.13;board.add(text);world.add(board);
}
billboard(.55,1,'SUNSET SPRINT','#b7443f');billboard(2.9,-1,'GO! GO!','#397c68');billboard(4.65,1,'TURBO!','#b97827');

// Checkered start/finish gantry.
const startPoint=pointOnTrack(-Math.PI/2),startYaw=-Math.PI/2,gantry=new THREE.Group();gantry.position.set(startPoint.x,0,startPoint.z);gantry.rotation.y=startYaw;world.add(gantry);
for(const x of [-7,7]){const pole=new THREE.Mesh(new THREE.BoxGeometry(.48,6,.48),mat('#f3e7d0'));pole.position.set(x,3,0);pole.castShadow=true;gantry.add(pole);}
const beam=new THREE.Mesh(new THREE.BoxGeometry(15,.75,.7),mat('#f3e7d0'));beam.position.y=6;gantry.add(beam);
for(let x=-7.2;x<7.2;x+=1.2)for(let y=5.1;y<6.9;y+=.9){const tile=new THREE.Mesh(new THREE.BoxGeometry(1.2,.9,.72),mat((Math.round((x+7.2)/1.2)+Math.round((y-5.1)/.9))%2?'#273244':'#fff0d2'));tile.position.set(x,y,0);gantry.add(tile);}

// A bright little kart, built around local -Z as its forward direction.
const kart=new THREE.Group();world.add(kart);
const kartPaint=mat('#f25843',.34,{metalness:.12}),dark=mat('#202d38',.65),rubber=mat('#161b20',.88),gold=mat('#ffc64f',.36,{metalness:.12});
function box(parent,size,material,pos){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),material);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
box(kart,[1.55,.42,2.25],kartPaint,[0,.64,0]);
const nose=box(kart,[1.18,.2,.72],gold,[0,.83,-1.27]);nose.rotation.x=-.08;
box(kart,[.92,.36,.78],mat('#f7eee0',.38),[0,.93,.12]);
box(kart,[.76,.38,.68],mat('#ef6047',.36),[0,1.27,.25]);
const helmet=new THREE.Mesh(new THREE.SphereGeometry(.37,16,12),mat('#f7c95e',.35));helmet.position.set(0,1.78,-.03);helmet.scale.set(1,.95,1);helmet.castShadow=true;kart.add(helmet);
const visor=new THREE.Mesh(new THREE.BoxGeometry(.52,.14,.12),mat('#283b4b',.25,{metalness:.25}));visor.position.set(0,1.81,-.34);kart.add(visor);
for(const z of [-.78,.78]){const axle=new THREE.Group();axle.position.set(0,.37,z);kart.add(axle);for(const x of [-.84,.84]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.24,16),rubber);w.rotation.z=Math.PI/2;w.position.x=x;w.castShadow=true;axle.add(w);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.255,12),x<0?gold:mat('#cad2d4',.4));hub.rotation.z=Math.PI/2;hub.position.x=x;axle.add(hub);}if(z<0)kart.userData.frontAxle=axle;}
for(const x of [-.52,.52]){const light=new THREE.Mesh(new THREE.BoxGeometry(.23,.12,.08),mat('#fff3bf',.25,{emissive:'#ffe7a4',emissiveIntensity:.8}));light.position.set(x,.72,-1.15);kart.add(light);}

const pickupMat=mat('#ffd45b',.28,{metalness:.45,emissive:'#b87418',emissiveIntensity:.28});
const pickups=[];for(let i=0;i<24;i++){const t=-Math.PI/2+i/24*Math.PI*2,side=(i%3-1)*2.1,p=pointOnTrack(t,side);const g=new THREE.Group();g.position.set(p.x,1.05,p.z);const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.15,8,18),pickupMat);ring.rotation.x=Math.PI/2;g.add(ring);const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),mat('#fff0ac',.26,{emissive:'#ffbc3c',emissiveIntensity:.4}));g.add(gem);world.add(g);pickups.push({group:g,active:true,phase:i*.7});}
const boostMat=mat('#43e4dc',.3,{emissive:'#16a9b5',emissiveIntensity:.65});const boosts=[];
for(const t of [.1,1.55,3.05,4.62]){const p=pointOnTrack(t);const g=new THREE.Group();g.position.set(p.x,.07,p.z);g.rotation.y=-t;for(let lane=-1;lane<=1;lane++){const arrow=new THREE.Mesh(new THREE.BoxGeometry(.52,.045,2.4),boostMat);arrow.position.x=lane*.78;g.add(arrow);}world.add(g);boosts.push({group:g,point:p,used:false});}

const state={mode:'intro',time:60,elapsed:0,countdown:0,speed:0,yaw:-Math.PI/2,steer:0,coins:0,laps:0,lapElapsed:0,bestLap:Infinity,angle:-Math.PI/2,progress:0,boost:0,toastTime:0};
const keys=new Set();let soundOn=true,audio=null,lastFrame=performance.now();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function formatTime(v){if(!Number.isFinite(v))return '—';const m=Math.floor(v/60),s=(v%60).toFixed(2).padStart(5,'0');return m?`${m}:${s}`:s;}
function showToast(message){ui.toast.textContent=message;ui.toast.classList.add('show');state.toastTime=1.5;}
function blip(freq=660,duration=.11){if(!soundOn)return;try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.08,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}catch{}}
function trackCoordinates(){const t=Math.atan2(kart.position.z/track.rz,kart.position.x/track.rx);const center=pointOnTrack(t),n=new THREE.Vector3(Math.cos(t)/track.rx,0,Math.sin(t)/track.rz).normalize();return {t,center,offset:(kart.position.x-center.x)*n.x+(kart.position.z-center.z)*n.z};}
function placeKart(){const p=pointOnTrack(-Math.PI/2);kart.position.set(p.x,.04,p.z);kart.rotation.y=-Math.PI/2;}
placeKart();
function resetRun(){state.time=60;state.elapsed=0;state.countdown=0;state.speed=0;state.yaw=-Math.PI/2;state.steer=0;state.coins=0;state.laps=0;state.lapElapsed=0;state.bestLap=Infinity;state.angle=-Math.PI/2;state.progress=0;state.boost=0;state.toastTime=0;placeKart();for(const p of pickups){p.active=true;p.group.visible=true;}for(const b of boosts)b.used=false;ui.coins.textContent='00';ui.lap.innerHTML='1 <small>/ 3</small>';ui.lapProgress.style.width='0%';ui.timer.textContent='60.0';ui.countdown.textContent='';ui.toast.classList.remove('show');}
function beginRun(){resetRun();state.mode='countdown';state.countdown=3.65;ui.intro.classList.add('hidden');ui.result.classList.add('hidden');ui.pause.classList.add('hidden');}
function finishRun(won){state.mode='finished';state.speed=0;ui.countdown.textContent='';ui.resultLaps.textContent=state.laps;ui.resultCoins.textContent=state.coins;ui.resultBest.textContent=formatTime(state.bestLap);ui.resultKicker.textContent=won?'FINISH LINE':'TIME\'S UP';$('#resultTitle').innerHTML=won?'SUNSET<br><em>CHAMPION.</em>':'NICE<br><em>DRIVING.</em>';ui.resultCopy.textContent=won?`Three laps in ${formatTime(state.elapsed)}. What a run!`:`You made ${state.laps} of 3 laps. The track is yours—try again?`;ui.result.classList.remove('hidden');blip(won?880:440,.28);}
function togglePause(){if(state.mode==='racing'){state.mode='paused';ui.pause.classList.remove('hidden');keys.clear();}else if(state.mode==='paused'){state.mode='racing';ui.pause.classList.add('hidden');lastFrame=performance.now();}}
ui.start.addEventListener('click',beginRun);ui.again.addEventListener('click',beginRun);
ui.sound.addEventListener('click',()=>{soundOn=!soundOn;ui.sound.innerHTML=`♪ <span>SOUND ${soundOn?'ON':'OFF'}</span>`;ui.sound.setAttribute('aria-label',soundOn?'Turn sound off':'Turn sound on');if(soundOn)blip(740);});
window.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();if(key==='r'){beginRun();return;}if(key===' '){togglePause();return;}if(key==='enter'&&state.mode==='intro'){beginRun();return;}keys.add(key);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
for(const button of ui.touch.querySelectorAll('[data-key]')){const key=button.dataset.key.toLowerCase();const down=e=>{e.preventDefault();keys.add(key);button.setPointerCapture?.(e.pointerId);};const up=e=>{e.preventDefault();keys.delete(key);};button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',up);}

function drawMap(){const w=mapCanvas.width,h=mapCanvas.height;mapCtx.clearRect(0,0,w,h);mapCtx.lineCap='round';mapCtx.lineJoin='round';mapCtx.beginPath();for(let i=0;i<=120;i++){const t=i/120*Math.PI*2,x=w/2+Math.cos(t)*69,y=h/2+Math.sin(t)*39;i?mapCtx.lineTo(x,y):mapCtx.moveTo(x,y);}mapCtx.strokeStyle='rgba(255,255,255,.82)';mapCtx.lineWidth=10;mapCtx.stroke();mapCtx.strokeStyle='#4b5155';mapCtx.lineWidth=6;mapCtx.stroke();const {t}=trackCoordinates(),x=w/2+Math.cos(t)*69,y=h/2+Math.sin(t)*39;mapCtx.beginPath();mapCtx.arc(x,y,4.5,0,Math.PI*2);mapCtx.fillStyle='#ffcb59';mapCtx.shadowColor='#ffcb59';mapCtx.shadowBlur=9;mapCtx.fill();mapCtx.shadowBlur=0;mapCtx.beginPath();mapCtx.arc(w/2,h/2+39,2.4,0,Math.PI*2);mapCtx.fillStyle='#e96652';mapCtx.fill();}
function updateCamera(dt){const behind=new THREE.Vector3(0,5.6,10.6).applyAxisAngle(new THREE.Vector3(0,1,0),kart.rotation.y);const desired=kart.position.clone().add(behind);camera.position.lerp(desired,1-Math.exp(-dt*3.3));const forward=new THREE.Vector3(-Math.sin(kart.rotation.y),0,-Math.cos(kart.rotation.y));const target=kart.position.clone().add(forward.multiplyScalar(5));target.y+=1.35;camera.lookAt(target);}
function update(dt,now){
  for(const p of pickups){p.group.rotation.y=now*.0015+p.phase;p.group.position.y=1.03+Math.sin(now*.002+p.phase)*.16;}
  for(const b of boosts){b.group.children.forEach((o,i)=>{o.material=state.boost>0?gold:boostMat;o.position.z=-.1+Math.sin(now*.004+i)*.15;});}
  if(state.toastTime>0){state.toastTime-=dt;if(state.toastTime<=0)ui.toast.classList.remove('show');}
  if(state.mode==='countdown'){
    state.countdown-=dt;ui.countdown.textContent=state.countdown>.65?String(Math.ceil(state.countdown-.65)):'GO!';ui.countdown.classList.toggle('go',state.countdown<=.65);
    if(state.countdown<=.65&&state.countdown+dt>.65)blip(520,.15);
    if(state.countdown<=0){state.mode='racing';state.elapsed=0;state.lapElapsed=0;state.angle=trackCoordinates().t;state.progress=0;ui.countdown.textContent='';ui.countdown.classList.remove('go');blip(920,.2);}
  }else if(state.mode==='racing'){
    const forward=keys.has('w')||keys.has('arrowup'),reverse=keys.has('s')||keys.has('arrowdown'),left=keys.has('a')||keys.has('arrowleft'),right=keys.has('d')||keys.has('arrowright');
    const steer=(right?1:0)-(left?1:0);state.steer+=(steer-state.steer)*Math.min(1,dt*8);
    state.elapsed+=dt;state.lapElapsed+=dt;state.time=Math.max(0,60-state.elapsed);state.boost=Math.max(0,state.boost-dt);
    const top=state.boost>0?42:32;if(forward)state.speed+=19*dt;else if(reverse)state.speed-=25*dt;else state.speed-=Math.sign(state.speed)*5.5*dt;
    if(Math.abs(state.speed)<.08&&!forward&&!reverse)state.speed=0;state.speed=clamp(state.speed,-8,top);
    if(Math.abs(state.speed)>.5)state.yaw-=state.steer*(.62+Math.min(Math.abs(state.speed),34)*.037)*dt*Math.sign(state.speed);
    const dir=new THREE.Vector3(-Math.sin(state.yaw),0,-Math.cos(state.yaw));kart.position.addScaledVector(dir,state.speed*dt);kart.rotation.y=state.yaw;
    if(kart.userData.frontAxle)kart.userData.frontAxle.rotation.y=-state.steer*.42;
    const {t,offset}=trackCoordinates(),onRoad=Math.abs(offset)<track.width/2+.5;
    if(!onRoad)state.speed*=Math.exp(-dt*1.35);
    if(Math.abs(offset)>track.width/2+10){const pull=pointOnTrack(t);kart.position.x+=(pull.x-kart.position.x)*Math.min(.035,dt*.35);kart.position.z+=(pull.z-kart.position.z)*Math.min(.035,dt*.35);}
    let delta=t-state.angle;if(delta>Math.PI)delta-=Math.PI*2;if(delta< -Math.PI)delta+=Math.PI*2;state.angle=t;
    if(onRoad&&delta>0&&delta<.35){state.progress+=delta;if(state.progress>=Math.PI*2){state.progress-=Math.PI*2;state.laps++;state.bestLap=Math.min(state.bestLap,state.lapElapsed);state.lapElapsed=0;showToast(state.laps>=3?'FINISH!':`LAP ${state.laps+1} — KEEP PUSHING`);blip(740,.2);if(state.laps>=3){finishRun(true);}}}
    for(const p of pickups){if(p.active&&kart.position.distanceTo(p.group.position)<1.9){p.active=false;p.group.visible=false;state.coins++;ui.coins.textContent=String(state.coins).padStart(2,'0');showToast('+1 SUN COIN');blip(980,.1);}}
    for(const b of boosts){if(!b.used&&Math.hypot(kart.position.x-b.point.x,kart.position.z-b.point.z)<3){b.used=true;state.boost=2.8;state.speed=Math.min(42,state.speed+9);showToast('TURBO BOOST!');blip(520,.24);}}
    ui.timer.textContent=state.time.toFixed(1);ui.timer.parentElement.classList.toggle('urgent',state.time<10);ui.lap.innerHTML=`${Math.min(state.laps+1,3)} <small>/ 3</small>`;ui.lapProgress.style.width=`${Math.min(100,state.progress/(Math.PI*2)*100)}%`;ui.speed.textContent=String(Math.round(Math.abs(state.speed)*5.6)).padStart(3,'0');const ratio=clamp(Math.abs(state.speed)*5.6/180,0,1);ui.speedArc.style.strokeDashoffset=String(126*(1-ratio));ui.speedArc.style.stroke=state.boost>0?'#4ce6dc':'#ffc857';
    if(state.time<=0&&state.mode==='racing')finishRun(false);
  }else{state.speed*=Math.exp(-dt*4);}
  updateCamera(dt);drawMap();
}
function frame(now){const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;update(dt,now);renderer.render(scene,camera);requestAnimationFrame(frame);}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);}
window.addEventListener('resize',resize);updateCamera(1);drawMap();requestAnimationFrame(frame);



