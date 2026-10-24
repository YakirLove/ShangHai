import {MapViewport} from './map-view.js';
const NS='http://www.w3.org/2000/svg';
const node=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
const polygonPath=polys=>polys.map(r=>r.map(ring=>'M'+ring.map(p=>p.join(',')).join('L')+'Z').join(' ')).join(' ');
const roadPath=roads=>roads.map(r=>'M'+r.points.map(p=>p[0]+','+p[2]).join('L')).join(' ');
export function createMap(data,onLandmark,getTiles=()=>new Map()){
 const destinations=[...data.landmarks,...(data.places||[])],mini=document.getElementById('mini-svg'),full=document.getElementById('full-svg');
 const fullBase=node('g'),miniBase=node('g');full.append(fullBase);mini.append(miniBase);
 if(data.outside)fullBase.append(node('path',{d:polygonPath(data.outside),fill:'#1d2c2b','fill-rule':'evenodd'}));
 for(const [polys,fill]of [[data.water,'#315967'],[data.parks,'#3b5146']])fullBase.append(node('path',{d:polygonPath(polys),fill,'fill-rule':'evenodd'}));
 fullBase.append(node('path',{d:roadPath(data.mapRoads||data.roads),fill:'none',stroke:'#78908a','stroke-width':.85,'vector-effect':'non-scaling-stroke'}));
 for(const d of data.districts||[])fullBase.append(node('path',{d:polygonPath(d.polygons),fill:'none',stroke:'#c9cfaa','stroke-opacity':.5,'stroke-width':.7,'stroke-dasharray':'4 5','vector-effect':'non-scaling-stroke'}));
 for(const t of data.tunnels)fullBase.append(node('path',{d:roadPath([t]),fill:'none',stroke:'#f3bb59','stroke-width':2,'stroke-dasharray':'4 3','vector-effect':'non-scaling-stroke'}));
 const labels=[];
 for(const l of destinations){
  const g=node('g',{class:'map-landmark','data-id':l.id});g.append(node('circle',{r:32,fill:'#edc968',stroke:'#192f2e','stroke-width':5}));const text=node('text',{x:42,y:12});text.textContent=l.name;g.append(text);g.addEventListener('click',()=>{if(!dragged)onLandmark(l.id);});full.append(g);labels.push({g,l});
  mini.append(node('circle',{cx:l.x,cy:l.z,r:24,fill:'#edc968'}));
 }
 const markers=[mini,full].map(svg=>{const g=node('g');g.append(node('path',{d:'M0 -29L-17 22L0 14L17 22Z',fill:'#fff9d5',stroke:'#152727','stroke-width':5}));svg.append(g);return g;});
 const viewport=new MapViewport(data.bounds);let player={x:0,z:0},heading=0,drag=null,dragged=false,miniSignature='';
 function draw(){
  full.setAttribute('viewBox',viewport.box);const scale=viewport.w/6000;
  for(const {g,l}of labels){g.setAttribute('transform',`translate(${l.x} ${l.z}) scale(${scale})`);g.style.display=viewport.w>45000&&!l.district?'none':'';}
  markers[1].setAttribute('transform',`translate(${player.x} ${player.z}) rotate(${180-heading*180/Math.PI}) scale(${viewport.w/3000})`);
 }
 const worldPoint=e=>{const m=full.getScreenCTM();return m?new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()):{x:0,y:0};};
 full.addEventListener('wheel',e=>{e.preventDefault();const p=worldPoint(e);viewport.zoom(e.deltaY<0?1.3:1/1.3,{x:p.x,z:p.y});draw();},{passive:false});
 full.addEventListener('pointerdown',e=>{dragged=false;if(e.target.closest('.map-landmark'))return;drag=worldPoint(e);full.setPointerCapture(e.pointerId);});
 full.addEventListener('pointermove',e=>{if(!drag)return;const p=worldPoint(e),dx=drag.x-p.x,dz=drag.y-p.y;if(Math.abs(dx)+Math.abs(dz)>viewport.w*.001)dragged=true;viewport.pan(dx,dz);draw();drag=worldPoint(e);});
 full.addEventListener('pointerup',()=>{drag=null;});full.addEventListener('pointercancel',()=>{drag=null;});
 document.getElementById('map-fit')?.addEventListener('click',()=>{viewport.reset();draw();});
 document.getElementById('map-locate')?.addEventListener('click',()=>{viewport.centerOn(player);draw();});
 const list=document.getElementById('search-results');
 function search(query=''){list.replaceChildren();const q=query.trim().toLocaleLowerCase();for(const l of destinations.filter(l=>[l.name,...(l.aliases||[]),l.district||''].some(n=>n.toLocaleLowerCase().includes(q)))){const b=document.createElement('button');b.textContent=l.name;const s=document.createElement('small');s.textContent=l.district||(l.x< -500?'外滩 · 历史建筑':'陆家嘴 · 城市地标');b.append(s);b.onclick=()=>onLandmark(l.id);list.append(b);}if(!list.children.length)list.textContent='没有找到这个地点';}
 document.getElementById('search').addEventListener('input',e=>search(e.target.value));search();draw();
 return {search,viewport,update(position,angle){
  player=position;heading=angle;markers[0].setAttribute('transform',`translate(${position.x} ${position.z}) rotate(${180-heading*180/Math.PI})`);mini.setAttribute('viewBox',[position.x-480,position.z-315,960,630].join(' '));
  const tiles=getTiles(),signature=[...tiles.keys()].sort().join('|');
  if(signature!==miniSignature){miniSignature=signature;miniBase.replaceChildren();const values=[...tiles.values()];
   miniBase.append(node('path',{d:polygonPath(values.flatMap(t=>t.water||[])),fill:'#315967','fill-rule':'evenodd'}));
   const local=values.flatMap(t=>t.roads||[]);miniBase.append(node('path',{d:roadPath(local.length?local:data.schemaVersion<3?data.roads:[]),fill:'none',stroke:'#78908a','stroke-width':6}));
   for(const t of data.tunnels)miniBase.append(node('path',{d:roadPath([t]),fill:'none',stroke:'#f3bb59','stroke-width':6,'stroke-dasharray':'15 11'}));
  }
  if(!document.getElementById('map-modal').hidden)draw();
 }};
}
