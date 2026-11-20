// Каталог авторских изделий Kanishka Tashkent
const PRODUCTS = [
  {
    id: "kan-001",
    category: "bags",
    audience: "unisex",
    material: "leather",
    isHit: true,
    isNew: false,
    isGift: true,
    giftBudget: "above80",
    title: {
      ru: "Кочевой кожаный рюкзак «Nomad Heritage»",
      uz: "«Nomad Heritage» charm sayohat xaltasi",
      en: "Nomad Heritage Handcrafted Leather Backpack"
    },
    subtitle: {
      ru: "Натуральная вощеная кожа crazy horse, латунные пряжки",
      uz: "Crazy horse mumlangan tabiiy charm, latun qisqichlar",
      en: "Waxed Crazy Horse leather with solid brass buckles"
    },
    description: {
      ru: "Флагманский рюкзак мастерской Kanishka. Создан из плотной вощеной кожи с естественной винтажной фактурой, которая со временем приобретает благородную патину. Просторное основное отделение с мягким карманом для ноутбука до 16 дюймов, скрытый карман для документов со стороны спинки и удобные анатомические лямки.",
      uz: "Kanishka ustaxonasining asosiy mahsuloti. 16 dyuymgacha noutbuk uchun qulay bo'lma, orqa tomondagi yashirin cho'ntak va mustahkam charm tasmalar.",
      en: "Signature artisan backpack from Kanishka workshop. Heavyweight waxed leather develops a distinguished patina over years. Features padded 16\" laptop sleeve, concealed anti-theft passport pocket, and reinforced straps."
    },
    priceUZS: 1850000,
    priceUSD: 145,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab"],
    specs: {
      dimensions: "42 × 30 × 14 см (18 л)",
      leatherType: {
        ru: "Телячья кожа растительного дубления (2.2 мм), винтажная выделка",
        uz: "O'simlik usulida oshlangan buzoq charmi (2.2 mm)",
        en: "Full-grain vegetable-tanned bovine leather (2.2mm)"
      },
      hardware: {
        ru: "Литая состаренная латунь, молнии YKK повышенной прочности",
        uz: "Qadimiy latun quyma, mustahkam YKK fermuarlari",
        en: "Solid antiqued brass hardware, heavy-duty YKK zips"
      },
      care: {
        ru: "Обработка натуральным воском или бальзамом раз в сезон",
        uz: "Mavsumda bir marta maxsus mum yoki balzam bilan ishlov berish",
        en: "Treat with natural beeswax balm once every season"
      }
    }
  },
  {
    id: "kan-002",
    category: "bags",
    audience: "women",
    material: "leather",
    isHit: true,
    isNew: true,
    isGift: true,
    giftBudget: "above80",
    title: {
      ru: "Сумка-тоут «Tashkent Heritage»",
      uz: "«Tashkent Heritage» charm xalta-sumkasi",
      en: "Tashkent Heritage Cognac Leather Tote"
    },
    subtitle: {
      ru: "Глубокий коньячный оттенок, ручной седельный шов",
      uz: "Boy konyak rangi, mustahkam qo'l choki",
      en: "Rich cognac hue with artisanal saddle stitch"
    },
    description: {
      ru: "Универсальный и стильный тоут для города и путешествий. Мягкая, но плотно держащая форму кожа, удобные удлиненные ручки для ношения на плече и съемный плечевой ремень. Внутри — отделка льняным холстом и кожаный карабин для ключей.",
      uz: "Shahar va sayohatlar uchun universal va nafis charm sumka. Qulay yelka tasmalar, zig'irpoya astar va kalitlar uchun karabin.",
      en: "Timeless handcrafted tote for urban lifestyle and travel. Supple structured leather, extended shoulder handles, and detachable crossbody strap. Natural raw linen lining with interior brass key clasp."
    },
    priceUZS: 1450000,
    priceUSD: 115,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab", "okkorgan"],
    specs: {
      dimensions: "36 × 32 × 12 см",
      leatherType: {
        ru: "Натуральная шорно-седельная кожа коньячного оттенка",
        uz: "Konyak tusli tabiiy egar-jabduq charmi",
        en: "Cognac pull-up full-grain harness leather"
      },
      hardware: {
        ru: "Матовая латунь, ручные заклепки",
        uz: "Mat latun, qo'lda o'rnatilgan parchinlar",
        en: "Matte brass rivets and rings"
      },
      care: {
        ru: "Хранить в фирменном пыльнике, защищать от сильного намокания",
        uz: "Kanishka chang qopchasida saqlash, suvdan asrash",
        en: "Keep in branded dust bag, shield from excessive moisture"
      }
    }
  },
  {
    id: "kan-003",
    category: "accessories",
    audience: "unisex",
    material: "leather",
    isHit: true,
    isNew: false,
    isGift: true,
    giftBudget: "30to80",
    title: {
      ru: "Портмоне-лонг «Caravan Traveler»",
      uz: "«Caravan Traveler» sayohat hamyoni",
      en: "Caravan Traveler Long Leather Wallet"
    },
    subtitle: {
      ru: "Отделения для паспорта, авиабилета, 8 карт и купюр",
      uz: "Pasport, aviachipta, 8 ta karta va naqd pul bo'lmalari",
      en: "Slots for passport, boarding pass, 8 cards & cash"
    },
    description: {
      ru: "Идеальный спутник путешественника. Вмещает паспорт любого формата, посадочные талоны, автодокументы, смартфон и купюры любого размера без сгибания. Закрывается на две скрытые латунные кнопки.",
      uz: "Sayohatlar uchun ajoyib hamroh. Pasport, aviachiptalar, smartfon va naqd pullarni buklamasdan sig'diradi. Yashirin latun tugmalar.",
      en: "The quintessential traveler wallet. Fits any passport, boarding passes, smartphone, and full-length banknotes. Secured with dual antique brass snaps."
    },
    priceUZS: 480000,
    priceUSD: 38,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab", "okkorgan"],
    specs: {
      dimensions: "20 × 10.5 × 1.8 см",
      leatherType: {
        ru: "Кожа Crazy Horse темного шоколадного оттенка",
        uz: "To'q shokolad rangli Crazy Horse charmi",
        en: "Dark Chocolate Crazy Horse Leather"
      },
      hardware: {
        ru: "Кнопки Koh-i-Noor под античную бронзу",
        uz: "Koh-i-Noor antik bronza tugmalari",
        en: "Koh-i-Noor antique bronze heavy snaps"
      },
      care: {
        ru: "Мелкие царапины легко полируются мягкой тканью или пальцем",
        uz: "Kichik tirnalishlar yumshoq mato bilan oson ketkaziladi",
        en: "Minor scratches self-heal when buffed with a soft cloth"
      }
    }
  },
  {
    id: "kan-004",
    category: "accessories",
    audience: "unisex",
    material: "leather",
    isHit: true,
    isNew: false,
    isGift: true,
    giftBudget: "under30",
    title: {
      ru: "Обложка для паспорта «Silk Road Stamp»",
      uz: "«Silk Road Stamp» pasport g'ilofi",
      en: "Silk Road Stamp Passport Cover"
    },
    subtitle: {
      ru: "Тиснение с авторскими мотивами Ташкента и Шелкового пути",
      uz: "Toshkent va Ipak yo'li mualliflik naqshlari bilan bosma",
      en: "Hot-stamped with authorial Tashkent & Silk Road motifs"
    },
    description: {
      ru: "Самый популярный памятный подарок из Ташкента. Изготовлена из плотной натуральной кожи с тиснением орнамента Шелкового пути. Внутри — два дополнительных слота для банковских или транспортных карт. Поставляется в фирменной крафтовой коробочке Kanishka.",
      uz: "Toshkentdan eng ommabop estalik sovg'a. Tabiiy charmdan tayyorlangan, bank kartalari uchun qulay cho'ntakchalari bor. Kanishka qutisida taqdim etiladi.",
      en: "The most sought-after authentic keepsake from Tashkent. Vegetable-tanned leather embossed with vintage caravan and oasis geometry. Includes 2 card slots. Comes in signature Kanishka kraft gift box."
    },
    priceUZS: 250000,
    priceUSD: 20,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1585336261026-6213797c2317?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab", "okkorgan"],
    specs: {
      dimensions: "14 × 10 см (стандартный паспорт)",
      leatherType: {
        ru: "Натуральная юфть ручного вощения",
        uz: "Qo'lda mumlangan tabiiy charm",
        en: "Artisan wax-buffed natural leather"
      },
      hardware: {
        ru: "Вощеные нити Dafna, ручная прошивка",
        uz: "Dafna mumlangan iplari, qo'l mehnati",
        en: "Hand-stitched with waxed bonded threads"
      },
      care: {
        ru: "Не требует специального ухода, со временем становится еще красивее",
        uz: "Maxsus parvarish talab qilmaydi, vaqt o'tishi bilan yanada ochiladi",
        en: "Requires zero maintenance; patinas beautifully with use"
      }
    }
  },
  {
    id: "kan-005",
    category: "accessories",
    audience: "men",
    material: "leather",
    isHit: false,
    isNew: true,
    isGift: true,
    giftBudget: "30to80",
    title: {
      ru: "Ремень «Old Brass Master»",
      uz: "«Old Brass Master» dastaki charm kamar",
      en: "Old Brass Master Heavy Leather Belt"
    },
    subtitle: {
      ru: "Цельная чепрачная кожа 4 мм, массивная литая пряжка",
      uz: "4 mm qalinlikdagi butun charm, quyma latun to'qa",
      en: "4mm single-piece bridle leather, solid brass buckle"
    },
    description: {
      ru: "Ремень, созданный служить десятилетиями. Вырезан из цельного чепрака бычьей кожи наивысшей плотности. Пряжка отлита по индивидуальному заказу в стилистике индустриального винтажа с клеймом Kanishka.",
      uz: "O'n yillab xizmat qiladigan kamar. Eng baquvvat butun charm bo'lagidan kesilgan. Kanishka tamg'asi bosilgan metall to'qa.",
      en: "A belt built to endure generations. Cut from a single slab of 4mm heavy bridle hide. The buckle is custom cast in industrial vintage aesthetic with Kanishka hallmark."
    },
    priceUZS: 520000,
    priceUSD: 41,
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "okkorgan"],
    specs: {
      dimensions: "Ширина 40 мм, длина 110–135 см (подгоняется)",
      leatherType: {
        ru: "Чепрак бычьей кожи растительного дубления (4.0 мм)",
        uz: "O'simlik usulida oshlangan 4.0 mm butun buqa charmi",
        en: "Full-grain heavy bull bridle leather (4.0mm thick)"
      },
      hardware: {
        ru: "Литая латунь с патиной, винты Чикаго",
        uz: "Patina qoplangan quyma latun, Chikago vintlari",
        en: "Solid cast brass with natural patina, Chicago screw posts"
      },
      care: {
        ru: "Защита от влаги, периодическая полировка пчелиным воском",
        uz: "Namlikdan asrash, asalari mumi bilan artib turish",
        en: "Wipe clean; apply leather conditioner annually"
      }
    }
  },
  {
    id: "kan-006",
    category: "clothes",
    audience: "unisex",
    material: "leather",
    isHit: true,
    isNew: false,
    isGift: false,
    giftBudget: "above80",
    title: {
      ru: "Кожаная куртка «Steampunk Aviator»",
      uz: "«Steampunk Aviator» mualliflik charm kurtkasi",
      en: "Steampunk Aviator Artisan Leather Jacket"
    },
    subtitle: {
      ru: "Кожа буйвола, съемный воротник из овчины, авторская фурнитура",
      uz: "Suv sigiri charmi, olinadigan qo'y juni yoqa, o'ziga xos dizayn",
      en: "Buffalo leather, detachable shearling collar, custom hardware"
    },
    description: {
      ru: "Знаковая авторская вещь от дизайнера Алексея Маньшаева. Сочетает дерзкий силуэт авиатора, элементы ретро-футуризма и непревзойденный комфорт. Асимметричная латунная молния, регулируемые боковые пряжки и съемный воротник из натуральной мериносовой овчины.",
      uz: "Dizayner Aleksey Manshayevning mashhur asari. Aviator qulayligi va retro uslubi uyg'unligi. Asimmetrik fermuar va olinadigan tabiiy mo'yna.",
      en: "Iconic collector's outerwear designed by Alexey Manshaev. Merges rugged aviator attitude with post-industrial steampunk edge. Heavyweight distressed buffalo hide with detachable Merino shearling collar."
    },
    priceUZS: 4200000,
    priceUSD: 330,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli"],
    specs: {
      dimensions: "Размеры в наличии: S, M, L, XL (уточняйте наличие в Telegram)",
      leatherType: {
        ru: "Выдержанная кожа буйвола со следами ручной затирки",
        uz: "Qo'lda ishlov berilgan maxsus suv sigiri charmi",
        en: "Hand-distressed full-grain water buffalo hide"
      },
      hardware: {
        ru: "Массивные тракторные молнии из меди и латуни",
        uz: "Mis va latundan yasalgan mustahkam qalin fermuarlar",
        en: "Heavy-gauge antique copper & brass combat zippers"
      },
      care: {
        ru: "Только специализированная чистка кожи и меха",
        uz: "Faqat charm va mo'yna uchun professional kimyoviy tozalash",
        en: "Specialist leather and fur dry cleaning only"
      }
    }
  },
  {
    id: "kan-007",
    category: "clothes",
    audience: "women",
    material: "textile",
    isHit: false,
    isNew: true,
    isGift: false,
    giftBudget: "above80",
    title: {
      ru: "Пальто-кимоно из дикого льна «Dervish»",
      uz: "«Dervish» yovvoyi zig'ir matoli kimono-palto",
      en: "Dervish Raw Linen Kimono Coat"
    },
    subtitle: {
      ru: "100% некрашеный тяжелый лен, кожаные манжеты и пояс",
      uz: "100% og'ir tabiiy zig'irpoya, charm manjet va kamar",
      en: "100% unbleached heavyweight linen with leather accents"
    },
    description: {
      ru: "Свободное концептуальное пальто оверсайз кроя. Изготовлено из фактурного дикого льна высокой плотности. Декорировано вставками из натуральной замши на карманах и кожаным наборным поясом с гравировкой.",
      uz: "Erkin oversize bichimdagi ajoyib palto. Zich tabiiy zig'ir matodan tikilgan, cho'ntaklarida zamsh qo'shimchalar mavjud.",
      en: "Relaxed artisan kimono coat. Cut from structured raw flax linen with natural slub texture. Accented with suede pocket welts and a burnished leather tie belt."
    },
    priceUZS: 1650000,
    priceUSD: 130,
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["afrosiab", "okkorgan"],
    specs: {
      dimensions: "One Size (42–50 свободная посадка)",
      leatherType: {
        ru: "Дикий лен 480 г/м² + телячья кожа на отделке",
        uz: "480 g/m² yovvoyi zig'irpoya + tabiiy charm bezaklari",
        en: "480 gsm raw organic linen with calfskin piping"
      },
      hardware: {
        ru: "Пуговицы из натурального орехового дерева",
        uz: "Yong'oq yog'ochidan tayyorlangan tugmalar",
        en: "Turned natural walnut wood buttons"
      },
      care: {
        ru: "Деликатная стирка при 30°C или эко-химчистка",
        uz: "30°C haroratda nozik yuvish yoki ekomarkazda tozalash",
        en: "Hand wash cool or gentle dry clean"
      }
    }
  },
  {
    id: "kan-008",
    category: "clothes",
    audience: "unisex",
    material: "fur",
    isHit: false,
    isNew: true,
    isGift: false,
    giftBudget: "above80",
    title: {
      ru: "Жилет из натуральной овчины «Steppe Nomad»",
      uz: "«Steppe Nomad» tabiiy qo'y po'stak nimchasi",
      en: "Steppe Nomad Shearling Vest"
    },
    subtitle: {
      ru: "Плотный мех, внешняя сторона — замша, кожаная шнуровка",
      uz: "Issiq qalin mo'yna, tashqi tomoni zamsh, charm bog'ichlar",
      en: "Plush shearling with suede exterior & leather lace closure"
    },
    description: {
      ru: "Теплый жилет ручной работы для осенне-зимнего сезона. Изготовлен из цельных шкур отборной овчины. Идеально носится поверх свитеров, худи или льняных рубах. Швы отделаны кожаной тесьмой.",
      uz: "Kuz-qish mavsumi uchun qo'lda tikilgan issiq nimcha. Sviter va xudilar ustidan kiyish uchun juda qulay.",
      en: "Handcrafted shearling vest capturing the spirit of the Central Asian steppes. Premium double-faced sheepskin with raw leather lacing. Perfect over knitwear and linen jackets."
    },
    priceUZS: 2200000,
    priceUSD: 172,
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab"],
    specs: {
      dimensions: "Размеры: M, L, XL",
      leatherType: {
        ru: "100% натуральная мериносовая овчина (дубленка)",
        uz: "100% tabiiy merinos qo'y terisi",
        en: "100% genuine Merino shearling pelt"
      },
      hardware: {
        ru: "Кожаные завязки с латунными наконечниками",
        uz: "Latun uchlikli charm bog'ichlar",
        en: "Braided leather ties with brass aglets"
      },
      care: {
        ru: "Регулярное проветривание, специальная щетка для замши",
        uz: "Muntazam shamollatish, zamsh uchun maxsus cho'tka",
        en: "Brush gently with a crepe suede brush; store in breathable bag"
      }
    }
  },
  {
    id: "kan-009",
    category: "home",
    audience: "unisex",
    material: "brass",
    isHit: false,
    isNew: true,
    isGift: true,
    giftBudget: "above80",
    title: {
      ru: "Настольный светильник «Industrial Steampunk Lamp»",
      uz: "«Industrial Steampunk» mualliflik stol chirog'i",
      en: "Steampunk Industrial Brass Desk Lamp"
    },
    subtitle: {
      ru: "Массивная латунь, состаренный дуб, ретро-лампа Эдисона",
      uz: "Og'ir quyma latun, qari eman yog'ochi, Edison retro-chirog'i",
      en: "Solid brass pipework, aged oak base, vintage Edison bulb"
    },
    description: {
      ru: "Уникальный предмет интерьера ручной работы. Собран из настоящих латунных фитингов, манометра и основания из спила мореного дуба с тисненой кожаной накладкой Kanishka. Регулируемый диммер яркости.",
      uz: "Noyob interyer bezagi. Haqiqiy latun qismlari, qadimiy eman yog'ochi va charmdan yasalgan taglik. Yorug'likni rostlovchi moslama.",
      en: "One-of-a-kind bespoke interior artifact. Fabricated from antiqued brass conduits, working pressure gauge indicator, and bog oak base with hand-stamped Kanishka leather coaster. Built-in rotary dimmer."
    },
    priceUZS: 1250000,
    priceUSD: 98,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli"],
    specs: {
      dimensions: "Высота 38 см, основание 18 × 18 см (вес 3.4 кг)",
      leatherType: {
        ru: "Подложка из тисненой бычьей кожи 3.5 мм",
        uz: "3.5 mm bosmali qalin charm taglik",
        en: "3.5mm vegetable-tanned stamped leather underlay"
      },
      hardware: {
        ru: "Латунные трубы 1/2\", винтажный патрон Е27, кабель в шелковой оплетке",
        uz: "Latun quvurlar, E27 patron, ipak o'ralgan sim",
        en: "Heavy brass tubes, E27 vintage socket, woven twisted cord"
      },
      care: {
        ru: "Протирать сухой тканью, лампа Эдисона в комплекте",
        uz: "Quruq mato bilan artish, Edison lampasi jamlanmada bor",
        en: "Dry wipe only; standard E27 bulb replacement"
      }
    }
  },
  {
    id: "kan-010",
    category: "home",
    audience: "unisex",
    material: "leather",
    isHit: true,
    isNew: false,
    isGift: true,
    giftBudget: "30to80",
    title: {
      ru: "Интерьерная подушка «Leather & Ikat Fusion»",
      uz: "«Leather & Ikat Fusion» charm va ikat yostig'i",
      en: "Leather & Silk Ikat Fusion Cushion"
    },
    subtitle: {
      ru: "Сочетание мягкой телячьей кожи и маргиланского шелкового иката",
      uz: "Yumshoq buzoq charmi va Marg'ilon ipak adrasi uyg'unligi",
      en: "Buttery soft calfskin combined with handwoven silk Ikat"
    },
    description: {
      ru: "Символ культурного синтеза Kanishka. Лицевая сторона разделена геометрическим швом на глубокую шоколадную кожу и традиционный шелковый хан-атлас ручного ткачества. Наполнитель — гипоаллергенный холлофайбер премиум.",
      uz: "Kanishka madaniy sintezi namunasi. Bir tomoni shokolad rang charm, ikkinchi tomoni an'anaviy ipak atlas. Maxsus qulay to'ldirgich.",
      en: "A tribute to Silk Road craftsmanship. Beautiful harmony of chocolate saddle calfskin and authentic Margilan handwoven silk ikat. Generously filled with hypoallergenic micro-cluster fill."
    },
    priceUZS: 580000,
    priceUSD: 45,
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab"],
    specs: {
      dimensions: "45 × 45 см",
      leatherType: {
        ru: "Телячья кожа наппа + 100% шелковый икат",
        uz: "Nappa buzoq charmi + 100% ipak ikat",
        en: "Calfskin nappa and authentic Margilan silk ikat"
      },
      hardware: {
        ru: "Скрытая молния на оборотной стороне",
        uz: "Orqa tomonidagi yashirin fermuar",
        en: "Concealed back YKK zip"
      },
      care: {
        ru: "Сухая чистка чехла, съемная внутренняя подушка",
        uz: "Faqat quruq tozalash, ichki yostiq olinadi",
        en: "Dry clean removable cover"
      }
    }
  },
  {
    id: "kan-011",
    category: "gifts",
    audience: "unisex",
    material: "leather",
    isHit: true,
    isNew: false,
    isGift: true,
    giftBudget: "30to80",
    title: {
      ru: "Подарочный сет «Tashkent Souvenir Special»",
      uz: "«Tashkent Souvenir Special» sovg'alar to'plami",
      en: "Tashkent Souvenir Special Leather Gift Set"
    },
    subtitle: {
      ru: "Обложка на паспорт + картхолдер + брелок в деревянном коробе",
      uz: "Pasport g'ilofi + vizitkalar g'ilofi + brelok yog'och qutida",
      en: "Passport cover + cardholder + key fob in artisan wooden box"
    },
    description: {
      ru: "Готовое подарочное решение для гостей Ташкента и коллег. В комплект входит обложка для паспорта с этническим тиснением, компактный картхолдер на 6 карт и стильный кожаный брелок с латунным карабином. Упаковано в деревянный брендированный ящичек с сургучной печатью.",
      uz: "Mehmonlar va qadrdonlar uchun tayyor ajoyib sovg'a. Pasport g'ilofi, kartalar uchun ixcham g'ilof va charm brelok. Mualliflik yog'och qutisida.",
      en: "Ready-to-gift box set favored by international visitors. Contains Silk Road passport jacket, 6-slot slim cardholder, and brass snap-hook keychain. Packaged in a wooden cedar-stained box with real wax stamp."
    },
    priceUZS: 620000,
    priceUSD: 49,
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab", "okkorgan"],
    specs: {
      dimensions: "Короб 22 × 16 × 6 см",
      leatherType: {
        ru: "Коньячная кожа Crazy Horse высшей категории",
        uz: "Oliy toifali konyak rangli Crazy Horse charmi",
        en: "Premium saddle tan Crazy Horse leather"
      },
      hardware: {
        ru: "Латунная фурнитура, вощеная нить, сургуч",
        uz: "Latun metall, mumlangan ip, muhrli surgu",
        en: "Solid brass clip, waxed threads, red wax seal"
      },
      care: {
        ru: "Идеально подходит для ручной клади и подарка",
        uz: "Sovg'a qilish va sayohatga olib ketish uchun ideal",
        en: "Hand-luggage ready and pristine for giving"
      }
    }
  },
  {
    id: "kan-012",
    category: "bags",
    audience: "unisex",
    material: "leather",
    isHit: false,
    isNew: true,
    isGift: true,
    giftBudget: "30to80",
    title: {
      ru: "Поясная сумка «Saddle Hip Bag»",
      uz: "«Saddle Hip Bag» charm bel sumkasi",
      en: "Saddle Hip Bag Crossbody"
    },
    subtitle: {
      ru: "Носится на поясе или через плечо, быстросъемный карабин",
      uz: "Belda yoki yelkada taqiladi, mustahkam latun qisqich",
      en: "Wear as waist bag or sling, quick-release brass snap"
    },
    description: {
      ru: "Компактная, но вместительная поясная сумка в седельном стиле. Легко вмещает телефон любого размера, кошелек, ключи и документы. Прочный регулируемый кожаный ремень и тяжелый карабин из темной латуни.",
      uz: "Ixcham va sig'imli charm bel sumkasi. Telefon, pul va kalitlar uchun qulay. Regulyatorli charm tasma.",
      en: "Ergonomic saddle-curved crossbody hip pack. Keeps smartphone, passport, wallet, and essentials snug to your body. Fitted with an adjustable leather strap and heavy trigger snap."
    },
    priceUZS: 790000,
    priceUSD: 62,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80"
    ],
    inStockBranches: ["rustaveli", "afrosiab"],
    specs: {
      dimensions: "26 × 15 × 7 см",
      leatherType: {
        ru: "Плотная вощеная кожа с эффектом состаривания",
        uz: "Vintaj effektli qalin mumlangan charm",
        en: "Waxed pull-up leather with distressed character"
      },
      hardware: {
        ru: "Латунный поворотный замок и тяжелый карабин",
        uz: "Latun burama qulf va mustahkam karabin",
        en: "Solid brass turn-lock clasp and trigger hook"
      },
      care: {
        ru: "При загрязнении протереть влажной салфеткой без спирта",
        uz: "Spirtsiz nam salfetka bilan artish mumkin",
        en: "Clean with a damp cloth; avoid alcohol-based solvents"
      }
    }
  }
];

