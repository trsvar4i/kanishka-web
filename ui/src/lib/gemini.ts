import { products } from '../data/products';
import type { Lang } from './types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  suggestedProductIds?: string[];
  timestamp: number;
}

const BAGS_CATALOG = products
  .filter((p) => p.category === 'bags' || p.category === 'accessories')
  .map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    material: p.material,
    dimensions: p.specs.dimensions,
    priceUZS: p.priceUZS,
    titleRu: p.title.ru,
    titleEn: p.title.en,
    titleUz: p.title.uz,
    descRu: p.description.ru,
    descEn: p.description.en,
    descUz: p.description.uz,
    detailNote: p.detailNote?.ru || '',
    slug: p.slug,
  }));

function buildSystemInstruction(lang: Lang): string {
  const catalogSummary = BAGS_CATALOG.map(
    (b) =>
      `• [product:${b.id}] ${b.name} (${b.category === 'bags' ? 'Сумка/Рюкзак' : 'Аксессуар'}): цена ${b.priceUZS.toLocaleString('ru-RU')} сум, размер ${b.dimensions}, материал: ${b.material}. Описание: ${b.descRu}. Особенности: ${b.detailNote}`
  ).join('\n');

  return `Ты — персональный консультант и амбассадор авторской мастерской Kanishka (Ташкент, Узбекистан), основанной Алексеем Маньшаевым.
Твоя главная задача — ТАКТИЧНО, ЭКСПЕРТНО И ПРОАКТИВНО ПРОДАВАТЬ изделия мастерской через искреннюю заботу и помощь клиенту.

ПРАВИЛА ТАКТИЧНЫХ ПРОДАЖ:
1. НИКОГДА не отвечай сухо или пассивно на обычные приветствия («Привет», «Здравствуйте», «Добрый день», «Хай» и т.п.).
   На любое приветствие отвечай тепло и СРАЗУ бери инициативу в свои руки:
   «Здравствуйте! Рад приветствовать вас в мастерской Kanishka. Чем могу быть полезен сегодня?
   Подбираете сумку или рюкзак для себя, или присматриваете особенный подарок? Могу сориентировать по размерам, материалам или показать наши главные хиты — например, знаковую красную сумку [product:kan-002] ZARAFOT или городской кожаный рюкзак [product:kan-001] TOKIM 3. Что вам ближе по стилю?»

2. ВЫЯВЛЯЙ ПОТРЕБНОСТИ И СЦЕНАРИИ:
   - Задавай уточняющие вопросы: «Что планируете носить с собой — только телефон с ключами или ноутбук и документы?», «Предпочитаете мягкую драпированную кожу или строгую форму?», «Для какого повода подарок?».
   - Подчёркивай уникальные преимущества Kanishka: натуральная премиальная кожа, авторский крой Алексея Маньшаева, ручная работа в Ташкенте, лимитированные малые серии и долговечность (вещи красиво стареют и носятся годами).

3. РЕКОМЕНДУЙ С КАРТОЧКАМИ ТОВАРА:
   - Всегда предлагай 1–2 наиболее подходящие модели из каталога ниже.
   - ОБЯЗАТЕЛЬНО указывай маркер [product:ID] (например, [product:kan-002] или [product:kan-001]), чтобы в чате появилась кликабельная карточка с фото и ценой.
   - Объясняй, почему эта вещь идеальна именно под запрос клиента.

4. МЯГКИЙ ПРИЗЫВ К ЗАКАЗУ (SOFT CLOSE):
   - Тактично напоминай, что изделия шьются небольшими тиражами, поэтому наличие расцветок и заказ лучше сразу подтвердить у менеджера в Telegram: @kanishka_dsgn (https://t.me/kanishka_dsgn).
   - Завершай каждую консультацию открытым вопросом или предложением забронировать вещь.

5. Язык: отвечай на языке клиента (русский, узбекский или английский). Текущий язык: ${lang}.

Актуальный каталог сумок и аксессуаров Kanishka:
${catalogSummary}`;
}

