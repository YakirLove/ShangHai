// Run in a Tabbit task on the local app after shanghai.ready is true.
// tabbit-cli nodejs --task NAME --tab TAB_ID --request-id mobile-layout < tests/browser/mobile-layout.js
const cdp = await context.newCDPSession(page);
const results = [];
const sizes = [[320,568],[360,640],[390,844],[430,932],[768,1024],[568,320],[844,390],[932,430],[1024,768],[1440,900]];
const originalViewport = page.viewportSize();
const zoom = await tabbit.evaluate(async url => {
  const tabs = await chrome.tabs.query({url});
  if(tabs.length!==1) throw Error('Run with one local app tab open');
  return chrome.tabs.getZoom(tabs[0].id);
},page.url());

async function measure(selectors, checkOverlap = true) {
  return page.evaluate(({selectors, checkOverlap}) => {
    const parts = selectors.map(selector => {
      const el = document.querySelector(selector);
      return {selector, rect: el.getBoundingClientRect().toJSON()};
    });
    const problems = [];
    for (const {selector,rect:r} of parts) {
      if (r.width < 1 || r.height < 1) problems.push(`${selector} has no space`);
      if (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) problems.push(`${selector} is outside the viewport`);
    }
    if (checkOverlap) for (let i=0;i<parts.length;i++) for (let j=i+1;j<parts.length;j++) {
      const a=parts[i],b=parts[j];
      if (a.rect.left < b.rect.right-1 && a.rect.right > b.rect.left+1 && a.rect.top < b.rect.bottom-1 && a.rect.bottom > b.rect.top+1) problems.push(`${a.selector} overlaps ${b.selector}`);
    }
    return {viewport:[innerWidth,innerHeight],scrollWidth:document.documentElement.scrollWidth,problems,parts};
  }, {selectors,checkOverlap});
}

try {
  await page.waitForFunction(() => window.shanghai?.ready);
  await page.keyboard.press('Escape');
  for (const [width,height] of sizes) {
    const touchLayout=width<=900||height<=500;
    // Native viewport actions keep hit testing aligned when the user's browser zoom is not 100%.
    await page.setViewportSize({width:Math.round(width*zoom),height:Math.round(height*zoom)});
    await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:touchLayout,maxTouchPoints:5});
    await page.waitForFunction(([w,h]) => Math.abs(innerWidth-w)<=1 && Math.abs(innerHeight-h)<=1,[width,height]);
    await expect(page.locator('#touch-controls'))[touchLayout?'toBeVisible':'toBeHidden']();
    const captionVisible=touchLayout&&await page.locator('.wheel-caption').isVisible();
    const hud=await measure(['.brand','.toolbar','.map-corner','.bottom-center','.speed-panel','.attribution',...(touchLayout?['.touch-wheel','.touch-actions']:[]),...(captionVisible?['.wheel-caption']:[])]);
    assert.equal(hud.problems.length,0,`${width}×${height}: ${hud.problems.join('; ')}`);
    assert.ok(hud.scrollWidth<=width+1,`${width}×${height}: horizontal overflow`);
    const modes=await measure(['[data-mode="person"]','[data-mode="car"]','[data-mode="cyclist"]','[data-mode="helicopter"]']);
    assert.equal(modes.problems.length,0,JSON.stringify(modes));
    if (touchLayout) {
      await page.locator('#settings-button').click();
      await expect(page.locator('#settings-button')).toHaveAttribute('aria-expanded','true');
      const settings=await measure(['#scene-settings']);
      assert.equal(settings.problems.length,0,JSON.stringify(settings));
      await page.locator('[data-time="midday"]').click();
      await expect(page.locator('[data-time="midday"]')).toHaveClass('active');
      await page.locator('#quality').selectOption('low');
      await page.locator('#hide-ui').click();
      await expect(page.locator('#show-ui')).toBeVisible();
      await page.locator('#show-ui').click();
      assert.equal(await page.evaluate(()=>document.body.classList.contains('clean')),false);
    }
    await page.locator('#places-button').click();
    const places=await measure(['#places']);
    assert.equal(places.problems.length,0,JSON.stringify(places));
    await page.locator('#map-button').click();
    await expect(page.locator('#places')).toBeHidden();
    if(touchLayout) assert.notEqual(await page.evaluate(()=>document.activeElement.id),'search','Opening the mobile map must not automatically summon a keyboard');
    const map=await measure(['.map-shell','.map-shell header','#search','#close-map'],false);
    assert.equal(map.problems.length,0,JSON.stringify(map));
    const mapWidth=await page.locator('#map-viewport').evaluate(el=>el.getBoundingClientRect().width);
    assert.ok(mapWidth>=(touchLayout?width-40:300),`${width}×${height}: map is squeezed to ${mapWidth}px`);
    await page.locator('[data-map-type="metro"]').click();
    await page.locator('#map-line').selectOption('2');
    await page.locator('#search').fill('人民广场');
    const row=page.locator('#search-results .map-result');
    await expect(row).toHaveCount(1);
    await row.click();
    await page.locator('#map-fly').scrollIntoViewIfNeeded();
    const travel=await measure(['#map-fly','#map-go']);
    assert.equal(travel.problems.length,0,JSON.stringify(travel));
    const reachable=await page.locator('#map-fly').evaluate(el=>{
      const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return hit===el || el.contains(hit);
    });
    assert.ok(reachable,`${width}×${height}: travel button is covered`);
    await page.locator('#map-reset').click();
    await page.locator('#close-map').click();
    results.push({width,height,hud:'no overlap or overflow',map:'search, line filter and destination actions reachable'});
  }
  await page.locator('[data-mode="helicopter"]').click();
  await expect(page.locator('[data-mode="helicopter"]')).toHaveClass('active');
  await page.locator('#camera-button').click();
  await expect(page.locator('#camera-label')).toHaveText('低机位跟随');
  await page.locator('[data-mode="car"]').click();
  assert.equal((await page.evaluate(()=>shanghai.errors)).length,0,'Application errors');
  return {passed:true,results};
} finally {
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await cdp.detach();
  if(originalViewport) await page.setViewportSize(originalViewport);
}