// Данные филиалов Kanishka в Ташкенте
const BRANCHES = [
  {
    id: "rustaveli",
    name: {
      ru: "Флагман на Шота Руставели",
      uz: "Shota Rustaveli bosh do'koni",
      en: "Shota Rustaveli Flagship Store"
    },
    address: {
      ru: "ул. Шота Руставели, 39, Яккасарайский р-н",
      uz: "Shota Rustaveli ko'chasi, 39, Yakkasaroy tumani",
      en: "39 Shota Rustaveli Street, Yakkasaray District"
    },
    landmark: {
      ru: "Ориентир: памятник Шота Руставели, цокольный / 1 этаж",
      uz: "Mo'ljal: Shota Rustaveli haykali yonida",
      en: "Landmark: Shota Rustaveli monument, ground/sub floor"
    },
    phones: ["+998 71 255 03 93", "+998 71 268 95 19"],
    hours: {
      ru: "Ежедневно с 10:00 до 20:00",
      uz: "Har kuni 10:00 dan 20:00 gacha",
      en: "Daily 10:00 AM – 8:00 PM"
    },
    description: {
      ru: "Главное двухэтажное концепт-пространство Kanishka. Самый полный ассортимент одежды, верхней меховой коллекции, кожгалантереи и уникальных предметов интерьера в стиле стимпанк.",
      uz: "Kanishka bosh ikki qavatli shourumi. Kiyimlar, mo'ynali kolleksiya, charm buyumlar va noodatiy interyer buyumlarining eng to'liq assortimenti.",
      en: "Two-story flagship concept space. Houses the widest selection of leather coats, apparel, bespoke bags, and steampunk interior masterworks."
    },
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80",
    maps: {
      yandex: "https://yandex.com/maps/?text=Kanishka+Shota+Rustaveli+39+Tashkent",
      google: "https://maps.google.com/?q=Kanishka+Tashkent+Rustaveli+39",
      twogis: "https://2gis.uz/tashkent/search/Kanishka"
    },
    coords: { lat: 41.2858, lng: 69.2534, mapX: "38%", mapY: "62%" }
  },
  {
    id: "afrosiab",
    name: {
      ru: "Шоурум на Афросиабе (Ойбек)",
      uz: "Afrosiyob (Oybek) shourumi",
      en: "Afrosiab (Oybek Metro) Showroom"
    },
    address: {
      ru: "ул. Афросиаб, 39, Мирабадский р-н",
      uz: "Afrosiyob ko'chasi, 39, Mirobod tumani",
      en: "39 Afrosiab Street, Mirabad District"
    },
    landmark: {
      ru: "Ориентир: станция метро Ойбек / Минг Урик, цокольный этаж",
      uz: "Mo'ljal: Oybek / Ming O'rik metro bekati yaqinida",
      en: "Landmark: Oybek / Ming Urik metro station, basement level"
    },
    phones: ["+998 71 252 57 77"],
    hours: {
      ru: "Ежедневно с 10:00 до 20:00",
      uz: "Har kuni 10:00 dan 20:00 gacha",
      en: "Daily 10:00 AM – 8:00 PM"
    },
    description: {
      ru: "Уютный атмосферный бутик в деловом центре Ташкента. Богатый выбор подарков, сумок, ремней, кошельков и сезонных капсул одежды. Удобная локация в 2 минутах от метро.",
      uz: "Toshkent markazidagi shinam butik. Sovg'alar, sumkalar, hamyonlar va mavsumiy kiyimlar kolleksiyasi.",
      en: "Intimate atmospheric boutique in central Tashkent. Features an abundant assortment of gifts, backpacks, belts, and seasonal apparel capsules."
    },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
    maps: {
      yandex: "https://yandex.com/maps/?text=Kanishka+Afrosiab+39+Tashkent",
      google: "https://maps.google.com/?q=Kanishka+Tashkent+Afrosiab+39",
      twogis: "https://2gis.uz/tashkent/search/Kanishka+Afrosiab"
    },
    coords: { lat: 41.2982, lng: 69.2741, mapX: "56%", mapY: "48%" }
  },
  {
    id: "okkorgan",
    name: {
      ru: "Филиал на Оккургане (Новомосковская)",
      uz: "Oqqo'rg'on (Novomoskovskaya) filiali",
      en: "Okkorgan (Novomoskovskaya) Branch"
    },
    address: {
      ru: "ул. Оккурган, 21, Мирзо-Улугбекский р-н",
      uz: "Oqqo'rg'on ko'chasi, 21, Mirzo Ulug'bek tumani",
      en: "21 Okkorgan Street, Mirzo-Ulugbek District"
    },
    landmark: {
      ru: "Ориентир: спорткомплекс «Ёшлик» (бывш. НБУ), школа №142",
      uz: "Mo'ljal: «Yoshlik» sport majmuasi (sobiq NBU), 142-maktab",
      en: "Landmark: Yoshlik Sports Complex (ex-NBU), School No. 142"
    },
    phones: ["+998 71 255 03 93"],
    hours: {
      ru: "Ежедневно с 10:00 до 20:00",
      uz: "Har kuni 10:00 dan 20:00 gacha",
      en: "Daily 10:00 AM – 8:00 PM"
    },
    description: {
      ru: "Стильное пространство в зеленом спокойном районе. Идеальное место для неспешного выбора подарков, примерки авторской одежды и заказа индивидуальных изделий.",
      uz: "Shahar sokin maskanidagi ko'rkam do'kon. Sovg'alarni shoshmasdan tanlash va buyurtma berish uchun ajoyib joy.",
      en: "Artistic showroom in a tranquil neighbourhood. Perfect for unhurried gifting choices, garment fittings, and custom consultation."
    },
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1000&q=80",
    maps: {
      yandex: "https://yandex.com/maps/?text=Kanishka+Okkorgan+21+Tashkent",
      google: "https://maps.google.com/?q=Kanishka+Tashkent+Okkorgan+21",
      twogis: "https://2gis.uz/tashkent/search/Kanishka+Okkorgan"
    },
    coords: { lat: 41.3214, lng: 69.3102, mapX: "78%", mapY: "30%" }
  }
];

