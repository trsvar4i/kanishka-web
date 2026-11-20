import {products} from '../data/products';
import {pickCopy} from './i18n';
import type {Lang,Product} from './types';
import {cardCopyKeys} from './products';
import {catalogCopyKeys} from '../components/Catalog';
import {giftCopyKeys} from '../components/GiftPicker';
import {productCopyKeys} from '../components/ProductExperience';
export function catalogProps(lang:Lang) {
  return {products,lang,copy:pickCopy(lang,[...catalogCopyKeys,...cardCopyKeys])};
}
export function giftProps(lang:Lang) {
  return {products:products.filter(p=>p.isGift),lang,copy:pickCopy(lang,[...giftCopyKeys,...cardCopyKeys])};
}
export function productProps(product:Product,lang:Lang) {
  return {product,lang,related:products.filter(p=>p.id!==product.id&&p.category===product.category).slice(0,2),copy:pickCopy(lang,[...productCopyKeys,...cardCopyKeys])};
}
