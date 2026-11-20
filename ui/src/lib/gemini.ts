import { products } from '../data/products';
import type { Lang } from './types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  suggestedProductIds?: string[];
  timestamp: number;
}

// Complete catalog of Kanishka atelier (all 12 handcrafted items)
const KANISHKA_CATALOG = products.map((p) => ({
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
  const catalogSummary = KANISHKA_CATALOG.map(
    (b) =>
      `• [product:${b.id}] ${b.name} (${b.category === 'bags' ? 'Сумка/Рюкзак' : b.category === 'accessories' ? 'Аксессуар' : 'Одежда'}): ТОЧНАЯ ЦЕНА ${b.priceUZS.toLocaleString('ru-RU')} сум, размер ${b.dimensions}, материал: ${b.material}. Описание: ${b.descRu}. Фирменная фича: ${b.detailNote || 'Авторский ручной крой Kanishka'}`
  ).join('\n');

  return `Ты — персональный стилист-консультант бренда Kanishka (Ташкент, Узбекистан).
Твой профиль: безупречный вкус, живая естественная речь без штампов, глубокое знание авторских изделий, чуткость к запросу клиента и тактичные экспертные продажи.

В ПЕРВУЮ ОЧЕРЕДЬ ТЫ ПРЕДСТАВЛЯЕШЬ БРЕНД KANISHKA:
- Всегда говори от лица бренда Kanishka: «в Kanishka», «наши мастера», «в нашей коллекции», «наша мастерская в Ташкенте».
- СТРОГОЕ ТАБУ: НЕ ДЕЛАЙ акцент на имени основателя (Алексея Маньшаева) и НЕ упоминай его имя по собственной инициативе! Если только клиент прямо сам не спросит «кто дизайнер/основатель», вообще не называй фамилию Маньшаев. Наш главный бренд и имя — KANISHKA!

ГЛАВНЫЕ ЗАКОНЫ КОНСУЛЬТАЦИИ И ХАРНЕСС:

1. СТРОЖАЙШИЙ ЗАКОН БЮДЖЕТА И ЛИМИТОВ (КРИТИЧЕСКИ ВАЖНО):
   Если клиент упоминает ЛЮБОЙ лимит, бюджет или ограничение по цене (например: «лимит 300к», «до 500 000 сум», «бюджет 400 тыс», «не дороже 300», «есть 200 000 сум», «до 500», «потолок 450к»):
   - ТЫ ОБЯЗАН СТРОЖАЙШЕ соблюдать лимит!
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО называть или рекомендовать товары, цена которых превышает указанный лимит (даже на 10 000 сум дороже — нельзя)!
   - Если клиент назвал лимит 300 000 сум, ЗАПРЕЩЕНО советовать ZARAFOT (650 000) или TOKIM 3 (730 000). Предложи ABDULLAJON (280 000 сум), PAKHTAKOR 2 (260 000 сум) или PITAK 4 (160 000 сум).
   - Если клиент назвал лимит 500 000 сум — предложи CHOPON (400 000 сум), TOKIM BIG (480 000 сум), ABDULLAJON (280 000 сум), PAKHTAKOR 2 (260 000 сум).
   - Сразу подтверди, что ты подобрал изделия строго в рамках бюджета: «Отличный ориентир! Отобрал варианты Kanishka строго в пределах вашего бюджета до [Сумма] сум:»

2. СТРОГИЙ ЗАПРЕТ НА ЗВЁЗДОЧКИ И ДУБЛИ В НАЗВАНИЯХ:
   НИКОГДА не используй маркдаун со звёздочками (**слово** или *слово*). Названия товаров пиши чистым текстом ЗАГЛАВНЫМИ БУКВАМИ ОДИН РАЗ (например: ZARAFOT, TOKIM 3, PAKHTAKOR 2, CHOPON, ABDULLAJON, SOMSA). Никогда не дублируй название подряд!

3. ОБЯЗАТЕЛЬНОЕ ПРАВИЛО: ФИЧА ПОСЛЕ КАЖДОГО ПРЕДЛОЖЕНИЯ ТОВАРА:
   Каждый раз, когда ты предлагаешь модель, СРАЗУ ЖЕ раскрой её конкретную уникальную фичу, тактильность или эргономику:
   - ZARAFOT: сшита из тонкой вишневой кожи особой пластичной выделки, мягко драпируется на теле как шарф, а со временем приобретает благородный винтажный лоск.
   - TOKIM 3: плотная фактурная кожа держит строгую форму, внутри защищенный отсек под планшет или книгу, а анатомические широкие лямки не давят на плечи при долгих прогулках.
   - TOKIM BIG: прочный хлопковый деним на 33 литра с мягким карманом под ноутбук, очень легкий и выносливый в поездках.
   - PAKHTAKOR 2: сверхпрочный натуральный хлопок канвас, который дышит, легко чистится, выдерживает ноутбук и ежедневную нагрузку.
   - ABDULLAJON: компактная сумка из натуральной кожи с клапаном на кнопке, идеально вмещает смартфон, паспорт и ключи, оставляя руки свободными.
   - CHOPON: натуральная кожа с контрастным авторским кроем и удобными длинными ручками для ношения на плече или в руке.
   - FARROSH: вместительный шоппер из мягкой кожи с цельнокроеными ручками, выдерживает до 10 кг покупок, документы формата А4 или ноутбук.
   - PITAK 4: компактное кожаное портмоне ручной работы на кнопке с четкими слотами под банковские карты и купюры.
   - SOMSA: оригинальный кожаный аксессуар в форме узбекской самсы с надежным металлическим карабином для ключей или фурнитуры сумки.
   - BOSHLIK: теплый и стильный авторский капор-шапка из мягкого трикотажа, защищает от ветра и заменяет шарф.
   - KOYLYAK 2W: женская рубашка свободного авторского кроя Free Size из 100% натурального дышащего хлопка.
   - CHIPOLLINO M: мужские брюки из плотного хлопка с комфортной посадкой и авторской геометрией карманов.

4. МАРКЕРЫ КАРТОЧЕК [product:ID]:
   Всегда указывай маркер [product:ID] рядом с названием модели (например: [product:kan-002] ZARAFOT, [product:kan-008] CHOPON), чтобы в чате появилась интерактивная карточка с фотографией, ценой и ссылкой.

5. ОБРАБОТКА НЕОПРЕДЕЛЕННЫХ ЗАПРОСОВ («хз что хочу», «не знаю что выбрать», «посоветуй что-нибудь»):
   Отреагируй живо и дружелюбно: «Прекрасное состояние! Когда нет жестких рамок, проще всего найти вещь по любви.» Задай 1–2 понятных вопроса для сужения выбора (сумка или рюкзак, кожа или текстиль) и предложи 2 контрастных хита с фичами.

6. МЯГКИЙ ПРИЗЫВ К ЗАКАЗУ (SOFT CLOSE):
   Напоминай, что все вещи Kanishka отшиваются в Ташкенте малыми авторскими сериями, поэтому тиражи быстро заканчиваются.
   СТРОГОЕ ТАБУ НА ВНЕШНИЕ ССЫЛКИ: КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО вставлять ссылки на Telegram, писать «(https://t.me/kanishka_dsgn)», «@kanishka_dsgn» или любые другие внешние URL в текст ответов!
   Вместо внешних ссылок предлагай покупателю кликнуть на карточку интересующего товара выше, чтобы рассмотреть детали, или задать вопрос прямо здесь в чате.

7. АДРЕСА МАГАЗИНОВ В ТАШКЕНТЕ:
   Если клиент спрашивает «где вы находитесь?», «где посмотреть вживую?», «адреса магазинов» или «где примерить»:
   Назови три фирменных магазина Kanishka в Ташкенте (все работают ежедневно с 10:00 до 20:00):
   1. ул. Шота Руставели, 39 (Яккасарайский р-н, ориентир: памятник Шота Руставели)
   2. ул. Афросиаб, 39 (Мирабадский р-н, ориентир: станция метро Ойбек / Минг Урик)
   3. ул. Оккурган, 21 (Мирзо-Улугбекский р-н, ориентир: спорткомплекс «Ёшлик»)

Язык ответа: всегда отвечай на языке клиента. Текущий язык: ${lang}.

Актуальный каталог мастерской Kanishka:
${catalogSummary}`;
}

/**
 * Parses user input to extract any budget or price limit constraint.
 * Handles "лимит 500к", "до 300 000 сум", "бюджет 200 тыс", "до 400", "не дороже 250k".
 */
export function extractBudget(query: string): number | null {
  const q = query.toLowerCase();

  // Pattern with keywords: "лимит 500к", "бюджет 300 000", "до 400", "не дороже 280к", "есть 200к", "потолок 500"
  const kwMatch = q.match(
    /(?:лимит|бюджет|до|не дороже|в пределах|около|максимум|потолок|есть|в районе|рассчитываю на)\s*[:=]?\s*(\d+[\s\d]*)\s*(к|k|тыс|тысяч|сум)?/i
  );
  if (kwMatch && kwMatch[1]) {
    const raw = kwMatch[1].replace(/\s/g, '');
    let val = parseFloat(raw);
    const unit = kwMatch[2] ? kwMatch[2].toLowerCase() : '';
    if (unit.startsWith('к') || unit.startsWith('k') || unit.startsWith('тыс')) {
      val *= 1000;
    } else if (val < 1000) {
      val *= 1000; // e.g. "до 500" in UZS context means 500 000!
    }
    return isNaN(val) ? null : val;
  }

  // General "300к", "500k", "400тыс"
  const kMatch = q.match(/(\d+)\s*(к|k|тыс)\b/i);
  if (kMatch && kMatch[1]) {
    let val = parseInt(kMatch[1], 10) * 1000;
    if (val < 1000) val *= 1000;
    return isNaN(val) ? null : val;
  }

  // Full sum like "300000 сум" or "500 000 сум"
  const sumMatch = q.match(/(\d{2,4}[\s]?000)\s*(?:сум|uzs)?/i);
  if (sumMatch && sumMatch[1]) {
    const val = parseInt(sumMatch[1].replace(/\s/g, ''), 10);
    return isNaN(val) ? null : val;
  }

  return null;
}

export function parseProductIds(
  text: string,
  userPrompt: string = ''
): { cleanText: string; productIds: string[] } {
  const productIds: string[] = [];

  // Normalize any legacy draft names first
  let cleanText = text.replace(/CHOPON\s*B(?:\s*\(2\))?/gi, 'CHOPON');

  // 1. Extract explicit markers [product:kan-XXX]
  const regex = /\[product:(kan-\d{3})\]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleanText)) !== null) {
    const id = match[1];
    if (id && !productIds.includes(id)) {
      productIds.push(id);
    }
  }

  // 2. Also detect product names mentioned in text even if model omitted markers!
  const lowerText = cleanText.toLowerCase();
  for (const prod of products) {
    if (lowerText.includes(prod.name.toLowerCase()) && !productIds.includes(prod.id)) {
      productIds.push(prod.id);
    }
  }

  // 3. Clean markers out of prose without duplicating product names
  for (const id of productIds) {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      const escaped = prod.name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

      // If name is already right before marker: e.g. "CHOPON [product:kan-008]" -> "CHOPON"
      const beforeRegex = new RegExp(`(${escaped})\\s*\\[product:${id}\\]`, 'gi');
      cleanText = cleanText.replace(beforeRegex, '$1');

      // If name is already right after marker: e.g. "[product:kan-008] CHOPON" -> "CHOPON"
      const afterRegex = new RegExp(
        `\\[product:${id}\\]\\s*(?:\\*\\*)?\\s*(${escaped})\\s*(?:\\*\\*)?`,
        'gi'
      );
      cleanText = cleanText.replace(afterRegex, prod.name);

      // Otherwise if marker is standalone without name: replace with name
      cleanText = cleanText.replace(`[product:${id}]`, prod.name);
    } else {
      cleanText = cleanText.replace(`[product:${id}]`, '');
    }
  }

  // 4. Deduplicate any accidentally repeated product names: e.g. "CHOPON CHOPON" or "CHOPON(CHOPON)" -> "CHOPON"
  for (const prod of products) {
    const escaped = prod.name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const dupRegex = new RegExp(`(${escaped})(?:\\s+|\\s*\\()+\\1\\)?`, 'gi');
    cleanText = cleanText.replace(dupRegex, '$1');
  }
  // Generic word deduplication for product-like uppercase names: e.g. "CHOPON CHOPON" or "CHOPONCHOPON"
  cleanText = cleanText.replace(/\b([A-Z]{3,})\s*\1\b/g, '$1');

  // 5. Filter out unsolicited mentions of Alexei Manshaev (focus strictly on Kanishka brand)
  const askedAboutFounder = /кто.*(?:основатель|дизайнер|создал|маньшаев)|чей.*бренд/i.test(userPrompt);
  if (!askedAboutFounder) {
    cleanText = cleanText
      .replace(/(?:авторской\s+)?мастерск(?:ой|ая|ую|е)\s+Алексея\s+Маньшаева/gi, 'коллекции Kanishka')
      .replace(/дизайнера\s+Алексея\s+Маньшаева/gi, 'дизайнеров Kanishka')
      .replace(/Алексея\s+Маньшаева/gi, 'Kanishka')
      .replace(/Алексей\s+Маньшаев/gi, 'Kanishka');
  }

  // 6. Strip all markdown bold/italic asterisks completely
  cleanText = cleanText
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\*\*/g, '')
    .trim();

  // 7. Strip Telegram links, handles and URLs completely: e.g. (https://t.me/kanishka_dsgn), @kanishka_dsgn
  cleanText = cleanText
    .replace(/\(?https?:\/\/t\.me\/[a-zA-Z0-9_/?=.-]+\)?/gi, '')
    .replace(/@kanishka_dsgn/gi, '')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // 8. Ensure space before opening parenthesis: e.g. "PAKHTAKOR 2(260 000 сум)" -> "PAKHTAKOR 2 (260 000 сум)"
  cleanText = cleanText.replace(/([A-Z0-9А-Яа-я])\(/g, '$1 (');

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
      const parsed = parseProductIds(response, userPrompt);

      // Validate budget limit on Gemini response: if user gave a budget, ensure no over-budget cards
      const budget = extractBudget(userPrompt);
      if (budget) {
        parsed.productIds = parsed.productIds.filter((id) => {
          const prod = products.find((p) => p.id === id);
          return prod ? prod.priceUZS <= budget : false;
        });
      }

      return { text: parsed.cleanText, suggestedProductIds: parsed.productIds };
    } catch (err) {
      console.warn('[Kanishka AI] Gemini API call error, falling back to local advisor:', err);
    }
  }

  // Graceful fallback to smart local consultant if no key or API failed
  const fallback = localConsultantFallback(userPrompt, lang);
  const parsed = parseProductIds(fallback, userPrompt);
  return { text: parsed.cleanText, suggestedProductIds: parsed.productIds };
}

