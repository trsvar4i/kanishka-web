import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const axePath=require.resolve('axe-core/axe.min.js');
const baseURL=process.env.BROWSER_BASE_URL||'http://127.0.0.1:8081';
const output=new URL('../../preview/browser-review/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={engine:await browser.version(),baseURL,checks:0,failures:[],screens:[],layouts:[],flows:[]};
const check=(condition,message)=>{report.checks++;if(!condition)report.failures.push(message);};
const artifact=name=>fileURLToPath(new URL(name,output));
const contexts=[];

async function open(path,width=390,height=844) {
  const context=await browser.newContext({viewport:{width,height},locale:'ru-RU',deviceScaleFactor:1,reducedMotion:'reduce'});
  contexts.push(context);
  const page=await context.newPage();
  page.on('pageerror',error=>report.failures.push(`Runtime ${path}: ${error.message}`));
  await go(page,path);
  return page;
}
async function go(page,path) {
  await page.goto(new URL(path,baseURL).href,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
}
async function accessibility(page,name) {
  await page.addScriptTag({path:axePath});
  const violations=await page.evaluate(async()=>{
    const audit=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});
    return audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}));
  });
  check(violations.length===0,`${name}: axe ${violations.map(v=>v.id).join(', ')}`);
  return violations;
}
async function layout(page) {
  return page.evaluate(()=>{
    const viewport=innerWidth;
    const collisions=[];
    for(const card of document.querySelectorAll('.product-card-heading')) {
      const title=card.querySelector('h3 a');const price=card.querySelector('.product-price');
      if(!title||!price)continue;
      const range=document.createRange();range.selectNodeContents(title);
      const a=range.getBoundingClientRect(),b=price.getBoundingClientRect();
      if(a.right>b.left-4&&a.left<b.right&&a.bottom>b.top&&a.top<b.bottom)collisions.push(title.textContent);
    }
    const categories=[...document.querySelectorAll('[data-category]')].map(button=>{
      const r=button.getBoundingClientRect();return {text:button.textContent,visible:r.left>=-1&&r.right<=viewport+1};
    });
    const firstProduct=document.querySelector('.product-image-link')?.getBoundingClientRect();
    return {width:viewport,scrollWidth:document.documentElement.scrollWidth,collisions,categories,firstProductTop:firstProduct?.top};
  });
}

