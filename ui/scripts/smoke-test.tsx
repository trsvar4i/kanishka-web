import {readFile,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
import {act,createElement,type ComponentType} from 'react';
import {transpileModule,ModuleKind} from 'typescript';
import type {Root} from 'react-dom/client';
import Catalog from '../src/components/Catalog';
import GiftPicker from '../src/components/GiftPicker';
import ProductExperience from '../src/components/ProductExperience';
import {catalogProps,giftProps,productProps} from '../src/lib/island-props';
import {products} from '../src/data/products';
import {languages} from '../src/lib/types';
import {pathFor} from '../src/lib/i18n-path';

const dist=new URL('../../dist/',import.meta.url);
const origin='http://127.0.0.1:8081';
const siteScript=transpileModule(await readFile(new URL('../src/scripts/site.ts',import.meta.url),'utf8'),{compilerOptions:{module:ModuleKind.None}}).outputText.replace(/export\s*\{\s*\};?/g,'');
let pagesChecked=0;
for(const lang of languages)for(const path of ['', 'catalog/', ...products.map(p=>`products/${p.slug}/`)]) {
  const route=pathFor(lang,path);
  const html=await readFile(new URL(route.slice(1)+'index.html',dist),'utf8');
  const dom=new JSDOM(html,{url:origin+route});const doc=dom.window.document;
  assert.equal(doc.documentElement.lang,lang);
  assert.equal(doc.querySelectorAll('h1').length,1,route);
  assert(doc.querySelector('meta[name="description"]')?.getAttribute('content'));
  assert.equal(doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),route);
  assert.equal(doc.querySelectorAll('link[hreflang]').length,4);
  assert.equal(doc.querySelector('.language-switch [aria-current="page"]')?.getAttribute('data-lang'),lang);
  assert(!html.includes('/assets/js/app.js'),'Legacy DOM renderer is not shipped');
  const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length,`Unique ids: ${route}`);
  for(const element of doc.querySelectorAll('a[href],img[src],script[src],link[rel="stylesheet"]')) {
    const raw=element.getAttribute('href')||element.getAttribute('src')||'';
    const url=new URL(raw,origin+route);if(url.origin!==origin)continue;
    const file=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
    await access(new URL(file.slice(1),dist));
    if(element.tagName==='A'&&url.hash){
      const target=url.pathname===route?doc:new JSDOM(await readFile(new URL(file.slice(1),dist),'utf8')).window.document;
      assert(target.getElementById(decodeURIComponent(url.hash.slice(1))),`Anchor ${raw} on ${route}`);
      if(target!==doc)target.defaultView?.close();
    }
  }
  if(path==='')assert.equal(doc.querySelectorAll('.store-card').length,3,'Stores exist without JavaScript');
  if(path.startsWith('products/'))assert(doc.querySelector('#product-description')?.textContent?.trim(),'Product content exists without JavaScript');
  dom.window.close();pagesChecked++;
}
assert.equal(pagesChecked,42);
assert.equal(await readFile(new URL('catalog.html',dist),'utf8'),await readFile(new URL('catalog/index.html',dist),'utf8'));

