import type {Lang} from './types';
// Kept separate from dictionaries so client islands only receive the copy they use.
export function pathFor(lang: Lang,path='') {
  return `${lang==='ru'?'':`/${lang}`}/${path.replace(/^\/+/, '')}`;
}
