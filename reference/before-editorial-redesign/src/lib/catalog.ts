import type {Audience,Category,GiftBudget,Lang,Material,Product} from './types';
import {isGiftBudget} from './gifts';
export interface CatalogFilters {
  category: Category|'all'|'gifts'; audience: Audience|'all'; material: Material|'all';
  budget: GiftBudget|null; query: string; sort: 'featured'|'price-asc'|'price-desc'|'new'; all: boolean;
}
export const defaultFilters: CatalogFilters={category:'all',audience:'all',material:'all',budget:null,query:'',sort:'featured',all:false};
function allowed<T extends string>(value:string|null,values:readonly T[],fallback:T):T {
  return values.includes(value as T)?value as T:fallback;
}
export function filtersFromURL(search:string): CatalogFilters {
  const p=new URLSearchParams(search);const budget=p.get('budget');
  return {category:allowed(p.get('category'),['all','bags','accessories','clothes','gifts'],'all'),audience:allowed(p.get('audience'),['all','men','women','unisex'],'all'),material:allowed(p.get('material'),['all','leather','textile'],'all'),budget:isGiftBudget(budget)?budget:null,query:p.get('q')||'',sort:allowed(p.get('sort'),['featured','price-asc','price-desc','new'],'featured'),all:p.get('all')==='1'};
}
export function filtersToSearch(filters:CatalogFilters) {
  const p=new URLSearchParams();
  for(const [key,value] of Object.entries({category:filters.category==='all'?null:filters.category,audience:filters.audience==='all'?null:filters.audience,material:filters.material==='all'?null:filters.material,budget:filters.budget,q:filters.query||null,sort:filters.sort==='featured'?null:filters.sort,all:filters.all?'1':null}))if(value)p.set(key,value);
  return p.size?`?${p}`:'';
}
export function filterProducts(products:Product[],filters:CatalogFilters,lang:Lang) {
  const query=filters.query.trim().toLocaleLowerCase();
  const items=products.filter(p=>{
    if(filters.category==='gifts'&&!p.isGift)return false;
    if(!['all','gifts'].includes(filters.category)&&p.category!==filters.category)return false;
    if(filters.budget&&p.giftBudget!==filters.budget)return false;
    if(filters.material!=='all'&&p.material!==filters.material)return false;
    if(filters.audience==='unisex'&&p.audience!=='unisex')return false;
    if(['men','women'].includes(filters.audience)&&![filters.audience,'unisex'].includes(p.audience))return false;
    return !query||[p.name,p.title[lang],p.subtitle[lang],p.description[lang],p.specs.leatherType[lang],p.id].join(' ').toLocaleLowerCase().includes(query);
  });
  if(filters.sort==='price-asc')items.sort((a,b)=>a.priceUZS-b.priceUZS);
  if(filters.sort==='price-desc')items.sort((a,b)=>b.priceUZS-a.priceUZS);
  if(filters.sort==='new')items.sort((a,b)=>Number(b.isNew)-Number(a.isNew));
  return items;
}
