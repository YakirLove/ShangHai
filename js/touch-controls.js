const ACTIONS=['forward','backward','left','right','up','down','boost'];

export function wheelActions(x,y){
 return {forward:y<-.28,backward:y>.28,left:x<-.28,right:x>.28};
}

// Each finger owns its input, so releasing boost cannot release the steering thumb.
export class TouchInputState{
 constructor(controller){this.controller=controller;this.pointers=new Map();}
 hold(id,actions){this.pointers.set(id,actions);this.sync();}
 release(id){if(this.pointers.delete(id))this.sync();}
 isPressed(action){return [...this.pointers.values()].some(p=>p[action]===true);}
 sync(){for(const action of ACTIONS)this.controller.setTouchInput(action,this.isPressed(action));}
 reset(){this.pointers.clear();this.controller.clearTouchInput();}
}

export function createTouchControls({root,controller,isBlocked}){
 const wheel=root.querySelector('.touch-wheel'),buttons=[...root.querySelectorAll('[data-touch-action]')];
 const state=new TouchInputState(controller),captures=new Map(),media=matchMedia('(max-width:900px), (any-pointer:coarse)');
 let wheelPointer=null,lastMode=null,lastVisible=null;
 const paint=()=>{for(const b of buttons){const pressed=state.isPressed(b.dataset.touchAction);b.classList.toggle('pressed',pressed);b.setAttribute('aria-pressed',String(pressed));}};
 function release(id){
  state.release(id);const element=captures.get(id);captures.delete(id);
  if(wheelPointer===id){wheelPointer=null;wheel.classList.remove('steering');wheel.style.setProperty('--steer-x','0px');wheel.style.setProperty('--steer-y','0px');}
  if(element?.hasPointerCapture(id))element.releasePointerCapture(id);paint();
 }
 function reset(){
  state.reset();for(const id of [...captures.keys()])release(id);paint();
 }
 function allowed(){return media.matches&&!isBlocked();}
 function steer(e){
  if(!allowed()){reset();return;}
  const r=wheel.getBoundingClientRect(),radius=r.width*.34;
  const x=(e.clientX-r.left-r.width/2)/radius,y=(e.clientY-r.top-r.height/2)/radius;
  state.hold(e.pointerId,wheelActions(x,y));
  const distance=Math.max(1,Math.hypot(x,y));wheel.style.setProperty('--steer-x',`${x/distance*12}px`);wheel.style.setProperty('--steer-y',`${y/distance*12}px`);paint();
 }
 wheel.addEventListener('pointerdown',e=>{
  if(e.button!==0||wheelPointer!==null||!allowed())return;
  e.preventDefault();wheelPointer=e.pointerId;captures.set(e.pointerId,wheel);wheel.setPointerCapture(e.pointerId);wheel.classList.add('steering');steer(e);
 });
 wheel.addEventListener('pointermove',e=>{if(e.pointerId===wheelPointer){e.preventDefault();steer(e);}});
 for(const b of buttons.filter(b=>!wheel.contains(b))){
  b.addEventListener('pointerdown',e=>{
   if(e.button!==0||!allowed())return;
   e.preventDefault();captures.set(e.pointerId,b);b.setPointerCapture(e.pointerId);state.hold(e.pointerId,{[b.dataset.touchAction]:true});paint();
  });
 }
 for(const el of [wheel,...buttons.filter(b=>!wheel.contains(b))]){
  for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,e=>release(e.pointerId));
  el.addEventListener('contextmenu',e=>e.preventDefault());
 }
 addEventListener('blur',reset);addEventListener('resize',reset);
 document.addEventListener('visibilitychange',reset);media.addEventListener('change',reset);
 function update(){
  const mode=controller.activeMode,visible=allowed();
  if(mode===lastMode&&visible===lastVisible)return;
  reset();lastMode=mode;lastVisible=visible;
  root.hidden=!visible;root.dataset.touchMode=mode;
  root.querySelector('.touch-flight').hidden=mode!=='helicopter';root.querySelector('[data-touch-jump]').hidden=mode!=='person';
 }
 update();return {reset,update,get touchLayout(){return media.matches;}};
}
