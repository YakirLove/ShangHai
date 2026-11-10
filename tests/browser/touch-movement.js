// Run on an initialized local or public app through Tabbit, with a 60s or longer deadline.
const cdp=await context.newCDPSession(page),results=[];let phase='setup';
const zoom=await tabbit.evaluate(async url=>chrome.tabs.getZoom((await chrome.tabs.query({url}))[0].id),page.url());
const point=async(selector,id=1)=>{await page.locator(selector).waitFor({state:'visible'});const r=await page.locator(selector).boundingBox();assert.ok(r,selector);return {id,x:r.x+r.width/2,y:r.y+r.height/2};};
const send=(type,touchPoints=[])=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
const released=async()=>{await page.waitForFunction(()=>!Object.values(shanghai.controllers._touchKeys).some(Boolean),null,{timeout:2000});const keys=await page.evaluate(()=>({...shanghai.controllers._touchKeys}));assert.equal(Object.values(keys).some(Boolean),false,`Touch input remains held: ${JSON.stringify(keys)}`);};
const mode=async name=>{await page.locator(`[data-mode="${name}"]`).click();await expect(page.locator('#touch-controls')).toHaveAttribute('data-touch-mode',name);};
const drive=async name=>{
 await mode(name);const start=await page.evaluate(()=>shanghai.controllers.getActiveEntity().position.toArray());
 phase=`drive ${name}`;
 await send('touchStart',[await point('.touch-wheel [data-touch-action="forward"]')]);
 await page.waitForFunction(p=>{const q=shanghai.controllers.getActiveEntity().position;return Math.hypot(q.x-p[0],q.z-p[2])>.8;},start,{timeout:12000});
 const end=await page.evaluate(()=>shanghai.controllers.getActiveEntity().position.toArray());await send('touchEnd');await released();
 results.push({mode:name,movedMetres:Math.hypot(end[0]-start[0],end[2]-start[2]),released:true});
};
try{
 await page.keyboard.press('Escape');await page.setViewportSize({width:Math.round(390*zoom),height:Math.round(844*zoom)});
 await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await expect(page.locator('#touch-controls')).toBeVisible();
 await page.locator('#settings-button').click();await page.locator('#quality').selectOption('low');await page.locator('#settings-button').click();
 await drive('car');
 phase='multiple fingers and reverse';
 const w=await page.locator('.touch-wheel').boundingBox(),diagonal={id:1,x:w.x+w.width/2-40,y:w.y+w.height/2-40};
 const boost=await point('.touch-actions [data-touch-action="boost"]',2);
 await send('touchStart',[diagonal]);await send('touchStart',[diagonal,boost]);
 assert.equal(await page.evaluate(()=>shanghai.controllers.keys.forward&&shanghai.controllers.keys.left&&shanghai.controllers.keys.boost),true,'diagonal and boost');
 await send('touchEnd',[boost]);assert.equal(await page.evaluate(()=>shanghai.controllers.keys.forward&&!shanghai.controllers.keys.boost),true,'lifting boost must preserve steering');
 await send('touchMove',[await point('.touch-wheel [data-touch-action="backward"]')]);assert.equal(await page.evaluate(()=>!shanghai.controllers.keys.forward&&shanghai.controllers.keys.backward),true);
 await send('touchCancel');await released();results.push({diagonal:true,multiTouchBoost:true,dragToReverse:true,cancelReleased:true});
 phase='map while holding';await send('touchStart',[await point('.touch-wheel [data-touch-action="forward"]')]);await page.locator('#map-button').click();await released();await expect(page.locator('#touch-controls')).toBeHidden();await page.locator('#close-map').click();
 await send('touchMove',[await point('.touch-wheel [data-touch-action="forward"]')]);await released();await send('touchEnd');results.push({mapCancelsInput:true,noResumeAfterClosingMap:true});
 await drive('person');await drive('cyclist');
 phase='helicopter';await send('touchStart',[await point('.touch-wheel [data-touch-action="forward"]')]);await mode('helicopter');await released();await send('touchEnd');
 const y=await page.evaluate(()=>shanghai.controllers.getActiveEntity().position.y);
 await send('touchStart',[await point('.touch-flight [data-touch-action="up"]')]);await page.waitForFunction(y=>shanghai.controllers.getActiveEntity().position.y>y+1,y,{timeout:12000});
 const risen=await page.evaluate(()=>shanghai.controllers.getActiveEntity().position.y);phase='release ascent';await send('touchEnd');await released();
 phase='descent';await send('touchStart',[await point('.touch-flight [data-touch-action="down"]')]);await page.waitForFunction(y=>shanghai.controllers.getActiveEntity().position.y<y-.3,risen,{timeout:12000});await send('touchEnd');await released();
 results.push({mode:'helicopter',ascended:true,descended:true,modeChangeClearedInput:true});
 phase='blur';await send('touchStart',[await point('.touch-wheel [data-touch-action="forward"]')]);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await released();await send('touchEnd');
 phase='rotation';await send('touchStart',[await point('.touch-wheel [data-touch-action="forward"]')]);await page.setViewportSize({width:Math.round(844*zoom),height:Math.round(390*zoom)});await released();await send('touchEnd');results.push({blurClearedInput:true,rotationClearedInput:true});
 await page.locator('#settings-button').click();await page.locator('#hide-ui').click();await expect(page.locator('#touch-controls')).toBeHidden();await page.locator('#show-ui').click();await expect(page.locator('#touch-controls')).toBeVisible();
 assert.equal(await page.evaluate(()=>shanghai.errors.length),0);return {passed:true,results};
}catch(e){throw Error(`${phase}: ${e.message}`);}finally{try{await send('touchEnd');}catch{}await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.send('Emulation.clearDeviceMetricsOverride');await cdp.detach();}