export function parseProductIds(text: string): { cleanText: string; productIds: string[] } {
  const productIds: string[] = [];
  const regex = /\[product:(kan-\d{3})\]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const id = match[1];
    if (id && !productIds.includes(id)) {
      productIds.push(id);
    }
  }

  // Clean markers out of prose and avoid duplicating the product name
  let cleanText = text;
  for (const id of productIds) {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      const nameRegex = new RegExp(
        `\\[product:${id}\\]\\s*(\\*\\*${prod.name}\\*\\*|${prod.name})?`,
        'gi'
      );
      cleanText = cleanText.replace(nameRegex, `**${prod.name}**`);
    } else {
      cleanText = cleanText.replace(`[product:${id}]`, '');
    }
  }

  return { cleanText, productIds };
}

export async function askGemini(
  history: ChatMessage[],
  userPrompt: string,
  lang: Lang,
  customApiKey?: string
): Promise<{ text: string; suggestedProductIds: string[] }> {
  const apiKey =
    customApiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.PUBLIC_GEMINI_API_KEY as string)
      : '');

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const response = await callGeminiApi(history, userPrompt, lang, apiKey.trim());
      const parsed = parseProductIds(response);
      return { text: parsed.cleanText, suggestedProductIds: parsed.productIds };
    } catch (err) {
      console.warn('[Kanishka AI] Gemini API call error, falling back to local advisor:', err);
    }
  }

  // Graceful fallback to smart local consultant if no key or API failed
  const fallback = localConsultantFallback(userPrompt, lang);
  const parsed = parseProductIds(fallback);
  return { text: parsed.cleanText, suggestedProductIds: parsed.productIds };
}

async function callGeminiApi(
  history: ChatMessage[],
  userPrompt: string,
  lang: Lang,
  apiKey: string
): Promise<string> {
  const systemInstruction = buildSystemInstruction(lang);

  const contents = [
    ...history.slice(-8).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ];

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 900,
    },
  };

  // Use working production Gemini models with fallback
  const models = [
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
  ];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) return answer;
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('No candidate returned by Gemini');
}

/**
 * Intelligent local advisor that delivers high quality recommendations
 * even when offline or before the Gemini API key is configured.
 */
