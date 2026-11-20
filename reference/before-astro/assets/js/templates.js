// Shared by the static page generator and the browser. No client-only markup required.
function escapeMarkup(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function localized(value, lang) { return typeof value === 'object' ? (value[lang] || value.ru) : value; }
function productPath(product) { return `products/${product.slug}/`; }
function formatPrice(value, lang) { return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU').format(value); }
function materialLabel(product, lang) {
  const label = localized(product.specs.leatherType,lang);
  return product.name === 'BOSHLIK' ? TRANSLATIONS[lang].materialUnknown : label;
}
function dimensionLabel(product, lang) {
  const value=product.specs.dimensions;
  if(value==='—')return TRANSLATIONS[lang].sizeUnknown;
  return lang==='ru'?value:value.replaceAll('см',lang==='en'?'cm':'sm').replace(' л',' L');
}
function productCardHTML(product, lang = 'ru') {
  const copy = TRANSLATIONS[lang];
  const imageIndex = product.cardImageIndex || 0;
  return `<article class="product-card">
    <div class="product-card-heading"><div><p class="product-kind">${escapeMarkup(localized(product.subtitle,lang))}</p><h3><a href="${productPath(product)}">${escapeMarkup(product.name)}</a></h3></div><p class="product-price">${formatPrice(product.priceUZS,lang)} <span>${copy.currency}</span></p></div>
    <a class="product-image-link" href="${productPath(product)}" aria-label="${escapeMarkup(localized(product.title,lang))}">
      <img src="${product.images[imageIndex]}" alt="${escapeMarkup(localized(product.title,lang))}" width="450" height="560" loading="lazy">
      <span class="product-image-count">${product.images.length} ${copy.photos}</span>
    </a><div class="product-facts"><span>${escapeMarkup(materialLabel(product,lang))}</span><span>${escapeMarkup(dimensionLabel(product,lang))}</span></div>
    <a class="product-detail-link" href="${productPath(product)}"><span>${copy.cardView}</span><span aria-hidden="true">↗</span></a>
  </article>`;
}

// The picker and catalog share the same budget groups and complete assortment.
const GIFT_BUDGETS = [
  {id:'under30',label:'giftLowLabel',range:'giftLowRange',description:'giftLowDescription'},
  {id:'30to80',label:'giftMidLabel',range:'giftMidRange',description:'giftMidDescription'},
  {id:'above80',label:'giftHighLabel',range:'giftHighRange',description:'giftHighDescription'}
];
function giftProducts(budget) {
  return PRODUCTS.filter(product=>product.isGift&&product.giftBudget===budget);
}
function giftAssortmentHTML(lang = 'ru', budget = null) {
  const copy=TRANSLATIONS[lang];
  const tier=GIFT_BUDGETS.find(item=>item.id===budget);
  if(!tier) return `<p class="gift-selection-prompt">${copy.giftChoosePrompt}</p>`;
  return `<div class="gift-assortment-heading"><div><h3>${copy[tier.range]}</h3><p>${copy[tier.description]}</p></div><a class="text-link" href="catalog.html?category=gifts&budget=${tier.id}">${copy.giftOpenCatalog} ↗</a></div>
    <div class="product-grid">${giftProducts(budget).map(product=>productCardHTML(product,lang)).join('')}</div>`;
}
function giftCollectionsHTML(lang = 'ru', budget = null) {
  const copy=TRANSLATIONS[lang];
  return `<div class="gift-budget-options" role="group" aria-label="${copy.giftChooseBudget}">${GIFT_BUDGETS.map(tier=>`<button type="button" class="gift-budget-option" data-gift-budget="${tier.id}" aria-pressed="${tier.id===budget}" aria-controls="gift-assortment"><span class="gift-tier-label">${copy[tier.label]}</span><span class="gift-budget-range">${copy[tier.range]}</span><span class="gift-budget-mark" aria-hidden="true"></span></button>`).join('')}</div>
    <p id="gift-selection-status" class="gift-selection-status" role="status" aria-atomic="true">${budget?`${copy.giftSelectionCount} ${giftProducts(budget).length}`:''}</p>
    <div id="gift-assortment">${giftAssortmentHTML(lang,budget)}</div>`;
}
