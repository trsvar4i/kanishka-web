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
      `• [product:${b.id}] ${b.name} (${b.category === 'bags' ? 'Сумка/Рюкзак' : 'Аксессуар'}): цена ${b.priceUZS.toLocaleString('ru-RU')} сум, размер ${b.dimensions}, материал: ${b.material}. Описание: ${b.descRu}. Ключевая фича: ${b.detailNote || 'Авторский крой и премиальная выделка'}`
  ).join('\n');

  return `Ты — персональный стилист-консультант авторской мастерской Kanishka (Ташкент, Узбекистан), основанной дизайнером Алексеем Маньшаевым.
Твой профиль: безупречный вкус, живая естественная речь без штампов и канцелярита, глубокое знание кожи и материалов, искренняя забота и тактичные экспертные продажи.

ГЛАВНЫЕ ПРАВИЛА ОБЩЕНИЯ И ХАРНЕСС:

1. ЖИВОЙ ТОН И СЛЕНГ:
   Общайся как внимательный стилист в бутике авторских вещей. Пиши легко, уверенно и дружелюбно.
   Если клиент пишет неформально («хз что хочу», «не знаю что выбрать», «посоветуй что-нибудь», «хочу что-то прикольное»):
   - Отреагируй тепло и с пониманием: «Прекрасное состояние! Когда нет жестких рамок, проще всего найти вещь по любви и велению сердца.»
   - Задай 1–2 простых вопроса, чтобы сузить выбор (например: «Что ближе — сумка на плечо или удобный рюкзак?», «Ищете вещь на каждый день или под особый повод?»).
   - Сразу предложи 2 контрастных хита с фичами и прикрепи их маркеры [product:ID].

2. СТРОГИЙ ЗАПРЕТ НА ЗВЁЗДОЧКИ:
   НИКОГДА не используй маркдаун со звёздочками (**слово** или *слово*). Названия товаров и брендов пиши просто ЧИСТЫМ ТЕКСТОМ ЗАГЛАВНЫМИ БУКВАМИ (например: ZARAFOT, TOKIM 3, SOMSA, PITAK 4), без звёздочек вокруг!

3. ОБЯЗАТЕЛЬНОЕ ПРАВИЛО: ФИЧА ПОСЛЕ КАЖДОГО ПРЕДЛОЖЕНИЯ ТОВАРА:
   Каждый раз, когда ты предлагаешь модель, СРАЗУ ЖЕ раскрой её ключевую фичу, тактильность или эргономику:
   - ZARAFOT — [product:kan-002] ZARAFOT: сшита из тонкой вишневой кожи особой пластичной выделки, которая мягко драпируется на теле как ткань, а со временем приобретает благородный винтажный блеск.
   - TOKIM 3 — [product:kan-001] TOKIM 3: плотная фактурная кожа отлично держит строгую форму, внутри защищенный отсек под планшет или книгу, а широкие лямки не натирают плечи.
   - SOMSA — [product:kan-004] SOMSA: авторская треугольная геометрия по мотивам традиционной узбекской выпечки со скрытым карманом на молнии для самого ценного.
   - FARROSH — [product:kan-005] FARROSH: вместительный шоппер с цельнокроеными кожаными ручками, выдерживает ноутбук, документы и покупки.
   - PAKHTAKOR 2 — [product:kan-007] PAKHTAKOR 2: сверхпрочный натуральный хлопок канвас, который дышит, легко чистится и не боится путешествий.

4. МАРКЕРЫ КАРТОЧЕК [product:ID]:
   Всегда указывай маркер [product:ID] рядом с упоминанием товара, чтобы в интерфейсе появлялась кликабельная интерактивная карточка с фото и ценой.

5. МЯГКИЙ ПРИЗЫВ К ЗАКАЗУ (SOFT CLOSE):
   Напоминай, что все вещи Алексея Маньшаева отшиваются в Ташкенте малыми авторскими сериями, поэтому тиражи быстро заканчиваются.
   Предлагай забронировать модель или уточнить расцветки в Telegram мастерской: @kanishka_dsgn (https://t.me/kanishka_dsgn).

Язык ответа: всегда отвечай на языке клиента. Текущий язык: ${lang}.

Каталог мастерской Kanishka:
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

  // Clean markers out of prose and replace with clean product name without asterisks
  let cleanText = text;
  for (const id of productIds) {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      const nameRegex = new RegExp(
        `\\[product:${id}\\]\\s*(\\*\\*${prod.name}\\*\\*|\\*${prod.name}\\*|${prod.name})?`,
        'gi'
      );
      cleanText = cleanText.replace(nameRegex, prod.name);
    } else {
      cleanText = cleanText.replace(`[product:${id}]`, '');
    }
  }

  // Strip all markdown bold/italic asterisks completely
  cleanText = cleanText
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\*\*/g, '')
    .trim();

  return { cleanText, productIds };
}

export async function askGemini(
  history: ChatMessage[],
  userPrompt: string,
  lang: Lang,
  customApiKey?: string
): Promise<{ text: string; suggestedProductIds: string[] }> {
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_GEMINI_API_KEY
      ? (import.meta.env.PUBLIC_GEMINI_API_KEY as string)
      : '') ||
    customApiKey ||
    '';

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

  // Sanitize history: ensure it starts with a user turn
  const sanitizedHistory = history
    .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
    .slice(-8)
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

  const contents = [
    ...sanitizedHistory,
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

  // List of active models prioritized by stability
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
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
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const answer = parts
        .map((p: any) => p.text || '')
        .filter(Boolean)
        .join('');

      if (answer && answer.trim().length > 0) return answer;
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

  // Vague / Undecided queries: "хз что хочу", "не знаю", "посоветуй", "что выбрать"
  if (
    q.includes('хз') ||
    q.includes('не знаю') ||
    q.includes('посоветуй') ||
    q.includes('что выбрать') ||
    q.includes('что взять') ||
    q.includes('глаза разбегаются') ||
    q.includes('idk') ||
    q.includes('not sure') ||
    q.includes('recommend')
  ) {
    if (lang === 'en') {
      return `That is actually the best starting point! When there are no rigid limits, it is much easier to find a piece you truly fall in love with.