function localConsultantFallback(query: string, lang: Lang): string {
  const q = query.toLowerCase().trim();

  // Greeting & Hello queries -> Proactive, tactful consultative sales
  if (
    q === 'привет' ||
    q.startsWith('привет') ||
    q.includes('здравствуй') ||
    q.includes('добрый день') ||
    q.includes('добрый вечер') ||
    q.includes('салам') ||
    q === 'hi' ||
    q.startsWith('hello') ||
    q.startsWith('hey')
  ) {
    if (lang === 'en') {
      return `Hello! Delighted to welcome you to the Kanishka atelier. How can I help you today?

Are you looking for a statement bag or backpack for yourself, or searching for a distinctive handcrafted gift?

I can guide you through our natural leather essentials, explain sizes and materials, or introduce our two biggest atelier hits: the sculptural red leather bag [product:kan-002] ZARAFOT and our signature leather backpack [product:kan-001] TOKIM 3. 

Which format fits your rhythm better?`;
    }
    if (lang === 'uz') {
      return `Assalomu alaykum! Kanishka mualliflik ustaxonasiga xush kelibsiz. Bugun sizga qanday yordam bera olaman?

O‘zingiz uchun har kunlik sumka yoki ryukzak tanlayapsizmi, yoki esda qolarli sovg‘a qidiryapsizmi?

Sizga tabiiy charm to‘plamimizni ko‘rsatishim, o‘lchamlar bo‘yicha maslahat berishim yoki eng mashhur modellarimiz — qizil charm [product:kan-002] ZARAFOT va qulay [product:kan-001] TOKIM 3 ryukzagini tavsiya qilishim mumkin.

Sizga qaysi shakl ko‘proq ma’qul?`;
    }
    return `Здравствуйте! Рад приветствовать вас в мастерской Kanishka. Чем могу быть полезен сегодня?

Подбираете сумку или рюкзак для себя, или присматриваете особенный подарок? Могу сориентировать по размерам, материалам или показать наши главные хиты — например, знаковую красную сумку из мягкой кожи [product:kan-002] ZARAFOT или удобный кожаный рюкзак [product:kan-001] TOKIM 3.

Какой формат вам ближе по стилю и ритму дня?`;
  }

  // Backpack query
  if (q.includes('рюкзак') || q.includes('backpack') || q.includes('ryukzak') || q.includes('ноутбук') || q.includes('laptop')) {
    if (lang === 'en') {
      return `For carrying essentials and documents, I recommend two distinct models from the workshop:

1. [product:kan-001] — Our signature genuine leather backpack (32 × 34 cm, 730,000 UZS). Deep purple-graphite texture with internal pockets for a tablet, book, and daily items.
2. [product:kan-012] — Roomy denim backpack (450,000 UZS), lightweight and resilient for travel and everyday active use.

Which format suits your rhythm better: structured leather or casual denim?`;
    }
    if (lang === 'uz') {
      return `Hujjatlar va buyumlar uchun ustaxonamizning ikkita modelini tavsiya qilaman:

1. [product:kan-001] — Tabiiy charmdan tayyorlangan ryukzak (32 × 34 sm, 730 000 so‘m). Qulay bo‘lmalar, kitob va planshet uchun mos.
2. [product:kan-012] — Qalin denimdan yasalgan keng sig‘imli ryukzak (450 000 so‘m), sayohat va har kunlik uchun juda qulay.

Qaysi biri sizga ma’qulroq: charm yoki yengil denim?`;
    }
    return `Для документов, учебы или города у нас есть два выразительных рюкзака:

1. [product:kan-001] — Флагманский рюкзак из натуральной кожи (32 × 34 см, 730 000 сум). Удобное основное отделение на молнии, держит форму, внутри помещаются книга, планшет и мелкие вещи.
2. [product:kan-012] — Вместительный рюкзак из плотного денима (450 000 сум). Очень лёгкий, практичный вариант на каждый день и в поездки.

Какой формат вам ближе: плотная авторская кожа или лёгкий деним?`;
  }

  // Crossbody / Shoulder / ZARAFOT
  if (q.includes('zarafot') || q.includes('плечо') || q.includes('shoulder') || q.includes('crossbody') || q.includes('красн') || q.includes('red')) {
    if (lang === 'en') {
      return `[product:kan-002] is the hallmark of our current collection (650,000 UZS). It features a soft natural leather drape in deep crimson, comfortable shoulder wear, and sculptural volume.

Also check out [product:kan-008] (620,000 UZS) for an alternative artisanal leather silhouette. Both models can be reserved via Telegram @kanishka_dsgn!`;
    }
    if (lang === 'uz') {
      return `[product:kan-002] — kolleksiyamizning eng mashhur modeli (650 000 so‘m). Yumshoq qizil tabiiy charm, yelkada qulay turishi va o‘ziga xos shakli bilan ajralib turadi.

Shuningdek, [product:kan-008] (620 000 so‘m) modeliga ham e'tibor qaratishingiz mumkin. Buyurtma berish uchun Telegram orqali yozishingiz mumkin: @kanishka_dsgn!`;
    }
    return `[product:kan-002] — знаковая вещь нашей коллекции (650 000 сум). Она сшита из мягкой натуральной кожи насыщенного вишнево-красного оттенка, свободно драпируется на плече и вмещает всё необходимое.

Если вы ищете строгую геометрию, обратите внимание на [product:kan-008] (620 000 сум) или универсальную [product:kan-005] (580 000 сум). Какая форма вам больше импонирует?`;
  }

  // Budget / inexpensive / canvas
  if (q.includes('недорог') || q.includes('бюджет') || q.includes('дешев') || q.includes('скидк') || q.includes('до 400') || q.includes('до 500') || q.includes('cheap') || q.includes('canvas') || q.includes('канвас')) {
    if (lang === 'en') {
      return `For accessible and durable everyday carry, the workshop offers:

1. [product:kan-007] — Heavy-duty cotton canvas tote (340,000 UZS). Incredibly tough, timeless, and easy to maintain.
2. [product:kan-012] — Denim backpack (450,000 UZS) with roomy interior.
3. [product:kan-003] — Leather wallet (180,000 UZS), an ideal compact companion.`;
    }
    return `Если ориентироваться на приятный бюджет и максимальную практичность, рекомендую:

1. [product:kan-007] — Сумка из плотного хлопкового канваса (340 000 сум). Очень выносливая, стильная и простая в уходе.
2. [product:kan-012] — Городской рюкзак из денима (450 000 сум).
3. [product:kan-003] — Кожаное портмоне (180 000 сум) — отличный вариант для подарка.

Все эти вещи шьются вручную прямо в Ташкенте.`;
  }

  // Gift query
  if (q.includes('подарок') || q.includes('gift') || q.includes('sovg') || q.includes('девушк') || q.includes('парн') || q.includes('мужчин') || q.includes('женщин')) {
    if (lang === 'en') {
      return `For gifts from Kanishka, three favourites stand out:

1. [product:kan-002] — Statement red leather shoulder bag (650,000 UZS) for someone who loves expressive design.
2. [product:kan-001] — Unisex leather backpack (730,000 UZS), universally admired.
3. [product:kan-003] — Handcrafted leather wallet (180,000 UZS) for an elegant personal gift.

Tell me who the gift is for, and I can narrow down the pick!`;
    }
    return `В качестве подарка Kanishka чаще всего выбирают:

1. [product:kan-002] — Сумку из мягкой красной кожи (650 000 сум) — яркая, тактильная и всегда привлекает внимание.
2. [product:kan-001] — Кожаный рюкзак (730 000 сум) — универсальный выбор, который прослужит годами.
3. [product:kan-003] — Компактное кожаное портмоне (180 000 сум) в фирменной лаконичной эстетике.

Подскажите, кому вы выбираете вещь и какой бюджет рассматриваете?`;
  }

  // General everyday recommendation
  if (lang === 'en') {
    return `Kanishka creates small-batch bags from natural leather, canvas, and denim in Tashkent. Here are the top three picks for everyday use:

1. [product:kan-002] — Soft red leather shoulder bag (650,000 UZS).
2. [product:kan-001] — Structure leather backpack (730,000 UZS).
3. [product:kan-007] — Tough canvas everyday tote (340,000 UZS).

What style or materials do you prefer: structured leather, soft drape, or textile?`;
  }

  if (lang === 'uz') {
    return `Kanishka ustaxonasi tabiiy charm, kanvas va denimdan noyob sumkalar yaratadi. Har kunlik qulaylik uchun eng yaxshi tanlovlar:

1. [product:kan-002] — Qizil yumshoq charm sumka (650 000 so‘m).
2. [product:kan-001] — Qulay va mustahkam charm ryukzak (730 000 so‘m).
3. [product:kan-007] — Chidamli paxta kanvasidan yasalgan sumka (340 000 so‘m).

Sizga qanday hajm va material ma’qulroq?`;
  }

  return `В нашей мастерской вещи шьются вручную малыми сериями. Вот три главных фаворита на каждый день:

1. [product:kan-002] — Мягкая сумка через плечо из выразительной красной кожи (650 000 сум).
2. [product:kan-001] — Вместительный рюкзак из натуральной кожи (730 000 сум) для города и поездок.
3. [product:kan-007] — Лёгкая и прочная сумка из канваса (340 000 сум).

Расскажите чуть подробнее: вам больше нравятся сумки на плечо или рюкзаки, и важен ли материал (кожа или хлопок)?`;
}
