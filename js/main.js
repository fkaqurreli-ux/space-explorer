import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {PLANETS,TEX} from './planets.js';
import {CameraFlight} from './camera.js';
import {PlanetAudio} from './audio.js';

const $=s=>document.querySelector(s), canvas=$('#space');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x02050b);scene.fog=new THREE.FogExp2(0x02050b,.0007);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,1800);camera.position.set(0,34,68);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.055;controls.minDistance=1.5;controls.maxDistance=600;controls.maxPolarAngle=Math.PI*.94;
const flight=new CameraFlight(camera,controls);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.42,.45,.84));
scene.add(new THREE.AmbientLight(0x8197bb,.18));
const sunLight=new THREE.PointLight(0xffdfb5,1900,0,1.35);scene.add(sunLight);
const manager=new THREE.LoadingManager();manager.onLoad=()=>$('#loading').classList.add('done');manager.onError=u=>console.warn('Texture load failed:',u);
const loader=new THREE.TextureLoader(manager),textures=new Map();
function tex(file){if(!textures.has(file)){const t=loader.load(TEX+file);t.colorSpace=THREE.SRGBColorSpace;textures.set(file,t)}return textures.get(file)}
function remote(url){const t=loader.load(url);t.colorSpace=THREE.SRGBColorSpace;return t}

// Sun, layered corona and a dense deep-space star field.
const sun=new THREE.Mesh(new THREE.SphereGeometry(2.35,72,72),new THREE.MeshBasicMaterial({color:0xffbd62}));scene.add(sun);
const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=256;const gx=glowCanvas.getContext('2d'),gg=gx.createRadialGradient(128,128,3,128,128,128);gg.addColorStop(0,'rgba(255,248,218,1)');gg.addColorStop(.16,'rgba(255,177,78,.55)');gg.addColorStop(1,'rgba(255,94,30,0)');gx.fillStyle=gg;gx.fillRect(0,0,256,256);
const corona=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));corona.scale.set(17,17,1);scene.add(corona);
{const n=15000,p=new Float32Array(n*3),c=new Float32Array(n*3);for(let i=0;i<n;i++){const r=150+Math.random()*650,a=Math.random()*Math.PI*2,z=Math.random()*2-1,q=Math.sqrt(1-z*z);p.set([r*q*Math.cos(a),r*z,r*q*Math.sin(a)],i*3);const hue=[.58,.12,.04,.0][Math.floor(Math.random()*4)],v=.55+Math.random()*.45,col=new THREE.Color().setHSL(hue,.28,v);c.set([col.r,col.g,col.b],i*3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({size:.55,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.88})));}
for(let i=0;i<8;i++){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'rgba(90,105,255,.23)');g.addColorStop(1,'rgba(20,50,130,0)');x.fillStyle=g;x.fillRect(0,0,128,128);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:.25,depthWrite:false}));s.position.set((Math.random()-.5)*240,(Math.random()-.5)*90,-100-Math.random()*150);s.scale.set(65,40,1);scene.add(s)}

