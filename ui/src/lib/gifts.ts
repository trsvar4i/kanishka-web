import type {GiftBudget,Product} from './types';
export const giftBudgets = [
  {id:'under30',label:'giftLowLabel',range:'giftLowRange',description:'giftLowDescription'},
  {id:'30to80',label:'giftMidLabel',range:'giftMidRange',description:'giftMidDescription'},
  {id:'above80',label:'giftHighLabel',range:'giftHighRange',description:'giftHighDescription'},
] as const;
export function isGiftBudget(value: unknown): value is GiftBudget {
  return giftBudgets.some(tier=>tier.id===value);
}
export function giftProducts(products: Product[],budget: GiftBudget|null) {
  return products.filter(product=>product.isGift&&product.giftBudget===budget);
}
