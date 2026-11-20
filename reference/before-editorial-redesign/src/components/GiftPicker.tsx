import {useEffect,useState} from 'react';
import type {Copy} from '../data/translations';
import type {GiftBudget,Lang,Product} from '../lib/types';
import {giftBudgets,giftProducts,isGiftBudget} from '../lib/gifts';
import {session} from '../lib/browser';
import {pathFor} from '../lib/i18n-path';
import type {CardCopy} from '../lib/products';
import ProductCard from './ProductCard';
export const giftCopyKeys=['giftChooseBudget','giftChoosePrompt','giftSelectionCount','giftOpenCatalog','giftLowLabel','giftLowRange','giftLowDescription','giftMidLabel','giftMidRange','giftMidDescription','giftHighLabel','giftHighRange','giftHighDescription'] as const;
export type GiftCopy=Pick<Copy,typeof giftCopyKeys[number]>&CardCopy;
export default function GiftPicker({products,lang,copy}: {products:Product[];lang:Lang;copy:GiftCopy}) {
  const [budget,setBudget]=useState<GiftBudget|null>(null);
  useEffect(()=>{const saved=session.get('kanishka_gift_budget');if(isGiftBudget(saved))setBudget(saved);},[]);
  const tier=giftBudgets.find(item=>item.id===budget);
  const items=giftProducts(products,budget);
  return <div className="gift-picker" data-component="gifts">
    <div className="gift-budget-options" role="group" aria-label={copy.giftChooseBudget}>{giftBudgets.map(tier=><button key={tier.id} type="button" className="gift-budget-option" data-gift-budget={tier.id} aria-pressed={tier.id===budget} aria-controls="gift-assortment" onClick={()=>{setBudget(tier.id);session.set('kanishka_gift_budget',tier.id);}}><span className="gift-tier-label">{copy[tier.label]}</span><span className="gift-budget-range">{copy[tier.range]}</span><span className="gift-budget-mark" aria-hidden="true"/></button>)}</div>
    <p id="gift-selection-status" className="gift-selection-status" role="status" aria-atomic="true">{tier?`${copy.giftSelectionCount} ${items.length}`:''}</p>
    <div id="gift-assortment">{tier?<><div className="gift-assortment-heading"><div><h3>{copy[tier.range]}</h3><p>{copy[tier.description]}</p></div><a className="text-link" href={`${pathFor(lang,'catalog/')}?category=gifts&budget=${tier.id}`}>{copy.giftOpenCatalog} ↗</a></div><div className="product-grid">{items.map(product=><ProductCard key={product.id} {...{product,lang,copy}}/>)}</div></>:<p className="gift-selection-prompt">{copy.giftChoosePrompt}</p>}</div>
  </div>;
}