async function callGeminiApi(
  history: ChatMessage[],
  userPrompt: string,
  lang: Lang,
  apiKey: string
): Promise<string> {
  const systemInstruction = buildSystemInstruction(lang);

  // Sanitize history: ensure it starts with a user turn and exclude initial welcome message
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

  // Prioritize stable Gemini 3.5 models
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
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
 * Intelligent local advisor that delivers high quality, budget-aware recommendations
 * even when offline or during API rate limits.
 */
function localConsultantFallback(query: string, _lang: Lang): string {
  const q = query.toLowerCase().trim();
  const budget = extractBudget(query);

  // 1. STRICT BUDGET / LIMIT HANDLING
  if (budget !== null) {
    const affordable = products
      .filter((p) => p.priceUZS <= budget)
      .sort((a, b) => b.priceUZS - a.priceUZS);

    if (affordable.length === 0) {
      return `В мастерской Kanishka все вещи создаются вручную из натуральной кожи и хлопка.
Самый доступный авторский аксессуар мастерской — это кожаный брелок [product:kan-004] SOMSA (80 000 сум) и теплый капор [product:kan-011] BOSHLIK (130 000 сум).

Подскажите, какой формат изделия вы ищете?`;
    }

    // Pick top 2-3 affordable items matching category if mentioned
    let picks = affordable;
    if (q.includes('рюкзак') || q.includes('backpack')) {
      const bpacks = affordable.filter((p) => p.slug.includes('tokim'));
      if (bpacks.length > 0) picks = bpacks;
    } else if (q.includes('сумк') || q.includes('bag')) {
      const bags = affordable.filter((p) => p.category === 'bags');
      if (bags.length > 0) picks = bags;
    }

    const topPicks = picks.slice(0, 3);
    const itemsText = topPicks
      .map(
        (p, i) =>
          `${i + 1}. [product:${p.id}] ${p.name} (${p.priceUZS.toLocaleString('ru-RU')} сум) — ${p.specs.dimensions !== '—' ? `размер ${p.specs.dimensions}. ` : ''}${p.detailNote?.ru || p.description.ru}`
      )
      .join('\n\n');

    return `Отличный ориентир! Отобрал для вас изделия Kanishka строго в пределах вашего бюджета до ${budget.toLocaleString('ru-RU')} сум:

${itemsText}

Все модели отшиваются небольшими сериями в мастерской Kanishka. Какая из них вам ближе по стилю и задачам?`;
  }

  // 2. VAGUE / UNDECIDED: "хз что хочу", "не знаю", "посоветуй", "что выбрать"
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
    return `Самое лучшее состояние! Когда нет жестких рамок, проще всего найти вещь по любви и зову сердца.

Давайте нащупаем направление:
1. Вам ближе свободная сумка на плечо или городской рюкзак, чтобы руки оставались свободными?
2. Больше нравится тактильная натуральная кожа или легкий дышащий хлопковый канвас?

Чтобы было от чего оттолкнуться, покажу два главных хита Kanishka:

1. [product:kan-002] ZARAFOT (650 000 сум) — Скульптурная сумка из тонкой вишневой кожи особой пластичной выделки, которая мягко драпируется на теле как шарф, а со временем приобретает благородный винтажный лоск.
2. [product:kan-001] TOKIM 3 (730 000 сум) — Плотная фактурная кожа отлично держит строгую форму, внутри защищенный отсек под планшет или книгу, а анатомические лямки не давят на плечи при долгих прогулках.

Какой из этих двух форматов вам ближе по ритму жизни?`;
  }

  // 3. GREETINGS
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
    return `Здравствуйте! Рад приветствовать вас в Kanishka. Чем могу быть полезен сегодня?

Подбираете сумку или рюкзак для себя, или присматриваете особенный подарок? Могу сориентировать по нашей коллекции:
1. [product:kan-002] ZARAFOT — Скульптурная сумка из тонкой вишневой кожи, которая мягко драпируется на теле как ткань и привлекает восхищенные взгляды.
2. [product:kan-001] TOKIM 3 — Плотная фактурная кожа отлично держит строгую форму, внутри защищенный отсек под планшет или книгу, а лямки не давят на плечи.

Какой формат вам ближе по стилю и ритму дня?`;
  }

  // 4. BACKPACKS
  if (
    q.includes('рюкзак') ||
    q.includes('backpack') ||
    q.includes('ryukzak') ||
    q.includes('ноутбук') ||
    q.includes('laptop')
  ) {
    return `Для документов, учебы или города в Kanishka есть два выразительных рюкзака:

1. [product:kan-001] TOKIM 3 (730 000 сум) — Плотная зернистая кожа держит форму, защищает гаджеты от ударов, а внутри сделан отдельный карман под планшет и книги.
2. [product:kan-012] TOKIM BIG (480 000 сум) — Вместительный рюкзак на 33 литра из хлопкового денима с карманом под ноутбук, идеален для поездок.

Какой материал вам ближе: фактурная авторская кожа или легкий практичный деним?`;
  }

  // 5. SHOULDER BAGS / CROSSBODY
  if (
    q.includes('плечо') ||
    q.includes('shoulder') ||
    q.includes('crossbody') ||
    q.includes('красн') ||
    q.includes('zarafot')
  ) {
    return `С удовольствием расскажу о сумках Kanishka через плечо:

1. [product:kan-002] ZARAFOT (650 000 сум) — Наш главный бестселлер: мягчайшая вишневая кожа струится и подстраивается под движения тела, а скрытые складки создают визуальный объем.
2. [product:kan-009] ABDULLAJON (280 000 сум) — Компактная кроссбоди из натуральной кожи на кнопке, рассчитана под телефон, ключи и документы.
3. [product:kan-008] CHOPON (400 000 сум) — Кожаная сумка графичного кроя с длинными ручками.

Какая форма больше откликается вашему гардеробу?`;
  }

  // 6. GIFTS
  if (
    q.includes('подарок') ||
    q.includes('gift') ||
    q.includes('sovg') ||
    q.includes('девушк') ||
    q.includes('парн') ||
    q.includes('мужчин') ||
    q.includes('женщин')
  ) {
    return `В качестве подарка в Kanishka чаще всего выбирают:

1. [product:kan-002] ZARAFOT (650 000 сум) — Знаковая вишневая сумка из струящейся натуральной кожи, которая производит «вау-эффект» с первого прикосновения.
2. [product:kan-003] PITAK 4 (160 000 сум) — Лаконичное кожаное портмоне ручной работы на кнопке, универсальный памятный подарок.
3. [product:kan-004] SOMSA (80 000 сум) — Фирменный кожаный брелок с карабином в виде традиционной узбекской самсы.

Подскажите, кому выбираете подарок и какой бюджет рассматриваете?`;
  }

  // 7. STORE LOCATIONS / BRANCHES
  if (
    q.includes('где вы') ||
    q.includes('где находитесь') ||
    q.includes('адрес') ||
    q.includes('магазин') ||
    q.includes('шоурум') ||
    q.includes('филиал') ||
    q.includes('вживую') ||
    q.includes('примерить')
  ) {
    return `Будем рады видеть вас в наших магазинах в Ташкенте! У Kanishka три фирменных пространства:

1. ул. Шота Руставели, 39 (Яккасарайский р-н, ориентир: памятник Шота Руставели).
2. ул. Афросиаб, 39 (Мирабадский р-н, станция метро Ойбек / Минг Урик).
3. ул. Оккурган, 21 (Мирзо-Улугбекский р-н, ориентир: спорткомплекс «Ёшлик»).

Все магазины открыты ежедневно с 10:00 до 20:00. Приходите примерить вещи и оценить тактильность авторской кожи!`;
  }

  // 8. GENERAL EVERYDAY RECOMMENDATION
  return `В Kanishka все изделия создаются вручную малыми авторскими сериями. Вот три главных фаворита с их фичами:

1. [product:kan-002] ZARAFOT (650 000 сум) — Мягкая вишневая кожа красиво драпируется на теле как ткань и приобретает винтажный лоск со временем.
2. [product:kan-007] PAKHTAKOR 2 (260 000 сум) — Сумка из хлопкового канваса: вмещает ноутбук, не боится стирки и идеальна на каждый день.
3. [product:kan-001] TOKIM 3 (730 000 сум) — Плотная натуральная кожа держит форму, защищает гаджеты, а широкие анатомические лямки не давят на плечи.

Расскажите подробнее: вам ближе сумка на плечо, городской рюкзак или практичный текстиль?`;
}