try {
  for(const [name,width,height,path] of [
    ['home-desktop',1440,1000,'/'],['home-mobile',390,844,'/'],
    ['catalog-desktop',1440,1000,'/catalog/?all=1'],['catalog-mobile',390,844,'/catalog/?all=1'],
    ['product-desktop',1440,1000,'/products/tokim-3/'],['product-mobile',390,844,'/products/tokim-3/'],
  ]) {
    const page=await open(path,width,height);
    await page.evaluate(async()=>{for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
    await page.screenshot({path:artifact(`after-${name}.png`),fullPage:true});
    await page.screenshot({path:artifact(`after-${name}-viewport.png`)});
    const metrics=await layout(page);
    const violations=await accessibility(page,name);
    report.screens.push({name,...metrics,accessibility:violations});
    check(metrics.scrollWidth<=width+1,`${name}: horizontal page overflow`);
    check(metrics.collisions.length===0,`${name}: product title overlaps price: ${metrics.collisions}`);
    if(width<=760)check(metrics.categories.every(item=>item.visible),`${name}: hidden categories`);
    await page.context().close();
  }

  // Different scripts, long product names and the tablet layout need independent coverage.
  for(const width of [320,375,390,768,1440])for(const lang of ['','en/','uz/']) {
    const page=await open(`/${lang}`,width,900);
    for(const path of [`/${lang}`,`/${lang}catalog/?all=1`,`/${lang}products/chipollino-m/`]) {
      if(new URL(page.url()).pathname!==new URL(path,baseURL).pathname)await go(page,path);
      const metrics=await layout(page);
      report.layouts.push({path,...metrics});
      check(metrics.scrollWidth<=width+1,`${width}px ${path}: horizontal overflow`);
      check(metrics.collisions.length===0,`${width}px ${path}: title/price collision: ${metrics.collisions}`);
      if(width<=760)check(metrics.categories.every(item=>item.visible),`${width}px ${path}: hidden categories`);
    }
    await page.context().close();
  }

  const home=await open('/');
  check(await home.locator('.category-shortcuts').evaluate(nav=>Boolean(nav.compareDocumentPosition(document.querySelector('#featured-grid'))&Node.DOCUMENT_POSITION_FOLLOWING)),'Home categories precede featured products');
  await home.locator('.category-shortcuts a').first().click();
  await home.waitForLoadState('networkidle');
  check(new URL(home.url()).searchParams.get('category')==='bags','Home category links open the matching collection');
  check(await home.locator('[data-category="bags"]').getAttribute('aria-pressed')==='true','Home category is selected in the catalog');
  await go(home,'/');
  check(await home.locator('#gift-assortment .product-card').count()===0,'Gifts stay hidden until a budget is chosen');
  for(const [budget,count] of [['under30',3],['30to80',4],['above80',3]]) {
    await home.locator(`[data-gift-budget="${budget}"]`).click();
    check(await home.locator('#gift-assortment .product-card').count()===count,`Gift budget ${budget}: assortment`);
  }
  await accessibility(home,'gifts-selected');
  await home.locator('[data-lang="en"]').click();
  await home.waitForLoadState('networkidle');
  check(await home.locator('html').getAttribute('lang')==='en','Language changes the document language');
  check(await home.locator('[data-gift-budget="above80"]').getAttribute('aria-pressed')==='true','Gift budget survives language navigation');
  await go(home,'/');
  await home.locator('#menu-toggle').click();
  await accessibility(home,'mobile-menu-open');
  await home.keyboard.press('Escape');
  check(await home.locator('#menu-toggle').getAttribute('aria-expanded')==='false','Escape closes mobile menu');
  await home.locator('#menu-toggle').click();
  await home.mouse.click(5,600);
  check(await home.locator('#menu-toggle').getAttribute('aria-expanded')==='false','Outside click closes mobile menu');
  await home.locator('#menu-toggle').click();
  await home.setViewportSize({width:1440,height:1000});
  await home.waitForFunction(()=>document.querySelector('#mobile-nav').hidden);
  check(await home.locator('#menu-toggle').getAttribute('aria-expanded')==='false','Desktop resize closes mobile menu');
  for(const [width,height] of [[1440,900],[1280,800]]) {
    await home.setViewportSize({width,height});await home.evaluate(()=>scrollTo(0,0));
    const bounds=await home.locator('.hero-copy .button').boundingBox();
    check(bounds&&bounds.y+bounds.height<=height,`Home ${width}x${height}: collection action is visible without scrolling`);
  }
  report.flows.push('Gifts, language persistence, menu, outside click, Escape, responsive focus, visible home action');

  const catalog=await open('/catalog/?category=gifts&budget=under30');
  check(await catalog.locator('.product-card').count()===3,'Catalog reads gift budget from URL');
  check(!await catalog.locator('#catalog-options').evaluate(details=>details.open),'Catalog starts with a compact toolbar');
  await catalog.locator('#catalog-options > summary').click();
  await catalog.locator('#budget-filter').selectOption('30to80');
  check(await catalog.locator('.product-card').count()===4,'Catalog changes gift budget');
  await catalog.locator('.active-filters button').last().click();
  check(!new URL(catalog.url()).searchParams.has('budget'),'Remove an individual filter');
  await catalog.locator('#reset-filters').click();
  await catalog.locator('#catalog-search').fill('PITAK');
  check(await catalog.locator('.product-card').count()===1,'Search returns the requested product');
  await catalog.locator('#catalog-search').fill('no-such-piece-xyz');
  check(await catalog.locator('#catalog-empty').isVisible(),'Search empty state is visible');
  await catalog.locator('#empty-reset').click();
  if(!await catalog.locator('#catalog-options').evaluate(details=>details.open))await catalog.locator('#catalog-options > summary').click();
  await catalog.locator('#material-filter').selectOption('leather');
  await catalog.locator('#catalog-sort').selectOption('price-asc');
  check((await catalog.locator('.product-price').first().textContent()).replace(/\D/g,'')==='80000','Price sorting');
  await catalog.locator('[data-lang="uz"]').click();await catalog.waitForLoadState('networkidle');
  check(new URL(catalog.url()).searchParams.get('material')==='leather','Language links preserve filters');
  report.flows.push('Catalog URL, budgets, individual reset, search, empty state, sorting and languages');

  const product=await open('/products/zarafot/');
  check(!await product.locator('.mobile-order-bar').isVisible(),'Mobile contact bar does not cover the gallery');
  for(let i=0;i<6;i++)await product.locator('[data-photo-step="1"]').click();
  const thumbnail=await product.locator('#product-thumbs').evaluate(tray=>{
    const active=tray.querySelector('[aria-pressed=true]');const a=active.getBoundingClientRect(),r=tray.getBoundingClientRect();
    return {selected:active.dataset.photo,visible:a.left>=r.left-1&&a.right<=r.right+1,scrollLeft:tray.scrollLeft};
  });
  check(thumbnail.selected==='7'&&thumbnail.visible,'Selected thumbnail remains visible after arrow navigation');
  report.flows.push({name:'active-thumbnail',...thumbnail});
  await product.locator('#open-photo').click();
  await accessibility(product,'photo-dialog-open');
  check(await product.locator('#photo-dialog').evaluate(dialog=>dialog.open),'Full-photo dialog opens');
  await product.keyboard.press('ArrowRight');
  check(await product.locator('#photo-dialog-counter').textContent()==='1 / 8','Keyboard navigation in photo dialog');
  await product.keyboard.press('Escape');
  check(await product.locator('#open-photo').evaluate(button=>button===document.activeElement),'Closing photo restores focus');
  await product.locator('[data-slot="accordion-trigger"]').click();
  check(await product.locator('[data-slot="accordion-trigger"]').getAttribute('aria-expanded')==='true','Care accordion opens');
  await product.locator('#product-order').scrollIntoViewIfNeeded();
  await product.waitForFunction(()=>document.querySelector('.mobile-order-bar').hidden);
  check(!await product.locator('.mobile-order-bar').isVisible(),'Contact bar does not duplicate the visible main action');
  await product.locator('.related-section').scrollIntoViewIfNeeded();
  await product.waitForFunction(()=>!document.querySelector('.mobile-order-bar').hidden);
  check(await product.locator('.mobile-order-bar').isVisible(),'Contact bar appears after reading the product');
  report.flows.push('Gallery, thumbnail tray, native dialog, Escape/focus, care and contextual contact bar');
} catch(error) {
  report.failures.push(error.stack||String(error));
} finally {
  await Promise.allSettled(contexts.map(context=>context.close()));
  await browser.close();
  await writeFile(new URL('after-metrics.json',output),JSON.stringify(report,null,2));
}
console.log(JSON.stringify({engine:report.engine,checks:report.checks,layouts:report.layouts.length,screens:report.screens.length,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
