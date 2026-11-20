import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import type {Copy} from '../data/translations';
import {careData} from '../data/care';
import type {Lang,Product} from '../lib/types';
import {dimensionLabel,formatPrice,materialLabel,type CardCopy} from '../lib/products';
import {pathFor} from '../lib/i18n-path';
import {notify,session} from '../lib/browser';
import ProductCard from './ProductCard';
import Accordion1 from './ui/accordion-1';
export const productCopyKeys=['home','navCatalog','viewFull','closePhoto','photoCount','photo','previousPhoto','nextPhoto','photoNote','askPhoto','material','dimensions','availabilityNote','order','priceNote','share','source','productAbout','storeVisit','careTitle','moreLikeThis','allCollection','shared','shareError','detailRequest'] as const;
export type ProductCopy=Pick<Copy,typeof productCopyKeys[number]>&CardCopy;
export function orderLink(product:Product,lang:Lang,copy:Pick<Copy,'detailRequest'|'currency'>,detail=false) {
  const prefix=detail?copy.detailRequest:{ru:'Здравствуйте! Интересует',en:'Hello! I’m interested in',uz:'Assalomu alaykum! Meni shu buyum qiziqtirmoqda:'}[lang];
  const suffix={ru:'Подскажите актуальную цену, цвета, замеры и наличие.',en:'Please confirm current price, colours, measurements and availability.',uz:'Joriy narx, ranglar, o‘lchamlar va mavjudlikni ayta olasizmi?'}[lang];
  return `https://t.me/kanishka_admin?text=${encodeURIComponent(`${prefix} ${product.title[lang]} (${product.id}). ${formatPrice(product.priceUZS,lang)} ${copy.currency}. ${suffix}`)}`;
}
export default function ProductExperience({product,related,lang,copy}: {product:Product;related:Product[];lang:Lang;copy:ProductCopy}) {
  const [selected,setSelected]=useState(product.cardImageIndex||0);
  const [catalogURL,setCatalogURL]=useState(pathFor(lang,'catalog/'));
  const [careOpen,setCareOpen]=useState<string[]>([]);
  const [mobileOrderVisible,setMobileOrderVisible]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const openPhoto=useRef<HTMLButtonElement>(null);
  const gallery=useRef<HTMLDivElement>(null);
  const thumbnails=useRef<HTMLDivElement>(null);
  const orderButton=useRef<HTMLAnchorElement>(null);
  useEffect(()=>{
    const saved=session.get('kanishka_catalog_url');
    if(saved){const url=new URL(saved,location.origin);if(/^\/(?:en\/|uz\/)?catalog(?:\/|\.html)$/.test(url.pathname))setCatalogURL(pathFor(lang,'catalog/')+url.search);}
    setCareOpen(session.get('kanishka_care_open')==='1'?['material']:[]);
    const savedPhoto=session.get(`kanishka_photo_${product.id}`);
    if(savedPhoto!==null&&/^\d+$/.test(savedPhoto)&&Number(savedPhoto)<product.images.length)setSelected(Number(savedPhoto));
  },[lang,product.id,product.images.length]);
  useEffect(()=>{
    const tray=thumbnails.current;
    const active=tray?.querySelector<HTMLButtonElement>(`[data-photo="${selected}"]`);
    if(!tray||!active)return;
    const bounds=tray.getBoundingClientRect();
    const item=active.getBoundingClientRect();
    if(item.left<bounds.left||item.right>bounds.right) {
      tray.scrollLeft+=item.left-bounds.left-(tray.clientWidth-item.width)/2;
    }
  },[selected]);
  useEffect(()=>{
    const imageGallery=gallery.current;
    const primaryOrder=orderButton.current;
    if(!imageGallery||!primaryOrder)return;
    if(!window.IntersectionObserver){setMobileOrderVisible(true);return;}
    let galleryVisible=true;
    let orderVisible=false;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries) {
        if(entry.target===imageGallery)galleryVisible=entry.isIntersecting;
        if(entry.target===primaryOrder)orderVisible=entry.isIntersecting;
      }
      setMobileOrderVisible(!galleryVisible&&!orderVisible);
    },{rootMargin:'-72px 0px 0px'});
    observer.observe(imageGallery);
    observer.observe(primaryOrder);
    return()=>observer.disconnect();
  },[product.id]);
  const switchPhoto=(index:number)=>{
    const next=(index+product.images.length)%product.images.length;
    setSelected(next);session.set(`kanishka_photo_${product.id}`,String(next));
  };
  const galleryKey=(event:KeyboardEvent)=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();switchPhoto(selected+(event.key==='ArrowRight'?1:-1));}};
  const image=product.images[selected];
  const imageAlt=`${product.title[lang]} — ${copy.photo} ${selected+1}`;
  const count=`${selected+1} / ${product.images.length}`;
  const price=formatPrice(product.priceUZS,lang);
  const materialCare=careData[product.material==='leather'?'leather':'linen'];
  const careItem={id:'material',title:product.name==='BOSHLIK'?copy.materialUnknown:materialCare.title[lang],tips:product.name==='BOSHLIK'?[product.specs.care[lang]]:[...materialCare.dos[lang],...materialCare.donts[lang]]};
  async function share() {
    try{if(navigator.share)await navigator.share({title:product.title[lang],url:location.href});else{await navigator.clipboard.writeText(location.href);notify(copy.shared);}}
    catch(error){if(!(error&&typeof error==='object'&&'name' in error&&error.name==='AbortError'))notify(copy.shareError);}
  }
  return <div data-component="product" style={{display:'contents'}}>
    <section className="product-page page-space"><nav className="breadcrumbs" aria-label={copy.navCatalog}><a href={pathFor(lang)}>{copy.home}</a><span>/</span><a href={catalogURL}>{copy.navCatalog}</a><span>/</span><span>{product.name}</span></nav>
      <div className="product-layout"><div className="product-gallery" ref={gallery} onKeyDown={galleryKey}><div className="product-gallery-stage"><button className="open-photo" id="open-photo" ref={openPhoto} aria-label={copy.viewFull} onClick={()=>dialog.current?.showModal()}><img id="product-main-image" src={image} alt={imageAlt} width="450" height="800" fetchPriority="high"/><span className="photo-expand">{copy.viewFull}</span></button><div className="photo-controls"><button data-photo-step="-1" aria-label={copy.previousPhoto} onClick={()=>switchPhoto(selected-1)}>←</button><span id="photo-counter" aria-live="polite">{count}</span><button data-photo-step="1" aria-label={copy.nextPhoto} onClick={()=>switchPhoto(selected+1)}>→</button></div></div>
        <div id="product-thumbs" className="product-thumbs" ref={thumbnails} role="group" aria-label={copy.photoCount}>{product.images.map((src,index)=><button key={src} data-photo={index} aria-label={`${copy.photo} ${index+1}`} aria-pressed={index===selected} onClick={()=>switchPhoto(index)}><img src={src} alt="" width="56" height="68" loading="lazy"/></button>)}</div>
        <div className="gallery-note"><p>{copy.photoNote}</p><a id="ask-photo" href={orderLink(product,lang,copy,true)} target="_blank" rel="noopener" className="text-link">{copy.askPhoto}</a></div>
      </div>
      <div className="product-summary"><p className="product-kind" id="product-kind">{product.subtitle[lang]}</p><h1 id="product-title">{product.name}</h1><p className="product-page-price">{price} <span>{copy.currency}</span></p><p className="product-description" id="product-description">{product.description[lang]}</p><dl className="product-specs"><div><dt>{copy.material}</dt><dd id="product-material">{materialLabel(product,lang,copy)}</dd></div><div><dt>{copy.dimensions}</dt><dd id="product-dimensions">{dimensionLabel(product,lang,copy)}</dd></div></dl><p className="availability-note">{copy.availabilityNote}</p><a className="button button-primary product-order" id="product-order" ref={orderButton} href={orderLink(product,lang,copy)} target="_blank" rel="noopener"><span>{copy.order}</span><span aria-hidden="true">↗</span></a><p className="price-note">{copy.priceNote}</p><div className="product-secondary-actions"><button id="share-product" className="text-button" onClick={share}>{copy.share}</button><a id="product-source" className="text-link" href={product.sourceUrl} target="_blank" rel="noopener">{copy.source}</a></div></div></div>
      <section className="product-detail-section"><div className="product-detail-image"><img src={product.images[product.detailImageIndex||1]} alt={`${product.title[lang]} — ${copy.productAbout}`} width="450" height="800" loading="lazy"/></div><div className="product-detail-copy"><h2>{copy.productAbout}</h2><p id="product-detail-note">{product.detailNote[lang]}</p><a className="text-link" href={pathFor(lang)+'#branches'}>{copy.storeVisit}</a><div className="product-care"><h3>{copy.careTitle}</h3><div id="care-guide" className="care-accordion"><Accordion1 items={[careItem]} value={careOpen} onValueChange={value=>{setCareOpen(value);session.set('kanishka_care_open',value.length?'1':'0');}}/></div></div></div></section>
      {related.length>0&&<section className="related-section"><div className="section-heading"><h2>{copy.moreLikeThis}</h2><a className="text-link" href={pathFor(lang,'catalog/')}>{copy.allCollection}</a></div><div className="product-grid" id="related-grid">{related.map(product=><ProductCard key={product.id} {...{product,lang,copy}}/>)}</div></section>}
    </section>
    <dialog id="photo-dialog" className="photo-dialog" ref={dialog} aria-label={product.title[lang]} onKeyDown={galleryKey} onClose={()=>openPhoto.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}><button id="photo-close" className="photo-close" aria-label={copy.closePhoto} onClick={()=>dialog.current?.close()}>×</button><div className="photo-original-wrap"><img id="photo-original" src={image} alt={imageAlt}/></div><p className="photo-dialog-caption"><span>{product.name}</span><span id="photo-dialog-counter">{count}</span></p></dialog>
    <div className="mobile-order-bar" hidden={!mobileOrderVisible}><span id="mobile-price">{price} <small>{copy.currency}</small></span><a className="button button-primary" id="mobile-product-order" href={orderLink(product,lang,copy)} target="_blank" rel="noopener">{copy.order}</a></div>
  </div>;
}