// Отзывы реальных гостей и клиентов
const REVIEWS = [
  {
    author: "Elena Rostova",
    city: "Москва / Ташкент",
    rating: 5,
    date: "Ноябрь 2026",
    text: {
      ru: "Входишь в магазин — и с ума сводит этот невероятный, густой запах натуральной кожи и воска! Каждая вещь с душой и историей. Купила кожаный рюкзак и три обложки на подарки родным. Качество строчки безупречное!",
      uz: "Do'konga kirishingiz bilan tabiiy charm va mumning yoqimli hidi maftun etadi! Har bir narsa mehr bilan yaratilgan. Sifat juda a'lo!",
      en: "The moment you step in, the intoxicating aroma of raw leather and beeswax hits you. Every single piece has soul and character. Unmatched stitch quality!"
    }
  },
  {
    author: "Alexander Becker",
    city: "Berlin, Germany",
    rating: 5,
    date: "Октябрь 2026",
    text: {
      ru: "Best designer shop in Tashkent! If you are a traveler looking for real authentic crafts rather than generic tourist trinkets, Kanishka is an absolute must-visit. Alexey's leather designs have a genuine steampunk vibe.",
      uz: "Toshkentdagi eng zo'r dizaynerlik do'koni! Sayyohlar uchun haqiqiy hunarmandchilik asarlari. Albatta borib ko'rish kerak.",
      en: "Best designer shop in Tashkent! If you are a traveler looking for real authentic crafts rather than generic tourist trinkets, Kanishka is an absolute must-visit. Alexey's leather designs have a genuine steampunk vibe."
    }
  },
  {
    author: "Сардор Мирзаев",
    city: "Ташкент",
    rating: 5,
    date: "Сентябрь 2026",
    text: {
      ru: "Ношу кожаный ремень от Канишки уже больше 6 лет — он стал только лучше, кожа приобрела крутой винтажный оттенок. Недавно брал куртку Авиатор — просто восторг. Гордость за ташкентских мастеров!",
      uz: "Kanishka kamarini 6 yildan beri taqaman — vaqt o'tishi bilan yanada chiroyli bo'ldi. Yaqinda kurtka ham oldim, juda xursandman!",
      en: "I've worn my Kanishka belt for over 6 years now — it has aged gorgeously with authentic patina. Recently got the Aviator jacket. Proud of our Tashkent artisans!"
    }
  },
  {
    author: "Камилла Юсупова",
    city: "Самарканд / Ташкент",
    rating: 5,
    date: "Август 2026",
    text: {
      ru: "Идеальное спасение, когда нужны подарки для иностранных партнеров! Упаковка с сургучной печатью выглядит на миллион. Менеджер в Telegram ответила за 3 минуты и отправила заказ курьером прямо в отель.",
      uz: "Xorijiy hamkorlarga sovg'a kerak bo'lganda eng yaxshi yechim! Surguchli qadoq juda hashamatli. Telegram orqali 3 daqiqada javob berib, mehmonxonaga yetkazishdi.",
      en: "Lifesaver whenever you need premium gifts for visiting partners! The wax-sealed packaging looks majestic. Telegram admin responded within 3 minutes and couriered to our hotel."
    }
  }
];