To help narrow down the direction:
1. Do you prefer a relaxed shoulder bag or a structured backpack for freedom of movement?
2. Are you drawn to tactile genuine leather or lightweight organic canvas?

Here are our two most celebrated workshop icons to inspire you:

1. [product:kan-002] ZARAFOT (650 000 UZS) — Sculptural shoulder bag crafted from supple crimson leather that drapes organically around the body and gains a vintage patina over time.
2. [product:kan-001] TOKIM 3 (730 000 UZS) — Signature structured backpack in rich natural leather, featuring a padded tablet sleeve and ergonomic straps that never strain your shoulders.

Which of these two moods resonates more with your style?`;
    }

    if (lang === 'uz') {
      return `Bu ayni muddao! Qat'iy chegaralar bo'lmaganda, haqiqatan ham yoqadigan buyumni topish ancha osonroq bo'ladi.

Tanlovni aniqlashtirish uchun:
1. Sizga ko'proq yelkaga osiladigan yumshoq sumka yoqadimi yoki harakat erkinligini beruvchi ryukzakmi?
2. Tabiiy yumshoq charm ma'qulmi yoki yengil paxta kanvasi?

Ilhom olish uchun ustaxonamizning ikkita asosiy hitini tavsiya qilaman:

1. [product:kan-002] ZARAFOT (650 000 so‘m) — Mayin qizil tabiiy charmdan tikilgan, yelkada qulay драпировка bo‘ladigan va vaqt o‘tishi bilan yanada chiroyli ochiladigan mualliflik sumkasi.
2. [product:kan-001] TOKIM 3 (730 000 so‘m) — Shaklini mustahkam saqlovchi tabiiy charm ryukzak, ichida planshet uchun himoyalangan bo‘lmasi bor va yelkaga og‘irlik tushirmaydi.

Sizga qaysi yo'nalish ko'proq ma'qul?`;
    }

    return `Самое лучшее состояние! Когда нет жестких рамок, проще всего найти вещь по любви и зову сердца.

Давайте нащупаем направление:
1. Вам ближе свободная сумка на плечо или городской рюкзак, чтобы руки оставались свободными?
2. Больше нравится тактильная натуральная кожа или лёгкий дышащий хлопковый канвас?

Чтобы было от чего оттолкнуться, покажу два главных хита мастерской:

1. [product:kan-002] ZARAFOT (650 000 сум) — Скульптурная сумка из тонкой вишневой кожи особой пластичной выделки, которая мягко драпируется на теле как шарф, а со временем приобретает благородный винтажный лоск.
2. [product:kan-001] TOKIM 3 (730 000 сум) — Плотная фактурная кожа отлично держит строгую форму, внутри защищенный отсек под планшет или книгу, а анатомические лямки не давят на плечи при долгих прогулках.

Какой из этих двух форматов вам ближе по ритму жизни?`;
  }

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

I can guide you through our natural leather essentials:
1. [product:kan-002] ZARAFOT — Sculptural shoulder bag crafted from supple crimson leather that drapes naturally like silk.
2. [product:kan-001] TOKIM 3 — Structured genuine leather backpack designed for everyday city carry with a protected tablet compartment.

Which format fits your daily rhythm better?`;
    }
    if (lang === 'uz') {
      return `Assalomu alaykum! Kanishka mualliflik ustaxonasiga xush kelibsiz. Bugun sizga qanday yordam bera olaman?

O‘zingiz uchun har kunlik sumka yoki ryukzak tanlayapsizmi, yoki esda qolarli sovg‘a qidiryapsizmi?

Bizning eng mashhur modellarimiz:
1. [product:kan-002] ZARAFOT — Yumshoq qizil tabiiy charmdan tikilgan, yelkada qulay turadigan va vaqt o'tishi bilan yanada chiroyli tus oladigan sumka.
2. [product:kan-001] TOKIM 3 — Shaklini ajoyib saqlovchi mustahkam charm ryukzak, ichida planshet va kitoblar uchun qulay bo'lmasi bor.

