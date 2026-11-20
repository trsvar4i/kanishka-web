import {translations, type CopyKey} from '../data/translations';
import {languages, type Lang} from './types';
export const secondaryLanguages = languages.filter(lang=>lang!=='ru');
export {pathFor} from './i18n-path';
export function pickCopy<const K extends readonly CopyKey[]>(lang: Lang, keys: K) {
  return Object.fromEntries(keys.map(key=>[key,translations[lang][key]])) as Pick<typeof translations.ru,K[number]>;
}
