import {useEffect,useRef,useState} from 'react';
import type {Copy} from '../data/translations';
import type {Lang,Product} from '../lib/types';
import {defaultFilters,filterProducts,filtersFromURL,filtersToSearch,type CatalogFilters} from '../lib/catalog';
import {pathFor} from '../lib/i18n-path';
import {session} from '../lib/browser';
import {giftBudgets,isGiftBudget} from '../lib/gifts';
import type {CardCopy} from '../lib/products';
import ProductCard from './ProductCard';
export const catalogCopyKeys=['categoriesLabel','all','bags','accessories','clothes','gifts','giftLink','search','searchLabel','filtersLabel','material','materialAll','materialLeather','materialTextile','audienceLabel','audienceAll','men','women','unisex','sortLabel','sortFeatured','sortAsc','sortDesc','sortNew','showing','count','giftFilter','resetSimple','emptyTitle','emptyText','catalogNote','showMore','activeFilters','clearFilter','budgetLabel','allBudgets','giftLowRange','giftMidRange','giftHighRange','catalogResults'] as const;
export type CatalogCopy=Pick<Copy,typeof catalogCopyKeys[number]>&CardCopy;
export default function Catalog({products,lang,copy}: {products:Product[];lang:Lang;copy:CatalogCopy}) {
  const [filters,setFilters]=useState<CatalogFilters>(defaultFilters);
  const [ready,setReady]=useState(false);
  const options=useRef<HTMLDetailsElement>(null);
  const grid=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const restore=()=>setFilters(filtersFromURL(location.search));restore();setReady(true);
    if(options.current)options.current.open=!matchMedia('(max-width: 760px)').matches;
    window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const url=new URL(location.href);url.search=filtersToSearch(filters);history.replaceState(null,'',url);
    session.set('kanishka_catalog_url',`${url.pathname}${url.search}`);
    window.dispatchEvent(new Event('kanishka:url-change'));
  },[filters,ready]);
  const update=(patch:Partial<CatalogFilters>)=>setFilters(current=>({...current,all:false,...patch}));
  const reset=()=>setFilters({...defaultFilters});
  const items=filterProducts(products,filters,lang);
  const shown=filters.all?items:items.slice(0,6);
  const dirty=filtersToSearch({...filters,all:false})!=='';
  const activeFilters:Array<{label:string;patch:Partial<CatalogFilters>}>=[];
  if(filters.category!=='all')activeFilters.push({label:copy[filters.category],patch:{category:'all',budget:null}});
  if(filters.material!=='all')activeFilters.push({label:filters.material==='leather'?copy.materialLeather:copy.materialTextile,patch:{material:'all'}});
  if(filters.audience!=='all')activeFilters.push({label:copy[filters.audience],patch:{audience:'all'}});
  const selectedBudget=giftBudgets.find(tier=>tier.id===filters.budget);
  if(selectedBudget)activeFilters.push({label:copy[selectedBudget.range],patch:{budget:null}});
  if(filters.query)activeFilters.push({label:`“${filters.query}”`,patch:{query:''}});
  return <div className="catalog-layout" data-component="catalog">
    <div className="catalog-sidebar"><p className="filter-label">{copy.categoriesLabel}</p><div className="catalog-categories" role="group" aria-label={copy.categoriesLabel}>{(['all','bags','accessories','clothes','gifts'] as const).map(category=><button key={category} data-category={category} aria-pressed={filters.category===category} onClick={()=>update({category,budget:null})}>{copy[category]}</button>)}</div><a href={`${pathFor(lang,'catalog/')}?category=gifts&budget=under30`} className="sidebar-gift">{copy.giftLink}</a></div>
    <div className="catalog-content"><div className="catalog-toolbar"><label className="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id="catalog-search" type="search" placeholder={copy.search} aria-label={copy.searchLabel} value={filters.query} onChange={e=>update({query:e.target.value})}/></label>
      <details id="catalog-options" className="catalog-options" open ref={options}><summary>{copy.filtersLabel}</summary><div className="catalog-selects">
        <label><span className="field-caption">{copy.material}</span><select id="material-filter" aria-label={copy.material} value={filters.material} onChange={e=>update({material:e.target.value as CatalogFilters['material']})}><option value="all">{copy.materialAll}</option><option value="leather">{copy.materialLeather}</option><option value="textile">{copy.materialTextile}</option></select></label>
        <label><span className="field-caption">{copy.audienceLabel}</span><select id="audience-filter" aria-label={copy.audienceLabel} value={filters.audience} onChange={e=>update({audience:e.target.value as CatalogFilters['audience']})}>{(['all','men','women','unisex'] as const).map(value=><option key={value} value={value}>{value==='all'?copy.audienceAll:copy[value]}</option>)}</select></label>
        <label><span className="field-caption">{copy.sortLabel}</span><select id="catalog-sort" aria-label={copy.sortLabel} value={filters.sort} onChange={e=>update({sort:e.target.value as CatalogFilters['sort']})}>{([['featured','sortFeatured'],['price-asc','sortAsc'],['price-desc','sortDesc'],['new','sortNew']] as const).map(([value,key])=><option key={value} value={value}>{copy[key]}</option>)}</select></label>
        {(filters.category==='gifts'||filters.budget)&&<label><span className="field-caption">{copy.budgetLabel}</span><select id="budget-filter" aria-label={copy.budgetLabel} value={filters.budget||''} onChange={e=>update({budget:isGiftBudget(e.target.value)?e.target.value:null})}><option value="">{copy.allBudgets}</option>{giftBudgets.map(tier=><option key={tier.id} value={tier.id}>{copy[tier.range]}</option>)}</select></label>}
      </div></details></div>
      <div className="catalog-status"><span id="products-count" role="status" aria-live="polite">{copy.showing} {shown.length} / {items.length} {copy.count}{filters.budget?' · '+copy.giftFilter:''}</span><button id="reset-filters" className="text-button" hidden={!dirty} onClick={reset}>{copy.resetSimple}</button></div>
      {activeFilters.length>0&&<div className="active-filters" role="group" aria-label={copy.activeFilters}>{activeFilters.map(({label,patch})=><button key={label} onClick={()=>update(patch)} aria-label={`${copy.clearFilter}: ${label}`}>{label}<span aria-hidden="true">×</span></button>)}</div>}
      <h2 className="sr-only" id="catalog-results-title">{copy.catalogResults}</h2>
      <div id="catalog-grid" className="product-grid" role="region" aria-labelledby="catalog-results-title" ref={grid}>{shown.map(product=><ProductCard key={product.id} {...{product,lang,copy}}/>)}</div>
      <div id="catalog-empty" className="empty-state" hidden={items.length!==0}><h2>{copy.emptyTitle}</h2><p>{copy.emptyText}</p><button id="empty-reset" className="button button-outline" onClick={reset}>{copy.resetSimple}</button></div>
      <div className="catalog-bottom"><p>{copy.catalogNote}</p><button id="show-more" className="button button-outline" hidden={filters.all||items.length<=6} onClick={()=>{update({all:true});requestAnimationFrame(()=>grid.current?.querySelectorAll<HTMLAnchorElement>('.product-image-link')[6]?.focus({preventScroll:true}));}}><span>{copy.showMore}</span><span aria-hidden="true">↓</span></button></div>
    </div>
  </div>;
}