Sizga qaysi shakl ko‘proq ma’qul?`;
    }
    return `Здравствуйте! Рад приветствовать вас в мастерской Kanishka. Чем могу быть полезен сегодня?

Подбираете сумку или рюкзак для себя, или присматриваете особенный подарок? Могу показать наши главные хиты с характером:
1. [product:kan-002] ZARAFOT — Скульптурная сумка из тонкой вишневой кожи, которая мягко драпируется на теле как ткань и привлекает восхищенные взгляды.
2. [product:kan-001] TOKIM 3 — Плотная фактурная кожа отлично держит строгую форму, внутри защищенный отсек под планшет или книгу, а лямки не давят на плечи.

Какой формат вам ближе по стилю и ритму дня?`;
  }

  // Backpack query
  if (q.includes('рюкзак') || q.includes('backpack') || q.includes('ryukzak') || q.includes('ноутбук') || q.includes('laptop')) {
    return `Для документов, учебы или города у нас есть два выразительных рюкзака:

1. [product:kan-001] TOKIM 3 (730 000 сум) — Плотная зернистая кожа держит форму, защищает гаджеты от ударов, а внутри сделан отдельный карман под планшет и книги.
2. [product:kan-012] TOKIM BIG (450 000 сум) — Сверхлегкий хлопковый деним выдерживает интенсивную ежедневную носку и легко стирается при необходимости.

Какой материал вам ближе: фактурная авторская кожа или легкий практичный деним?`;
  }

  // Crossbody / Shoulder / ZARAFOT
  if (q.includes('zarafot') || q.includes('плечо') || q.includes('shoulder') || q.includes('crossbody') || q.includes('красн') || q.includes('red')) {
    return `С удовольствием расскажу о наших сумках на плечо:

1. [product:kan-002] ZARAFOT (650 000 сум) — Наш главный бестселлер: мягчайшая вишневая кожа струится и подстраивается под движения тела, а скрытые складки создают потрясающий визуальный объем.
2. [product:kan-004] SOMSA (620 000 сум) — Оригинальная треугольная геометрия, вдохновленная традиционной восточной эстетикой, со скрытой молнией для безопасности.
3. [product:kan-005] FARROSH (580 000 сум) — Вместительный лаконичный шоппер с цельнокроеными кожаными ручками под ноутбук и рабочие документы.

Какая форма больше откликается вашему гардеробу?`;
  }

  // Budget / inexpensive / canvas
  if (q.includes('недорог') || q.includes('бюджет') || q.includes('дешев') || q.includes('скидк') || q.includes('до 400') || q.includes('до 500') || q.includes('cheap') || q.includes('canvas') || q.includes('канвас')) {
    return `Если важны легкость, практичность и приятный бюджет, обратите внимание на эти изделия:

1. [product:kan-007] PAKHTAKOR 2 (340 000 сум) — Суровый натуральный хлопковый канвас: неубиваемый, дышащий материал, не боится стирки и держит до 15 кг.
2. [product:kan-003] ABDULLAJON (180 000 сум) — Компактный кошелек из натуральной кожи с фирменным тиснением мастерской.
3. [product:kan-012] TOKIM BIG (450 000 сум) — Вместительный городской рюкзак из денима на каждый день.

Все вещи шьются вручную прямо в Ташкенте.`;
  }

  // Gift query
  if (q.includes('подарок') || q.includes('gift') || q.includes('sovg') || q.includes('девушк') || q.includes('парн') || q.includes('мужчин') || q.includes('женщин')) {
    return `В качестве подарка с душой и историей чаще всего выбирают:

1. [product:kan-002] ZARAFOT (650 000 сум) — Знаковая вишневая сумка из струящейся натуральной кожи, которая производит «вау-эффект» с первого прикосновения.
2. [product:kan-001] TOKIM 3 (730 000 сум) — Универсальный кожаный рюкзак унисекс, который носится годами и красиво стареет.
3. [product:kan-003] ABDULLAJON (180 000 сум) — Лаконичное кожаное портмоне ручной работы в фирменной крафтовой упаковке.

Подскажите, кому выбираете подарок, и я помогу определиться точнее!`;
  }

  // General everyday recommendation
  return `В нашей мастерской все изделия создаются вручную малыми авторскими сериями. Вот три главных фаворита с их фичами:

1. [product:kan-002] ZARAFOT (650 000 сум) — Мягкая вишневая кожа красиво драпируется на теле как ткань и приобретает винтажный лоск со временем.
2. [product:kan-001] TOKIM 3 (730 000 сум) — Плотная натуральная кожа держит форму, защищает гаджеты, а широкие анатомические лямки не давят на плечи.
3. [product:kan-007] PAKHTAKOR 2 (340 000 сум) — Сверхпрочный хлопковый канвас: не боится стирки, легко складывается и выдерживает любые нагрузки.

Расскажите подробнее: вам ближе сумка на плечо, городской рюкзак или практичный текстиль?`;
}