function makeLabel(text){const c=document.createElement('canvas');c.width=300;c.height=64;const x=c.getContext('2d');x.font='500 22px Arial';x.textAlign='center';x.fillStyle='#e4f2ff';x.shadowColor='#79cfff';x.shadowBlur=10;x.fillText(text,150,40);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));s.scale.set(3.2,.68,1);return s}
function solveKepler(M,e){let E=M;for(let i=0;i<7;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return E}
const epoch=Date.UTC(2000,0,1,12),dayMs=86400000;
const bodies=[];
function orbitCurve(a,e){const pts=[];for(let k=0;k<360;k++){const f=k*Math.PI/180,r=a*(1-e*e)/(1+e*Math.cos(f));pts.push(new THREE.Vector3(r*Math.cos(f),0,r*Math.sin(f)*.88))}const line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x7c98bd,transparent:true,opacity:.19}));scene.add(line)}
PLANETS.forEach((d,i)=>{orbitCurve(d.a,d.ecc);const root=new THREE.Group();scene.add(root);const axial=new THREE.Group();root.add(axial);const material=new THREE.MeshStandardMaterial({color:d.color,roughness:.92});material.map=tex(d.texture);const sphere=new THREE.Mesh(new THREE.SphereGeometry(d.size,56,56),material);sphere.userData.planetIndex=i;axial.add(sphere);let clouds=null;
if(d.id==='earth'){const cm=new THREE.MeshStandardMaterial({map:remote('https://threejs.org/examples/textures/planets/earth_clouds_1024.png'),transparent:true,opacity:.36,depthWrite:false});clouds=new THREE.Mesh(new THREE.SphereGeometry(d.size*1.014,48,48),cm);axial.add(clouds);const at=new THREE.Mesh(new THREE.SphereGeometry(d.size*1.09,48,48),new THREE.MeshBasicMaterial({color:0x378fff,transparent:true,opacity:.12,side:THREE.BackSide,blending:THREE.AdditiveBlending}));axial.add(at)}
if(d.id==='saturn'){const ring=new THREE.Mesh(new THREE.RingGeometry(d.size*1.24,d.size*2.4,144),new THREE.MeshStandardMaterial({map:tex(d.ring),color:0xd8c8a5,side:THREE.DoubleSide,transparent:true,opacity:.92,roughness:1}));ring.rotation.x=Math.PI/2.25;axial.add(ring)}
if(d.id==='uranus'){const ring=new THREE.Mesh(new THREE.RingGeometry(d.size*1.4,d.size*1.8,96),new THREE.MeshBasicMaterial({color:0xa3dce3,side:THREE.DoubleSide,transparent:true,opacity:.2}));ring.rotation.x=Math.PI/2.1;axial.add(ring)}
const label=makeLabel(d.name);label.position.y=d.size+.7;axial.add(label);
bodies.push({data:d,root,axial,sphere,label,clouds,phase:[.2,2.4,1.7,4.2,5.1,3.2,.7,4.8][i]});
});
// Earth moon and Galilean moon markers.
const moons=[];function addMoon(parent,r,size,period,textureUrl){const pivot=new THREE.Group();parent.add(pivot);const m=new THREE.Mesh(new THREE.SphereGeometry(size,28,28),new THREE.MeshStandardMaterial({color:0xbab9b5,map:textureUrl?remote(textureUrl):null,roughness:1}));m.position.x=r;pivot.add(m);moons.push({pivot,period})}
addMoon(bodies[2].axial,1.04,.13,27.3,'https://threejs.org/examples/textures/planets/moon_1024.jpg');for(let i=0;i<4;i++)addMoon(bodies[4].axial,2.0+i*.34,.065+i*.016,1.7+i*1.8,null);
// Main-belt asteroids rendered in one draw call.
{const n=5200,mesh=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.035,0),new THREE.MeshStandardMaterial({color:0x898276,roughness:1}),n),o=new THREE.Object3D();for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=15.2+Math.random()*2.3;o.position.set(Math.cos(a)*r,(Math.random()-.5)*.5,Math.sin(a)*r*.88);o.scale.setScalar(.35+Math.random()*1.7);o.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)}scene.add(mesh)}

