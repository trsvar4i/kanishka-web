const menu=document.querySelector<HTMLButtonElement>('#menu-toggle');
const navigation=document.querySelector<HTMLElement>('#mobile-nav');
function toggleMenu(open:boolean) {
  if(!menu||!navigation)return;
  navigation.hidden=!open;menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',(open?menu.dataset.closeLabel:menu.dataset.openLabel)||'Menu');
}
menu?.addEventListener('click',()=>toggleMenu(navigation?.hidden??false));
navigation?.addEventListener('click',event=>{if((event.target as Element).closest('a'))toggleMenu(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation&&!navigation.hidden){toggleMenu(false);menu?.focus();}});
function syncLanguageLinks() {
  document.querySelectorAll<HTMLAnchorElement>('[data-language-link]').forEach(link=>{const url=new URL(link.href);url.search=location.search;url.hash=location.hash;link.href=url.href;});
}
syncLanguageLinks();window.addEventListener('kanishka:url-change',syncLanguageLinks);
document.querySelectorAll<HTMLAnchorElement>('[data-language-link]').forEach(link=>link.addEventListener('click',()=>{try{localStorage.setItem('kanishka_lang',link.dataset.lang||'ru');}catch{/* Optional preference. */}}));
let toastTimer:ReturnType<typeof setTimeout>;
function showToast(message:string) {
  const toast=document.querySelector<HTMLElement>('#toast');if(!toast)return;
  clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;
  toastTimer=setTimeout(()=>{toast.hidden=true;},3500);
}
window.addEventListener('kanishka:toast',event=>showToast((event as CustomEvent<string>).detail));
document.addEventListener('click',async event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('[data-copy-address]');if(!button)return;
  try{await navigator.clipboard.writeText(button.dataset.copyAddress||'');showToast(button.dataset.success||'');}catch{showToast(button.dataset.error||'');}
});
document.addEventListener('error',event=>{
  const image=event.target;if(image instanceof HTMLImageElement&&!image.dataset.fallback){image.dataset.fallback='true';image.src='/assets/images/image-unavailable.svg';}
},true);
