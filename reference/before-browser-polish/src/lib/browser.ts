export const session = {
  get(key: string) {try{return sessionStorage.getItem(key);}catch{return null;}},
  set(key: string,value: string) {try{sessionStorage.setItem(key,value);}catch{/* Storage can be disabled. */}}
};
export function notify(message: string) {
  window.dispatchEvent(new CustomEvent('kanishka:toast',{detail:message}));
}
