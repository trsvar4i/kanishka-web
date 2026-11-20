import type {Lang,Product} from '../lib/types';
import {productPath,formatPrice,materialLabel,dimensionLabel,type CardCopy} from '../lib/products';
export default function ProductCard({product,lang,copy}: {product:Product;lang:Lang;copy:CardCopy}) {
  const href=productPath(product,lang);
  return <article className="product-card">
    <div className="product-card-heading"><div><p className="product-kind">{product.subtitle[lang]}</p><h3><a href={href}>{product.name}</a></h3></div><p className="product-price">{formatPrice(product.priceUZS,lang)} <span>{copy.currency}</span></p></div>
    <a className="product-image-link" href={href} aria-label={product.title[lang]}><img src={product.images[product.cardImageIndex||0]} alt={product.title[lang]} width="450" height="560" loading="lazy"/><span className="product-image-count">{product.images.length} {copy.photos}</span></a>
    <div className="product-facts"><span>{materialLabel(product,lang,copy)}</span><span>{dimensionLabel(product,lang,copy)}</span></div>
    <a className="product-detail-link" href={href}><span>{copy.cardView}</span><span aria-hidden="true">↗</span></a>
  </article>;
}
