// Run with tabbit-cli nodejs in the owned game page. Avoid Playwright viewport restoration.
const fs=await import('node:fs/promises'),crypto=await import('node:crypto');
globalThis.evidenceRoot='/Users/wuyanji/Desktop/上海漫游/docs/acceptance/0.2.0';
await acceptCDP.send('Emulation.setDeviceMetricsOverride',{width:1728,height:972,deviceScaleFactor:1.1111111111,mobile:false});
await page.waitForFunction(()=>shanghai.ready&&shanghai.renderer.domElement.width===1920&&shanghai.renderer.domElement.height===1080);
await page.evaluate(async()=>{shanghai.controllers.resetInput();shanghai.controllers.clearGamepadInput();await shanghai.setMode('car');document.body.classList.add('clean');document.getElementById('places').hidden=true;document.getElementById('map-modal').hidden=true;window.fixedCaptureGuard=e=>{if(e.isTrusted){e.preventDefault();e.stopImmediatePropagation();}};for(const type of ['keydown','keyup','pointerdown','pointerup','click','wheel'])window.addEventListener(type,fixedCaptureGuard,{capture:true,passive:false});});
const shots=[];
try{
 for(let i=0;i<11;i++)for(const time of ['midday','golden','midnight']){
  const state=await page.evaluate(async({i,time})=>{const app=shanghai,v=app.views[i],dx=v.target[0]-v.position[0],dz=v.target[2]-v.position[2],len=Math.hypot(dx,dz)||1;await app.teleport(v.position[0]-dx/len*120,v.position[2]-dz/len*120);await app.loader.ensureAt({x:v.position[0],z:v.position[2]},'person');app.setTime(time);app.setView(i);document.getElementById('toast').hidden=true;await new Promise(resolve=>{let n=0;const next=()=>++n>=18?resolve():requestAnimationFrame(next);requestAnimationFrame(next);});return {view:v,canvas:[app.renderer.domElement.width,app.renderer.domElement.height],buildAsset:performance.getEntriesByType('resource').map(r=>r.name).find(n=>/\/assets\/index-.*\.js$/.test(n))?.split('/').at(-1)};},{i,time});
  expect(state.canvas).toEqual([1920,1080]);const shot=await acceptCDP.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false}),buffer=Buffer.from(shot.data,'base64'),file='V'+(i+1)+'-'+time+'.png',width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20);
  expect([width,height]).toEqual([1920,1080]);await fs.writeFile(evidenceRoot+'/screenshots/'+file,buffer);shots.push({file,index:i,time,...state,width,height,sha256:crypto.createHash('sha256').update(buffer).digest('hex'),capture:'Native Page.captureScreenshot; no pixel editing'});
 }
 await fs.writeFile(evidenceRoot+'/screenshots.json',JSON.stringify(shots.filter(s=>s.index<6),null,2));await fs.writeFile(evidenceRoot+'/new-screenshots.json',JSON.stringify(shots.filter(s=>s.index>=6),null,2));
}finally{
 await page.evaluate(()=>{for(const type of ['keydown','keyup','pointerdown','pointerup','click','wheel'])window.removeEventListener(type,fixedCaptureGuard,true);document.body.classList.remove('clean');shanghai.follow();});
}
return {retaken:shots.length,dimensions:[1920,1080],method:'Native CDP capture; browser floating controls retained, game content unedited'};