// Mission reference points are historical waypoints, not live SPICE/Horizons ephemerides.
const missions=[
{id:'voyager1',name:'Voyager 1',date:'1979-03-05T12:00:00Z',planet:4,color:0x91dfff,description:'Jupiter flyby · 5 March 1979',note:'Historic flyby reference point. The marker is illustrative, not a reconstructed SPICE trajectory.'},
{id:'voyager2',name:'Voyager 2',date:'1979-07-09T12:00:00Z',planet:4,color:0xb5a2ff,description:'Jupiter flyby · 9 July 1979',note:'Jupiter encounter reference. Full spacecraft trajectory requires SPICE kernels.'},
{id:'cassini',name:'Cassini',date:'2004-07-01T02:00:00Z',planet:5,color:0xffd38e,description:'Saturn orbit insertion · 2004',note:'Saturn orbit insertion reference event.'},
{id:'juno',name:'Juno',date:'2016-07-04T03:53:00Z',planet:4,color:0x9bffc9,description:'Jupiter orbit insertion · 2016',note:'Juno arrival reference event; marker is schematic.'},
{id:'perseverance',name:'Perseverance',date:'2021-02-18T20:55:00Z',planet:3,color:0xff9d82,description:'Mars landing · 18 February 2021',note:'Mars landing reference event.'}
];
const missionObjects=[];
const missionNav=$('#mission-nav');
missions.forEach(m=>{const b=document.createElement('button');b.innerHTML='<span>'+m.name+'</span>';b.style.setProperty('--c','#'+m.color.toString(16).padStart(6,'0'));b.onclick=()=>selectMission(m);missionNav.append(b);const obj=new THREE.Mesh(new THREE.OctahedronGeometry(.12,1),new THREE.MeshBasicMaterial({color:m.color}));obj.visible=false;scene.add(obj);missionObjects.push({data:m,obj})});
function updateMissionMarkers(date){missionObjects.forEach(({data,obj})=>{const active=date>=new Date(data.date).getTime()-120*dayMs&&date<=new Date(data.date).getTime()+120*dayMs;obj.visible=active;if(active){const p=bodies[data.planet].root.position;obj.position.set(p.x+1.8,p.y+.35,p.z+1.4)}})}
let selected=2,labelsOn=true,paused=false,timePlaying=false,rate=3600,simDate=new Date('2026-11-22T00:00:00Z'),lightAngle=.5;
const audio=new (await import('./audio.js')).PlanetAudio();
function updateReadout(d,i){$('#kind').textContent=d.type+' / BODY '+String(i+1).padStart(2,'0');$('#name').textContent=d.name;$('#description').textContent=d.desc;$('#diameter').textContent=d.diameter;$('#distance').textContent=d.distance;$('#moons').textContent=d.moons;$('#year').textContent=d.year;$('#day').textContent=d.day;$('#temp').textContent=d.temp;$('#fact').textContent=d.fact}
function choosePlanet(i){selected=i;const d=PLANETS[i],b=bodies[i];updateReadout(d,i);[...$('#planet-nav').children].forEach((x,j)=>x.classList.toggle('active',i===j));$('#target-name').textContent=d.name.toUpperCase();$('#target-range').textContent='PLANET';flight.goTo(b.root.position,d.size);audio.select(d.id)}
function selectMission(m){const b=bodies[m.planet];$('#target-name').textContent=m.name.toUpperCase();$('#target-range').textContent='MISSION REFERENCE';$('#kind').textContent='MISSION EVENT / HISTORICAL WAYPOINT';$('#name').textContent=m.name;$('#description').textContent=m.description;$('#diameter').textContent='—';$('#distance').textContent='—';$('#moons').textContent='—';$('#year').textContent='—';$('#day').textContent='—';$('#temp').textContent='—';$('#fact').textContent=m.note;flight.goTo(b.root.position,PLANETS[m.planet].size);setDate(new Date(m.date));missionNav.querySelectorAll('button').forEach((x,j)=>x.classList.toggle('active',missions[j]===m))}
const nav=$('#planet-nav');PLANETS.forEach((p,i)=>{const b=document.createElement('button');b.innerHTML='<span>'+p.name+'</span>';b.style.setProperty('--c',new THREE.Color(p.color).getStyle());b.onclick=()=>choosePlanet(i);nav.append(b)});
function setDate(d){simDate=new Date(d);$('#date-display').textContent=simDate.toISOString().replace('T',' ').replace('.000Z',' UTC');const y=simDate.getUTCFullYear(),start=Date.UTC(y,0,1),end=Date.UTC(y+1,0,1);$('#time-range').value=Math.max(0,Math.min(100,(y-1949+(simDate.getTime()-start)/(end-start))/100*100));}
function readDateSlider(){const v=Number($('#time-range').value),ms=Date.UTC(1949,0,1)+v/100* (Date.UTC(2049,0,1)-Date.UTC(1949,0,1));setDate(new Date(ms))}
$('#time-range').addEventListener('input',readDateSlider);$('#time-rate').onchange=e=>rate=Number(e.target.value);$('#play-time').onclick=()=>{timePlaying=!timePlaying;$('#play-time').textContent=timePlaying?'Ⅱ':'▶';$('#sim-state').textContent=timePlaying?'TIME RUNNING':'TIME PAUSED'};$('#step-back').onclick=()=>setDate(new Date(simDate.getTime()-dayMs));$('#step-forward').onclick=()=>setDate(new Date(simDate.getTime()+dayMs));document.querySelectorAll('.events button').forEach(b=>b.onclick=()=>setDate(new Date(b.dataset.date)));
$('#reset').onclick=()=>{flight.reset();$('#target-name').textContent='SOLAR SYSTEM';$('#target-range').textContent='OVERVIEW';$('#name').textContent='Solar System';$('#kind').textContent='SOLAR SYSTEM / OVERVIEW';$('#description').textContent='Explore the planets, spacecraft and orbital paths.';$('#diameter').textContent='—';$('#distance').textContent='—';$('#moons').textContent='—';$('#year').textContent='—';$('#day').textContent='—';$('#temp').textContent='—';$('#fact').textContent='Choose a planet or a mission to inspect its data.';audio.select('overview');missionNav.querySelectorAll('button').forEach(b=>b.classList.remove('active'))};
$('#labels').onclick=e=>{labelsOn=!labelsOn;bodies.forEach(b=>b.label.visible=labelsOn);e.currentTarget.classList.toggle('active',labelsOn)};
$('#sound').onclick=()=>{audio.setMuted(!audio.muted);$('#sound').classList.toggle('active',!audio.muted)};window.addEventListener('pointerdown',()=>audio.unlock(),{once:true});
$('#compare').onclick=()=>{$('#compare-modal').classList.toggle('open');$('#compare-bars').innerHTML=PLANETS.map(p=>'<div class="compare-row">'+p.name+' · '+p.diameter+'<div><i style="width:'+Math.max(2,parseFloat(p.diameter.replaceAll(',',''))/139820*100)+'%"></i></div></div>').join('')};$('#compare-close').onclick=()=>$('#compare-modal').classList.remove('open');
$('#light').onclick=()=>$('#light-control').classList.toggle('open');$('#light-range').oninput=e=>{lightAngle=Number(e.target.value)/100*Math.PI*2;sunLight.position.set(Math.cos(lightAngle)*5,Math.sin(lightAngle)*2,Math.sin(lightAngle)*5)};
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),tooltip=$('#tooltip');
canvas.addEventListener('click',e=>{mouse.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects([sun,...bodies.map(b=>b.sphere)]);if(hit.length){if(hit[0].object===sun){$('#target-name').textContent='THE SUN';$('#target-range').textContent='STAR';flight.goTo(new THREE.Vector3(),2.35);audio.select('sun')}else choosePlanet(hit[0].object.userData.planetIndex)}});
canvas.addEventListener('pointermove',e=>{mouse.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(bodies.map(b=>b.sphere));if(hit.length){tooltip.style.display='block';tooltip.style.left=e.clientX+13+'px';tooltip.style.top=e.clientY+13+'px';tooltip.textContent=PLANETS[hit[0].object.userData.planetIndex].name}else tooltip.style.display='none'});
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r')$('#reset').click();if(e.key.toLowerCase()==='m')$('#sound').click();if(e.key==='Escape')$('#reset').click();if(e.key==='ArrowRight')choosePlanet((selected+1)%8);if(e.key==='ArrowLeft')choosePlanet((selected+7)%8)});
setDate(simDate);choosePlanet(2);
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);if(timePlaying){setDate(new Date(simDate.getTime()+dt*rate*1000));}
const days=(simDate.getTime()-epoch)/dayMs;
bodies.forEach(({data,root,axial,sphere,clouds,phase})=>{const mean=phase+2*Math.PI*days/data.period,E=solveKepler(mean%(Math.PI*2),data.ecc),trueAnomaly=2*Math.atan2(Math.sqrt(1+data.ecc)*Math.sin(E/2),Math.sqrt(1-data.ecc)*Math.cos(E/2)),r=data.a*(1-data.ecc*Math.cos(E));root.position.set(r*Math.cos(trueAnomaly),0,r*Math.sin(trueAnomaly)*.88);sphere.rotation.y+=dt*Math.sign(data.rotation)*.2*Math.min(5,24/Math.abs(data.rotation));if(clouds)clouds.rotation.y+=dt*.018});
moons.forEach(m=>m.pivot.rotation.y+=dt*2*Math.PI/(m.period*24));sun.rotation.y+=dt*.018;corona.material.rotation+=dt*.012;updateMissionMarkers(simDate.getTime());flight.update(dt);controls.update();composer.render();$('#utc-clock').textContent='UTC '+simDate.toISOString().slice(11,19)}
animate();window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));composer.setSize(innerWidth,innerHeight)});
setTimeout(()=>$('#loading').classList.add('done'),8000);