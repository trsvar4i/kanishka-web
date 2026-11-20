import type {Copy} from '../data/translations';
import type {Lang,Product} from './types';
export function formatPrice(price: number, lang: Lang) {
  return new Intl.NumberFormat(lang==='en'?'en-US':'ru-RU').format(price);
}
export function productPath(product: Product,lang: Lang) {
  return `${lang==='ru'?'':`/${lang}`}/products/${product.slug}/`;
}
export function materialLabel(product: Product,lang: Lang,copy: Pick<Copy,'materialUnknown'>) {
  return product.name==='BOSHLIK'?copy.materialUnknown:product.specs.leatherType[lang];
}
export function dimensionLabel(product: Product,lang: Lang,copy: Pick<Copy,'sizeUnknown'>) {
  const value=product.specs.dimensions;
  return value==='—'?copy.sizeUnknown:lang==='ru'?value:value.replaceAll('см',lang==='en'?'cm':'sm').replace(' л',' L');
}
export const cardCopyKeys = ['currency','photos','cardView','materialUnknown','sizeUnknown'] as const;
export type CardCopy = Pick<Copy,typeof cardCopyKeys[number]>;
