// Kanishka — local, dependency-free showroom.
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private browsing still works. */ } }
};
let currentLang = Object.hasOwn(TRANSLATIONS, storage.get('kanishka_lang')) ? storage.get('kanishka_lang') : 'ru';
let activeCategory = 'all';
let activeBudget = null;
let activeAudience = 'all';
let searchQuery = '';
let sortOrder = 'featured';
let showAll = false;
let currentProduct = null;
let selectedImage = 0;
let lastProductTrigger = null;
let toastTimer;
const pageSize = 8;
const t = key => TRANSLATIONS[currentLang][key] || key;
const local = value => typeof value === 'object' ? (value[currentLang] || value.ru) : value;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => new Intl.NumberFormat(currentLang === 'en' ? 'en-US' : 'ru-RU').format(value);
const categories = {bags:'bags',accessories:'accessories',clothes:'clothes',home:'home',gifts:'gifts'};
// Concise names are used on cards; complete source names remain in the product dialog.
function cardTitle(product) { return product.name || local(product.title); }

function filteredProducts() {
  const query = searchQuery.trim().toLocaleLowerCase();
  const result = PRODUCTS.filter(product => {
    if (activeCategory === 'gifts' && !product.isGift) return false;
    if (!['all','gifts'].includes(activeCategory) && product.category !== activeCategory) return false;
    if (activeBudget && product.giftBudget !== activeBudget) return false;
    if (activeAudience === 'unisex' && product.audience !== 'unisex') return false;
    if (['men','women'].includes(activeAudience) && ![activeAudience,'unisex'].includes(product.audience)) return false;
    if (query && ![local(product.title),local(product.subtitle),local(product.description),local(product.specs.leatherType),product.id].join(' ').toLocaleLowerCase().includes(query)) return false;
    return true;
  });
  if (sortOrder === 'price-asc') result.sort((a,b) => a.priceUZS-b.priceUZS);
  if (sortOrder === 'price-desc') result.sort((a,b) => b.priceUZS-a.priceUZS);
  if (sortOrder === 'new') result.sort((a,b) => Number(b.isNew)-Number(a.isNew));
  return result;
}
function renderCatalog() {
  const products = filteredProducts();
  const shown = showAll ? products : products.slice(0,pageSize);
  $('#catalog-grid').innerHTML = shown.map(product => `<article class="product-card">
    <button class="product-image-button" data-product="${product.id}" aria-label="${escapeHTML(t('view')+' '+local(product.title))}">
      <img src="${product.images[0]}" alt="${escapeHTML(local(product.title))}" width="500" height="625" loading="lazy">
      ${product.isNew ? `<span class="product-badge">${t('new')}</span>` : ''}<span class="product-view" aria-hidden="true">↗</span>
    </button><div class="product-meta"><span>${t(categories[product.category])}</span><span>${product.id.replace('kan-','№ ')}</span></div>
    <h3><button class="product-title-button" data-product="${product.id}">${escapeHTML(cardTitle(product))}</button></h3>
    <p class="product-description">${escapeHTML(local(product.subtitle))}</p><p class="product-price">${money(product.priceUZS)} <span>${t('currency')}</span></p></article>`).join('');
  $('#products-count').textContent = `${t('showing')} ${shown.length} / ${products.length} ${t('count')}${activeBudget ? ' · '+t('giftFilter') : ''}`;
  $('#catalog-empty').hidden = products.length !== 0;
  $('#show-more').hidden = showAll || products.length <= pageSize;
  $('#reset-filters').hidden = activeCategory === 'all' && activeAudience === 'all' && !searchQuery && !activeBudget && sortOrder === 'featured';
  $$('[data-category]').forEach(button => button.setAttribute('aria-pressed',button.dataset.category === activeCategory));
}
function resetFilters() {
  activeCategory = 'all'; activeBudget = null; activeAudience = 'all'; searchQuery = ''; sortOrder = 'featured'; showAll = false;
  $('#catalog-search').value = ''; $('#audience-filter').value = 'all'; $('#catalog-sort').value = 'featured'; renderCatalog();
}
function setLanguage(language, persist = true) {
  if (!Object.hasOwn(TRANSLATIONS, language)) return;
  currentLang = language;
  if (persist) storage.set('kanishka_lang',language);
  document.documentElement.lang = language;
  $$('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  $$('[data-i18n-placeholder]').forEach(element => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  $$('[data-lang]').forEach(button => button.setAttribute('aria-pressed',button.dataset.lang === language));
  $('#catalog-search').setAttribute('aria-label',t('searchLabel'));
  $('#audience-filter').setAttribute('aria-label',t('audienceLabel'));
  $('#catalog-sort').setAttribute('aria-label',t('sortLabel'));
  $('#menu-toggle').setAttribute('aria-label',t('menu'));
  $('#modal-close').setAttribute('aria-label',t('close'));
  renderCatalog(); renderStores(); renderCare();
  if (currentProduct) renderProduct();
}
function orderLink(product) {
  const messages = {
    ru:`Здравствуйте! Интересует ${local(product.title)} (${product.id}). Цена на сайте: ${money(product.priceUZS)} сум. Подскажите актуальную цену, доступные цвета и наличие.`,
    en:`Hello! I’m interested in ${local(product.title)} (${product.id}). Website price: ${money(product.priceUZS)} UZS. Could you confirm current price, colours and availability?`,
    uz:`Assalomu alaykum! ${local(product.title)} (${product.id}) qiziqtirmoqda. Saytdagi narxi: ${money(product.priceUZS)} so‘m. Joriy narx, ranglar va mavjudligini ayta olasizmi?`
  };
  return `https://t.me/kanishka_admin?text=${encodeURIComponent(messages[currentLang])}`;
}
function openProduct(id, trigger) {
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) return;
  currentProduct = product; selectedImage = 0; lastProductTrigger = trigger;
  renderProduct();
  $('#product-dialog').showModal();
}
function renderProduct() {
  const product = currentProduct;
  const specs = [['size',product.specs.dimensions],['material',local(product.specs.leatherType)],['care',local(product.specs.care)]].filter(([,value]) => value !== '—');
  $('#modal-content').innerHTML = `<div class="modal-gallery"><img class="modal-main-image" id="modal-main-image" src="${product.images[selectedImage]}" alt="${escapeHTML(local(product.title))}"><div class="modal-thumbs">${product.images.map((src,index) => `<button data-image="${index}" aria-label="${t('photo')} ${index+1}" aria-pressed="${index === selectedImage}"><img src="${src}" alt="" loading="lazy"></button>`).join('')}</div></div>
    <div class="modal-info"><p class="eyebrow">${t(categories[product.category])} / ${product.id}</p><h2 id="modal-title">${escapeHTML(local(product.title))}</h2><p class="product-price">${money(product.priceUZS)} <span>${t('currency')}</span></p><p class="modal-description">${escapeHTML(local(product.description))}</p><dl>${specs.map(([key,value]) => `<div><dt>${t(key)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl><div class="modal-stock"><strong>${t('stock')}</strong><ul>${BRANCHES.map(branch => `<li><span>${escapeHTML(shortAddress(branch))}</span><span class="${product.inStockBranches.includes(branch.id) ? 'stock-yes' : ''}">${t(product.inStockBranches.includes(branch.id) ? 'stockYes' : 'stockNo')}</span></li>`).join('')}</ul></div><a class="button button-brass" href="${orderLink(product)}" target="_blank" rel="noopener"><span>${t('order')}</span><span aria-hidden="true">↗</span></a><p class="modal-note">${t('orderNote')}</p><p class="modal-note"><a class="underlined-link" href="${product.sourceUrl}" target="_blank" rel="noopener">${t('imageNote')} ↗</a></p></div>`;
}
function shortAddress(branch) { return local(branch.address).split(',').slice(0,2).join(',').replace(/^ул\. /,''); }
function renderStores() {
  $('#store-grid').innerHTML = BRANCHES.map((branch,index) => `<article class="store-card"><span class="store-number">0${index+1} / TASHKENT</span><h3>${escapeHTML(shortAddress(branch))}</h3><p class="store-landmark">${escapeHTML(local(branch.landmark).replace(/^(Ориентир: |Landmark: |Mo'ljal: )/,''))}</p><p class="store-hours">${escapeHTML(local(branch.hours))}</p><a class="store-phone" href="tel:${branch.phones[0].replace(/\s/g,'')}">${branch.phones[0]}</a><div class="store-links"><a href="${branch.maps.yandex}" target="_blank" rel="noopener">${t('yandex')} ↗</a><a href="${branch.maps.google}" target="_blank" rel="noopener">${t('google')} ↗</a><a href="${branch.maps.twogis}" target="_blank" rel="noopener">${t('twoGis')} ↗</a></div><button class="store-copy" data-copy="${branch.id}">${t('copy')}</button></article>`).join('');
}
function renderCare() {
  if (window.kanishkaUI) {
    window.kanishkaUI.renderCare(Object.entries(CARE_DATA).map(([id,item]) => ({id,title:local(item.title),tips:[...local(item.dos),...local(item.donts)]})));
    return;
  }
  const previouslyOpen = $('#care-guide details[open]')?.dataset.care;
  $('#care-guide').innerHTML = Object.entries(CARE_DATA).map(([id,item]) => `<details data-care="${id}" ${id === previouslyOpen ? 'open' : ''}><summary>${escapeHTML(local(item.title))}</summary><ul>${[...local(item.dos),...local(item.donts)].map(text => `<li>${escapeHTML(text)}</li>`).join('')}</ul></details>`).join('');
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; },3500);
}
function closeMenu() { $('#mobile-nav').hidden = true; $('#menu-toggle').setAttribute('aria-expanded','false'); }
document.addEventListener('click', async event => {
  const language = event.target.closest('[data-lang]');
  if (language) setLanguage(language.dataset.lang);
  const category = event.target.closest('[data-category]');
  if (category) { activeCategory = category.dataset.category; activeBudget = null; showAll = false; renderCatalog(); }
  const categoryLink = event.target.closest('[data-category-link]');
  if (categoryLink) { resetFilters(); activeCategory = categoryLink.dataset.categoryLink; renderCatalog(); }
  const product = event.target.closest('[data-product]');
  if (product) openProduct(product.dataset.product,product);
  const thumbnail = event.target.closest('[data-image]');
  if (thumbnail) {
    selectedImage = Number(thumbnail.dataset.image);
    $('#modal-main-image').src = currentProduct.images[selectedImage];
    $$('[data-image]').forEach(button => button.setAttribute('aria-pressed',Number(button.dataset.image) === selectedImage));
  }
  const budget = event.target.closest('[data-budget]');
  if (budget) { resetFilters(); activeCategory = 'gifts'; activeBudget = budget.dataset.budget; renderCatalog(); $('#catalog').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); }
  const copy = event.target.closest('[data-copy]');
  if (copy) {
    const branch = BRANCHES.find(item => item.id === copy.dataset.copy);
    try { await navigator.clipboard.writeText(local(branch.address)); toast(t('copied')); }
    catch { toast(t('copyFailed')); }
  }
  if (event.target.closest('#mobile-nav a')) closeMenu();
});
$('#catalog-search').addEventListener('input',event => { searchQuery = event.target.value; showAll = false; renderCatalog(); });
$('#audience-filter').addEventListener('change',event => { activeAudience = event.target.value; showAll = false; renderCatalog(); });
$('#catalog-sort').addEventListener('change',event => { sortOrder = event.target.value; renderCatalog(); });
$('#reset-filters').addEventListener('click',resetFilters);
$('#empty-reset').addEventListener('click',resetFilters);
$('#show-more').addEventListener('click',() => {
  const focusIndex = pageSize; showAll = true; renderCatalog();
  $$('.product-image-button')[focusIndex]?.focus({preventScroll:true});
});
$('#menu-toggle').addEventListener('click',() => {
  const open = $('#mobile-nav').hidden;
  $('#mobile-nav').hidden = !open; $('#menu-toggle').setAttribute('aria-expanded',String(open));
});
document.addEventListener('keydown',event => { if (event.key === 'Escape') closeMenu(); });
$('#modal-close').addEventListener('click',() => $('#product-dialog').close());
$('#product-dialog').addEventListener('click',event => {
  if (event.target !== $('#product-dialog')) return;
  const rect = event.target.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
});
$('#product-dialog').addEventListener('close',() => {
  currentProduct = null;
  $('#modal-content').innerHTML = '';
  const id = lastProductTrigger?.dataset.product;
  const target = lastProductTrigger?.isConnected ? lastProductTrigger : $$('[data-product]').find(button => button.dataset.product === id);
  target?.focus({preventScroll:true});
});
// An image failure never leaves the product card blank.
document.addEventListener('error',event => {
  const img = event.target;
  if (img.tagName === 'IMG' && !img.dataset.fallback) { img.dataset.fallback = 'true'; img.src = 'assets/images/image-unavailable.svg'; }
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

$('#copyright-year').textContent = new Date().getFullYear();
setLanguage(currentLang,false);

window.addEventListener("kanishka-ui-ready", renderCare);
