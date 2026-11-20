// Static, linkable pages. Watermelon/Radix enhances material care in product pages.
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const storage = {
  get(key) { try {return localStorage.getItem(key);} catch {return null;} },
  set(key,value) { try {localStorage.setItem(key,value);} catch {} }
};
const page = document.body.dataset.page;
let currentLang = Object.hasOwn(TRANSLATIONS,storage.get('kanishka_lang')) ? storage.get('kanishka_lang') : 'ru';
let selectedGiftBudget = null;
const currentProduct = PRODUCTS.find(product=>product.id===document.body.dataset.productId);
let selectedImage = currentProduct?.cardImageIndex || 0;
let toastTimer;
const params = new URLSearchParams(location.search);
const valid = (value,values,fallback) => values.includes(value) ? value : fallback;
let activeCategory = valid(params.get('category'),['all','bags','accessories','clothes','gifts'],'all');
let activeAudience = valid(params.get('audience'),['all','men','women','unisex'],'all');
let activeMaterial = valid(params.get('material'),['all','leather','textile'],'all');
let activeBudget = valid(params.get('budget'),['under30','30to80','above80'],null);
let searchQuery = params.get('q') || '';
let sortOrder = valid(params.get('sort'),['featured','price-asc','price-desc','new'],'featured');
let showAll = params.get('all')==='1';
const pageSize=6;
const t=key=>TRANSLATIONS[currentLang][key] || key;
const local=value=>localized(value,currentLang);
const on=(selector,event,handler)=>$(selector)?.addEventListener(event,handler);
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').hidden=false;
  toastTimer=setTimeout(()=>{$('#toast').hidden=true;},3500);
}
function syncCatalogURL() {
  if(page!=='catalog') return;
  const url=new URL(location.href);
  url.search='';
  for(const [key,value,defaultValue] of [['category',activeCategory,'all'],['audience',activeAudience,'all'],['material',activeMaterial,'all'],['budget',activeBudget,null],['q',searchQuery,''],['sort',sortOrder,'featured'],['all',showAll?'1':null,null]]) {
    if(value!==defaultValue) url.searchParams.set(key,value);
  }
  try {history.replaceState(null,'',url);} catch { /* Filters also work when files are opened directly. */ }
  try {sessionStorage.setItem('kanishka_catalog_url',`catalog.html${url.search}`);} catch {}
}
function filteredProducts() {
  const query=searchQuery.trim().toLocaleLowerCase();
  const items=PRODUCTS.filter(product=>{
    if(activeCategory==='gifts'&&!product.isGift) return false;
    if(!['all','gifts'].includes(activeCategory)&&product.category!==activeCategory) return false;
    if(activeBudget&&product.giftBudget!==activeBudget) return false;
    if(activeMaterial!=='all'&&product.material!==activeMaterial) return false;
    if(activeAudience==='unisex'&&product.audience!=='unisex') return false;
    if(['men','women'].includes(activeAudience)&&![activeAudience,'unisex'].includes(product.audience)) return false;
    return !query || [local(product.title),local(product.subtitle),local(product.description),local(product.specs.leatherType),product.id].join(' ').toLocaleLowerCase().includes(query);
  });
  if(sortOrder==='price-asc') items.sort((a,b)=>a.priceUZS-b.priceUZS);
  if(sortOrder==='price-desc') items.sort((a,b)=>b.priceUZS-a.priceUZS);
  if(sortOrder==='new') items.sort((a,b)=>Number(b.isNew)-Number(a.isNew));
  return items;
}
function renderCatalog() {
  if(!$('#catalog-grid')) return;
  const items=filteredProducts();
  const shown=showAll?items:items.slice(0,pageSize);
  $('#catalog-grid').innerHTML=shown.map(item=>productCardHTML(item,currentLang)).join('');
  $('#products-count').textContent=`${t('showing')} ${shown.length} / ${items.length} ${t('count')}${activeBudget?' · '+t('giftFilter'):''}`;
  $('#catalog-empty').hidden=items.length!==0;
  $('#show-more').hidden=showAll||items.length<=pageSize;
  $('#reset-filters').hidden=activeCategory==='all'&&activeAudience==='all'&&activeMaterial==='all'&&!activeBudget&&!searchQuery&&sortOrder==='featured';
  $$('[data-category]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.category===activeCategory));
}
function resetFilters() {
  activeCategory='all'; activeAudience='all'; activeMaterial='all'; activeBudget=null; searchQuery=''; sortOrder='featured'; showAll=false;
  $('#catalog-search').value=''; $('#audience-filter').value='all'; $('#material-filter').value='all'; $('#catalog-sort').value='featured';
  renderCatalog(); syncCatalogURL();
}
function renderCardGroups() {
  if($('#gift-collections')) $('#gift-collections').innerHTML=giftCollectionsHTML(currentLang,selectedGiftBudget);
  for(const selector of ['#featured-grid','#related-grid']) {
    const grid=$(selector); if(!grid)continue;
    const ids=(grid.dataset.featuredIds||grid.dataset.relatedIds).split(',');
    grid.innerHTML=ids.map(id=>PRODUCTS.find(product=>product.id===id)).filter(Boolean).map(product=>productCardHTML(product,currentLang)).join('');
  }
}
function orderLink(product,detail=false) {
  const prefix=detail?t('detailRequest'):({ru:'Здравствуйте! Интересует',en:'Hello! I’m interested in',uz:'Assalomu alaykum! Meni shu buyum qiziqtirmoqda:'}[currentLang]);
  const suffix={ru:'Подскажите актуальную цену, цвета, замеры и наличие.',en:'Please confirm current price, colours, measurements and availability.',uz:'Joriy narx, ranglar, o‘lchamlar va mavjudlikni ayta olasizmi?'}[currentLang];
  return `https://t.me/kanishka_admin?text=${encodeURIComponent(`${prefix} ${local(product.title)} (${product.id}). ${formatPrice(product.priceUZS,currentLang)} ${t('currency')}. ${suffix}`)}`;
}
function renderProduct() {
  if(!currentProduct) return;
  const product=currentProduct;
  $('#product-kind').textContent=local(product.subtitle);
  $('#product-description').textContent=local(product.description);
  $('#product-material').textContent=materialLabel(product,currentLang);
  $('#product-dimensions').textContent=dimensionLabel(product,currentLang);
  $('#product-detail-note').textContent=local(product.detailNote);
  $('.product-page-price').innerHTML=`${formatPrice(product.priceUZS,currentLang)} <span>${t('currency')}</span>`;
  $('#mobile-price').innerHTML=`${formatPrice(product.priceUZS,currentLang)} <small>${t('currency')}</small>`;
  $('#product-order').href=orderLink(product); $('#mobile-product-order').href=orderLink(product); $('#ask-photo').href=orderLink(product,true);
  $('#open-photo').setAttribute('aria-label',t('viewFull'));
  $('#photo-close').setAttribute('aria-label',t('closePhoto'));
  $('#product-thumbs').setAttribute('aria-label',t('photoCount'));
  $$('[data-photo]').forEach(button=>button.setAttribute('aria-label',`${t('photo')} ${Number(button.dataset.photo)+1}`));
  $$('[data-photo-step]').forEach(button=>button.setAttribute('aria-label',t(button.dataset.photoStep==='1'?'nextPhoto':'previousPhoto')));
  document.title=`${local(product.title)} — Kanishka`;
  $('meta[name="description"]').content=local(product.description);
  switchPhoto(selectedImage);
}
function switchPhoto(index) {
  if(!currentProduct)return;
  selectedImage=(index+currentProduct.images.length)%currentProduct.images.length;
  $('#product-main-image').src=currentProduct.images[selectedImage];
  $('#product-main-image').alt=`${local(currentProduct.title)} — ${t('photo')} ${selectedImage+1}`;
  $('#photo-original').src=currentProduct.images[selectedImage];
  $('#photo-original').alt=$('#product-main-image').alt;
  const count=`${selectedImage+1} / ${currentProduct.images.length}`;
  $('#photo-counter').textContent=count; $('#photo-dialog-counter').textContent=count;
  $$('[data-photo]').forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.photo)===selectedImage));
}
function renderCare() {
  const host=$('#care-guide'); if(!host||!currentProduct)return;
  const id=currentProduct.material==='leather'?'leather':'linen';
  const care=CARE_DATA[id];
  const items=[{id,title:local(care.title),tips:[...local(care.dos),...local(care.donts)]}];
  if(currentProduct.name==='BOSHLIK') items[0]={id:'unknown',title:t('materialUnknown'),tips:[local(currentProduct.specs.care)]};
  if(window.kanishkaUI) {window.kanishkaUI.renderCare(items);return;}
  host.innerHTML=items.map(item=>`<details><summary>${escapeMarkup(item.title)}</summary><ul>${item.tips.map(tip=>`<li>${escapeMarkup(tip)}</li>`).join('')}</ul></details>`).join('');
}
function shortAddress(branch) {return local(branch.address).split(',').slice(0,2).join(',').replace(/^ул\. /,'');}
function renderStores() {
  if(!$('#store-grid'))return;
  $('#store-grid').innerHTML=BRANCHES.map(branch=>`<article class="store-card"><h3>${escapeMarkup(shortAddress(branch))}</h3><p>${escapeMarkup(local(branch.hours))}</p><a class="store-phone" href="tel:${branch.phones[0].replace(/\s/g,'')}">${branch.phones[0]}</a><p class="store-landmark">${escapeMarkup(local(branch.landmark).replace(/^(Ориентир: |Landmark: |Mo'ljal: )/,''))}</p><div class="store-links"><a href="${branch.maps.google}" target="_blank" rel="noopener">Google Maps ↗</a><a href="${branch.maps.yandex}" target="_blank" rel="noopener">${t('yandex')} ↗</a><button data-copy="${branch.id}" class="text-button">${t('copy')}</button></div></article>`).join('');
}
function setLanguage(language,persist=true) {
  if(!Object.hasOwn(TRANSLATIONS,language))return;
  currentLang=language; if(persist)storage.set('kanishka_lang',language);
  document.documentElement.lang=language;
  $$('[data-i18n]').forEach(element=>element.textContent=t(element.dataset.i18n));
  $$('[data-i18n-placeholder]').forEach(element=>element.placeholder=t(element.dataset.i18nPlaceholder));
  $$('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.lang===language));
  $('#menu-toggle').setAttribute('aria-label',t('menu'));
  if($('#catalog-search')) {
    $('#catalog-search').setAttribute('aria-label',t('searchLabel'));
    $('#material-filter').setAttribute('aria-label',t('material'));
    $('#audience-filter').setAttribute('aria-label',t('audienceLabel'));
    $('#catalog-sort').setAttribute('aria-label',t('sortLabel'));
  }
  renderCatalog(); renderCardGroups(); renderProduct(); renderCare(); renderStores();
}
function closeMenu() {$('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');}
document.addEventListener('click',async event=>{
  const language=event.target.closest('[data-lang]'); if(language)setLanguage(language.dataset.lang);
  const giftBudget=event.target.closest('[data-gift-budget]');
  if(giftBudget&&GIFT_BUDGETS.some(tier=>tier.id===giftBudget.dataset.giftBudget)) {
    selectedGiftBudget=giftBudget.dataset.giftBudget;
    $$('[data-gift-budget]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.giftBudget===selectedGiftBudget));
    $('#gift-assortment').innerHTML=giftAssortmentHTML(currentLang,selectedGiftBudget);
    $('#gift-selection-status').textContent=`${t('giftSelectionCount')} ${giftProducts(selectedGiftBudget).length}`;
  }
  const category=event.target.closest('[data-category]'); if(category) {activeCategory=category.dataset.category;activeBudget=null;showAll=false;renderCatalog();syncCatalogURL();}
  const photo=event.target.closest('[data-photo]'); if(photo)switchPhoto(Number(photo.dataset.photo));
  const step=event.target.closest('[data-photo-step]'); if(step)switchPhoto(selectedImage+Number(step.dataset.photoStep));
  const copy=event.target.closest('[data-copy]'); if(copy) {
    const branch=BRANCHES.find(branch=>branch.id===copy.dataset.copy);
    try{await navigator.clipboard.writeText(local(branch.address));toast(t('copied'));}catch{toast(t('copyFailed'));}
  }
  if(event.target.closest('#mobile-nav a'))closeMenu();
});
on('#menu-toggle','click',()=>{const open=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape')closeMenu();
  if(currentProduct&&(event.target.closest('.product-gallery')||$('#photo-dialog').open)) {
    if(event.key==='ArrowRight'){event.preventDefault();switchPhoto(selectedImage+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();switchPhoto(selectedImage-1);}
  }
});
on('#catalog-search','input',event=>{searchQuery=event.target.value;showAll=false;renderCatalog();syncCatalogURL();});
on('#material-filter','change',event=>{activeMaterial=event.target.value;showAll=false;renderCatalog();syncCatalogURL();});
on('#audience-filter','change',event=>{activeAudience=event.target.value;showAll=false;renderCatalog();syncCatalogURL();});
on('#catalog-sort','change',event=>{sortOrder=event.target.value;renderCatalog();syncCatalogURL();});
on('#reset-filters','click',resetFilters);on('#empty-reset','click',resetFilters);
on('#show-more','click',()=>{showAll=true;renderCatalog();syncCatalogURL();$$('.product-image-link')[pageSize]?.focus({preventScroll:true});});
on('#open-photo','click',()=>$('#photo-dialog').showModal());
on('#photo-close','click',()=>$('#photo-dialog').close());
on('#photo-dialog','close',()=>$('#open-photo').focus({preventScroll:true}));
on('#photo-dialog','click',event=>{if(event.target===$('#photo-dialog'))$('#photo-dialog').close();});
on('#share-product','click',async()=>{
  try{
    if(navigator.share)await navigator.share({title:local(currentProduct.title),url:location.href});
    else{await navigator.clipboard.writeText(location.href);toast(t('shared'));}
  }catch(error){if(error.name!=='AbortError')toast(t('shareError'));}
});
document.addEventListener('error',event=>{
  const img=event.target;if(img.tagName==='IMG'&&!img.dataset.fallback){img.dataset.fallback='true';img.src='assets/images/image-unavailable.svg';}
},true);
const CARE_DATA = {
  leather: {
    title: {ru:'Гладкая и вощёная кожа',en:'Smooth & waxed leather',uz:'Silliq va mumlangan charm'},
    dos: {ru:['Удаляйте пыль мягкой сухой тканью. Средство для ухода сначала проверьте на незаметном участке.','Если изделие промокло, сушите его при комнатной температуре.'],en:['Remove dust with a soft, dry cloth. Test any conditioner on a hidden area first.','If the piece gets wet, let it dry at room temperature.'],uz:['Changni yumshoq quruq mato bilan arting. Parvarish vositasini avval ko‘rinmaydigan joyda sinang.','Ho‘l buyumni xona haroratida tabiiy quriting.']},
    donts: {ru:['Берегите от батарей, прямого солнца и средств со спиртом. Храните в тканевом пыльнике.'],en:['Keep away from radiators, direct sunlight and alcohol-based cleaners. Store in a fabric dust bag.'],uz:['Isitgich, to‘g‘ri quyosh va spirtli vositalardan asrang. Mato qopda saqlang.']}
  },
  suede: {
    title: {ru:'Замша и нубук',en:'Suede & nubuck',uz:'Zamsh va nubuk'},
    dos: {ru:['Чистите только сухое изделие специальной мягкой щёткой для замши.','Используйте средства с маркировкой для замши и проверяйте их на незаметном участке.'],en:['Brush only when dry, using a dedicated soft suede brush.','Use suede-specific products and test them on a hidden area.'],uz:['Faqat quruq buyumni zamsh uchun maxsus yumshoq cho‘tka bilan tozalang.','Zamsh uchun mo‘ljallangan vositalarni ko‘rinmaydigan joyda sinab ishlating.']},
    donts: {ru:['Не стирайте в машине и не наносите крем для гладкой кожи.'],en:['Avoid machine washing and conditioners intended for smooth leather.'],uz:['Mashinada yuvmang va silliq charm uchun krem surtmang.']}
  },
  fur: {
    title: {ru:'Мех и овчина',en:'Fur & shearling',uz:'Mo‘yna va qo‘y po‘stagi'},
    dos: {ru:['Храните на широких плечиках в сухом, проветриваемом месте.','Для чистки выбирайте специалиста по меху и овчине.'],en:['Use wide hangers and store in a dry, ventilated place.','Choose a fur and shearling specialist for cleaning.'],uz:['Keng yelkali ilgichda, quruq va shamollatiladigan joyda saqlang.','Tozalashni mo‘yna va po‘stak mutaxassisiga topshiring.']},
    donts: {ru:['Не стирайте и не сушите у нагревательных приборов.'],en:['Do not wash or dry beside a heater.'],uz:['Yuvmang va isitgich yonida quritmang.']}
  },
  linen: {
    title: {ru:'Лён и хлопок',en:'Linen & cotton',uz:'Zig‘ir va paxta'},
    dos: {ru:['Сверяйтесь с ярлыком: режим зависит от ткани, окраски и отделки.','Стирайте отдельно от кожи и сушите расправленным.'],en:['Follow the care label: settings depend on the fabric, dye and trims.','Keep leather pieces out of the wash and dry textiles reshaped.'],uz:['Yorliqdagi ko‘rsatmalarga amal qiling: rejim mato, rang va bezaklarga bog‘liq.','Charm qismlarni yuvmang, matoni tekislab quriting.']},
    donts: {ru:['Если есть кожаные вставки, уточните способ чистки в мастерской.'],en:['For pieces with leather inserts, ask the atelier how to clean them.'],uz:['Charm qo‘shimchali buyumlarni tozalash usulini ustaxonadan aniqlang.']}
  }
};

if(page==='catalog') {
  $('#catalog-search').value=searchQuery;$('#material-filter').value=activeMaterial;$('#audience-filter').value=activeAudience;$('#catalog-sort').value=sortOrder;
  $('#catalog-options').open=!matchMedia('(max-width: 760px)').matches;
  syncCatalogURL();
}
if(page==='product') {
  try {const returnURL=sessionStorage.getItem('kanishka_catalog_url');if(returnURL&&/^catalog\.html(?:\?[^#]*)?$/.test(returnURL))$('.breadcrumbs a[href="catalog.html"]').href=returnURL;}catch{}
}
setLanguage(currentLang,false);
window.addEventListener('kanishka-ui-ready',renderCare);
