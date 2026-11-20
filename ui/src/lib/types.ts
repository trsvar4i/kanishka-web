export const languages = ['ru', 'uz', 'en'] as const;
export type Lang = typeof languages[number];
export type Localized = Record<Lang, string>;
export type Category = 'bags' | 'accessories' | 'clothes';
export type Audience = 'men' | 'women' | 'unisex';
export type Material = 'leather' | 'textile';
export type GiftBudget = 'under30' | '30to80' | 'above80';
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  audience: Audience;
  material: Material;
  isNew: boolean;
  isGift: boolean;
  giftBudget: GiftBudget | null;
  title: Localized;
  subtitle: Localized;
  description: Localized;
  priceUZS: number;
  images: string[];
  inStockBranches: string[];
  sourceUrl: string;
  specs: {dimensions: string; leatherType: Localized; hardware: Localized; care: Localized};
  detailNote: Localized;
  detailImageIndex?: number;
  cardImageIndex?: number;
}
export interface Branch {
  id: string;
  address: Localized;
  landmark: Localized;
  hours: Localized;
  phones: string[];
  maps: {google: string; yandex: string; twogis: string};
}