async function mount<P extends object>(path:string,component:ComponentType<P>,props:P,saved:Record<string,string>={}) {
  const url=new URL(path,origin);const filename=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
  const html=(await readFile(new URL(filename.slice(1),dist),'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  const errors:string[]=[];const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(html,{url:url.href,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole});const w=dom.window;
  for(const [key,value] of Object.entries(saved))w.sessionStorage.setItem(key,value);
  w.matchMedia=()=>({matches:false}) as MediaQueryList;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
  let clipboard='';Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async(text:string)=>{clipboard=text;}}});
  for(const name of ['window','document','navigator','HTMLElement','HTMLButtonElement','HTMLInputElement','Element','Node','Event','CustomEvent','MutationObserver','HTMLImageElement','location','history','sessionStorage','localStorage'] as const)Object.defineProperty(globalThis,name,{configurable:true,value:name==='window'?w:w[name]});
  Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true,getComputedStyle:w.getComputedStyle.bind(w),requestAnimationFrame:w.requestAnimationFrame.bind(w),cancelAnimationFrame:w.cancelAnimationFrame.bind(w),matchMedia:w.matchMedia});
  const script=w.document.createElement('script');script.textContent=siteScript;w.document.body.append(script);
  const host=w.document.querySelector('[data-component]')?.closest('astro-island');assert(host);
  const {hydrateRoot}=await import('react-dom/client');let root:Root|undefined;
  const originalError=console.error;console.error=(...args:unknown[])=>errors.push(args.map(String).join(' '));
  await act(async()=>{root=hydrateRoot(host,createElement(component,props),{identifierPrefix:host.getAttribute('prefix')||undefined,onRecoverableError:error=>errors.push(String(error))});});
  const q=<E extends Element=HTMLElement>(selector:string)=>{const e=w.document.querySelector<E>(selector);assert(e,selector);return e;};
  const all=(selector:string)=>[...w.document.querySelectorAll<HTMLElement>(selector)];
  const click=async(selector:string)=>{await act(async()=>q<HTMLElement>(selector).click());};
  const change=async(selector:string,value:string)=>{await act(async()=>{const input=q<HTMLInputElement|HTMLSelectElement>(selector);const prototype=input.tagName==='INPUT'?w.HTMLInputElement.prototype:w.HTMLSelectElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value')!.set!.call(input,value);input.dispatchEvent(new w.Event(input.tagName==='INPUT'?'input':'change',{bubbles:true}));});};
  const close=async()=>{await act(async()=>root?.unmount());console.error=originalError;assert.deepEqual(errors,[],'No hydration or runtime errors');w.close();};
  return {w,q,all,click,change,close,get clipboard(){return clipboard;}};
}
const home=await mount('/',GiftPicker,giftProps('ru'));
assert.equal(home.all('#gift-assortment .product-card').length,0);
for(const [budget,count,min,max] of [['under30',3,0,200000],['30to80',4,200000,500001],['above80',3,500001,Infinity]] as const) {
  const selector=`[data-gift-budget="${budget}"]`;home.q<HTMLElement>(selector).focus();await home.click(selector);
  assert.equal(home.w.document.activeElement,home.q(selector),'Budget selection keeps focus');
  assert.equal(home.all('[data-gift-budget][aria-pressed="true"]').length,1);
  assert.equal(home.all('#gift-assortment .product-card').length,count);
  const prices=home.all('#gift-assortment .product-price').map(e=>Number(e.textContent?.replace(/\D/g,'')));
  assert(prices.every(price=>price>=min&&price<max));
}
await home.click('#menu-toggle');assert.equal(home.q('#menu-toggle').getAttribute('aria-expanded'),'true');
home.q('#menu-toggle').dispatchEvent(new home.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
assert.equal(home.q('#menu-toggle').getAttribute('aria-expanded'),'false');
assert.equal(home.w.sessionStorage.getItem('kanishka_gift_budget'),'above80');await home.close();
const englishHome=await mount('/en/',GiftPicker,giftProps('en'),{kanishka_gift_budget:'above80'});
assert.equal(englishHome.q('[data-gift-budget="above80"]').getAttribute('aria-pressed'),'true');
assert(englishHome.q('#gift-selection-status').textContent?.includes('Pieces'));await englishHome.close();

const catalog=await mount('/catalog/?material=leather&sort=price-asc',Catalog,catalogProps('ru'));
assert.equal(catalog.q<HTMLSelectElement>('#material-filter').value,'leather');
assert.deepEqual(catalog.all('.product-price').map(e=>Number(e.textContent?.replace(/\D/g,''))),[80000,160000,280000,400000,530000,650000]);
await catalog.click('#show-more');assert.equal(catalog.all('.product-card').length,7);assert(catalog.w.location.search.includes('all=1'));
assert(catalog.q<HTMLAnchorElement>('[data-lang="en"]').search.includes('material=leather'),'Language links retain catalog filters');
await catalog.click('#reset-filters');assert.equal(catalog.w.location.search,'');
await catalog.change('#catalog-search','PITAK');assert.equal(catalog.all('.product-card').length,1);
await catalog.change('#catalog-search','zz-no-match');assert.equal(catalog.q<HTMLElement>('#catalog-empty').hidden,false);
await catalog.click('#empty-reset');await catalog.change('#audience-filter','unisex');assert(catalog.q('#products-count').textContent?.includes('/ 9'));
await catalog.close();
for(const [budget,count] of [['under30',3],['30to80',4],['above80',3]] as const) {
  const gifts=await mount(`/uz/catalog/?category=gifts&budget=${budget}`,Catalog,catalogProps('uz'));
  assert.equal(gifts.all('.product-card').length,count);
  if(budget==='under30') {
    await gifts.change('#budget-filter','30to80');
    assert.equal(gifts.all('.product-card').length,4,'Gift budget can be changed inside the catalog');
    assert(gifts.w.location.search.includes('budget=30to80'));
    await gifts.click('.active-filters button:last-child');
    assert(!gifts.w.location.search.includes('budget='),'A single active filter can be removed');
    assert(gifts.q('#products-count').textContent?.includes('/ 10'));
  }
  await gifts.close();
}
const product=products.find(p=>p.slug==='tokim-3');assert(product);
const item=await mount('/products/tokim-3/',ProductExperience,productProps(product,'ru'),{kanishka_catalog_url:'/catalog/?material=leather&sort=price-asc'});
assert(item.q<HTMLAnchorElement>('.breadcrumbs a[href*="catalog"]').search.includes('sort=price-asc'));
await item.click('[data-photo="4"]');assert.equal(item.q('#photo-counter').textContent,'5 / 5');
await item.click('#open-photo');assert(item.q<HTMLDialogElement>('#photo-dialog').open);
await act(async()=>item.q('#photo-dialog').dispatchEvent(new item.w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
assert.equal(item.q('#photo-counter').textContent,'1 / 5');await item.click('#photo-close');assert.equal(item.w.document.activeElement?.id,'open-photo');
await item.click('[data-slot="accordion-trigger"]');assert.equal(item.q('[data-slot="accordion-trigger"]').getAttribute('aria-expanded'),'true');
assert.equal(item.w.sessionStorage.getItem('kanishka_care_open'),'1');
assert(new URL(item.q<HTMLAnchorElement>('#product-order').href).searchParams.get('text')?.includes('TOKIM 3'));
await item.click('#share-product');assert.equal(item.clipboard,origin+'/products/tokim-3/');assert.equal(item.q<HTMLElement>('#toast').hidden,false);
await item.close();
const englishItem=await mount('/en/products/tokim-3/',ProductExperience,productProps(product,'en'),{kanishka_care_open:'1','kanishka_photo_kan-001':'3'});
assert.equal(englishItem.q('#photo-counter').textContent,'4 / 5','Selected photo survives language navigation');
assert.equal(englishItem.q('[data-slot="accordion-trigger"]').getAttribute('aria-expanded'),'true');
assert(englishItem.q('#product-description').textContent?.includes('32 × 34 cm'));await englishItem.close();
console.log('PASS: 42 prerendered localized pages; local links/assets/anchors; SSR hydration without errors; catalog filters/search/sort/URL/languages; all gift budgets; gallery/dialog/keyboard; Watermelon care; Telegram/share; mobile menu.');
