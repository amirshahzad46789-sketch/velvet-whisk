export const categories = [
  { id: 'all', name: 'All / تمام' },
  { id: 'cakes', name: 'Cakes / کیک' },
  { id: 'cookies', name: 'Cookies / بسکٹ' },
  { id: 'pastries', name: 'Pastries / پیسٹری' },
  { id: 'brownies', name: 'Brownies / براؤنیز' },
  { id: 'donuts', name: 'Donuts / ڈونٹس' },
];

export const products = [
  // CAKES (6 Items)
  {
    id: 1, name: 'Premium Chocolate Fudge Cake', urduName: 'پریمیم چاکلیٹ فج کیک',
    price: 2500, category: 'cakes', badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
    description: 'A decadent, rich chocolate cake with triple layers of fudgy goodness.',
    urduDescription: 'انتہائی مزیدار اور نرم چاکلیٹ فج کیک، تین تہوں والا۔',
    sizes: [{ size: '1 Pound', price: 0 }, { size: '2 Pounds', price: 1800 }], // Total 4300 (Discounted from 5000)
    addons: [{ name: 'Extra Chocolate Drip', price: 300 }]
  },
  {
    id: 2, name: 'Red Velvet Cream Cheese', urduName: 'ریڈ ویلویٹ کیک (کریم چیز)',
    price: 2800, category: 'cakes', badges: ['new'],
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=1200&auto=format&fit=crop',
    description: 'Classic red velvet cake layered with our signature cream cheese frosting.',
    urduDescription: 'کریم چیز فروسٹنگ کے ساتھ کلاسک ریڈ ویلویٹ کیک۔',
    sizes: [{ size: '1 Pound', price: 0 }, { size: '2 Pounds', price: 2000 }], // Total 4800 (Discounted)
    addons: [{ name: 'Custom Fondant Message', price: 400 }]
  },
  {
    id: 3, name: 'Black Forest Gateau', urduName: 'بلیک فارسٹ کیک',
    price: 2200, category: 'cakes', badges: [],
    image: '/images/Screenshot 2026-05-01 163236.png',
    description: 'Traditional black forest with cherries and fresh whipped cream.',
    urduDescription: 'چیری اور فریش کریم کے ساتھ روایتی بلیک فارسٹ۔',
    sizes: [{ size: '1 Pound', price: 0 }, { size: '2 Pounds', price: 1800 }],
    addons: []
  },
  {
    id: 4, name: 'Lotus Biscoff Dream Cake', urduName: 'لوٹس بسکوف ڈریم کیک',
    price: 3500, category: 'cakes', badges: ['bestseller'],
    image: '/images/LotusBiscoffDreamCake-20240719-131825.avif',
    description: 'Incredibly moist sponge with generous layers of Lotus Biscoff spread.',
    urduDescription: 'لوٹس بسکوف سپریڈ سے بھرا ہوا انتہائی نرم کیک۔',
    sizes: [{ size: '1 Pound', price: 0 }, { size: '2 Pounds', price: 3000 }],
    addons: [{ name: 'Extra Lotus Biscuits', price: 200 }]
  },
  {
    id: 5, name: 'Rainbow Fantasy Cake', urduName: 'رینبو فینٹسی کیک',
    price: 3200, category: 'cakes', badges: ['new'],
    image: '/images/Screenshot 2026-05-01 164505.png',
    description: 'A colorful multi-layered rainbow cake with vanilla frosting.',
    urduDescription: 'رنگین تہوں والا خوبصورت رینبو کیک۔',
    sizes: [{ size: '1 Pound', price: 0 }, { size: '2 Pounds', price: 2800 }],
    addons: []
  },
  {
    id: 6, name: 'Pineapple Fruit Cake', urduName: 'پائن ایپل فروٹ کیک',
    price: 2300, category: 'cakes', badges: [],
    image: '/images/pineapple-mix-fruit-cake.jpg',
    description: 'Refreshing pineapple chunks within light vanilla sponge and cream.',
    urduDescription: 'تازہ پائن ایپل اور ہلکی کریم کے ساتھ مزیدار کیک۔',
    sizes: [{ size: '1 Pound', price: 0 }, { size: '2 Pounds', price: 2000 }],
    addons: []
  },

  // COOKIES (6 Items)
  {
    id: 7, name: 'Classic Choc-Chip Cookies', urduName: 'چاکلیٹ چپ کوکیز',
    price: 1500, category: 'cookies', badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1200&auto=format&fit=crop',
    description: 'Crispy on the edges, chewy in the center. Freshly baked.',
    urduDescription: 'باہر سے کرسپی اور اندر سے نرم چاکلیٹ کوکیز۔',
    sizes: [{ size: 'Half Dozen', price: 0 }, { size: 'One Dozen', price: 1200 }], // Total 2700 (Discounted from 3000)
    addons: []
  },
  {
    id: 8, name: 'Double Chocolate Chunk', urduName: 'ڈبل چاکلیٹ چنک کوکیز',
    price: 1500, category: 'cookies', badges: [],
    image: '/images/double chocolate chunk.jpg',
    description: 'Dark chocolate cookies loaded with milk chocolate chunks.',
    urduDescription: 'ڈارک اور ملک چاکلیٹ سے بھرپور کوکیز۔',
    sizes: [{ size: 'Half Dozen', price: 0 }, { size: 'One Dozen', price: 1200 }],
    addons: []
  },
  {
    id: 9, name: 'Oatmeal Raisin Cookies', urduName: 'اوٹ میل (جو) اور کشمش کوکیز',
    price: 1000, category: 'cookies', badges: ['gf'],
    image: 'https://images.unsplash.com/photo-1598968333180-9b4f6bc2bf52?q=80&w=1200&auto=format&fit=crop',
    description: 'Healthy, chewy oatmeal cookies with plump raisins.',
    urduDescription: 'صحت بخش جو اور کشمش سے بنی کوکیز۔',
    sizes: [{ size: 'Half Dozen', price: 0 }, { size: 'One Dozen', price: 800 }],
    addons: []
  },
  {
    id: 10, name: 'Peanut Butter Blast', urduName: 'پینٹ بٹر بلاسٹ کوکیز',
    price: 1400, category: 'cookies', badges: [],
    image: '/images/Peanut-Butter-Custard-Blast_EXPS_BDSMZ17_48993_D03_03_2b.jpg',
    description: 'Rich peanut butter cookies with a slight salt crunch.',
    urduDescription: 'مونگ پھلی کے مکھن سے بنی شاندار کوکیز۔',
    sizes: [{ size: 'Half Dozen', price: 0 }, { size: 'One Dozen', price: 1000 }],
    addons: []
  },
  {
    id: 11, name: 'Macadamia Nut White Choc', urduName: 'میکاڈیمیا اور وائٹ چاکلیٹ کوکیز',
    price: 1800, category: 'cookies', badges: ['new'],
    image: '/images/Macadamia Nut White Choc.jpg',
    description: 'Premium macadamia nuts baked with sweet white chocolate.',
    urduDescription: 'پریمیم میکاڈیمیا نٹس اور سفید چاکلیٹ۔',
    sizes: [{ size: 'Half Dozen', price: 0 }, { size: 'One Dozen', price: 1500 }],
    addons: []
  },
  {
    id: 12, name: 'Classic Sugar Cookies', urduName: 'کلاسک شوگر کوکیز',
    price: 900, category: 'cookies', badges: [],
    image: 'https://images.unsplash.com/photo-1557310717-d6bea9f36682?auto=format&fit=crop&q=80&w=800',
    description: 'Sweet, buttery and crumbly sugar cookies.',
    urduDescription: 'میٹھی اور مکھن والی نرم کوکیز۔',
    sizes: [{ size: 'Half Dozen', price: 0 }, { size: 'One Dozen', price: 700 }],
    addons: []
  },

  // PASTRIES (6 Items)
  {
    id: 13, name: 'French Chocolate Éclair', urduName: 'فرینچ چاکلیٹ ایکلیئر',
    price: 450, category: 'pastries', badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1200&auto=format&fit=crop',
    description: 'Choux pastry filled with vanilla custard and topped with chocolate icing.',
    urduDescription: 'کسٹرڈ سے بھری اور چاکلیٹ لگی زبردست ایکلیئر۔',
    sizes: [{ size: '1 Piece', price: 0 }, { size: 'Box of 4', price: 1150 }], // Total 1600 (Discounted from 1800)
    addons: []
  },
  {
    id: 14, name: 'Fruit Tart Pastry', urduName: 'فروٹ ٹارٹ پیسٹری',
    price: 500, category: 'pastries', badges: [],
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&q=80&w=800',
    description: 'Crispy tart shell filled with custard and topped with seasonal fruits.',
    urduDescription: 'تازہ پھلوں اور کسٹرڈ سے بھرا ہوا ٹارٹ۔',
    sizes: [{ size: '1 Piece', price: 0 }, { size: 'Box of 4', price: 1400 }],
    addons: []
  },
  {
    id: 15, name: 'Coffee Opera Slice', urduName: 'کافی اوپیرا پیسٹری',
    price: 600, category: 'pastries', badges: ['new'],
    image: '/images/Screenshot 2026-05-01 153535.png',
    description: 'Layers of almond sponge, coffee syrup, and chocolate ganache.',
    urduDescription: 'کافی اور چاکلیٹ کی تہوں والی اسپیشل پیسٹری۔',
    sizes: [{ size: '1 Piece', price: 0 }, { size: 'Box of 4', price: 1800 }],
    addons: []
  },
  {
    id: 16, name: 'Lemon Meringue Slice', urduName: 'لیمن میرنگ پیسٹری',
    price: 400, category: 'pastries', badges: [],
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800',
    description: 'Tangy lemon curd topped with fluffy, toasted meringue.',
    urduDescription: 'کھٹے میٹھے لیمن اور نرم میرنگ کا امتزاج۔',
    sizes: [{ size: '1 Piece', price: 0 }, { size: 'Box of 4', price: 1100 }],
    addons: []
  },
  {
    id: 17, name: 'Cheesecake Slice', urduName: 'چیز کیک پیسٹری',
    price: 550, category: 'pastries', badges: [],
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800',
    description: 'New York style classic cheesecake slice with berry compote.',
    urduDescription: 'نیویارک اسٹائل چیز کیک پیسٹری۔',
    sizes: [{ size: '1 Piece', price: 0 }, { size: 'Box of 4', price: 1600 }],
    addons: []
  },
  {
    id: 18, name: 'Cream Puff', urduName: 'کریم پف',
    price: 300, category: 'pastries', badges: [],
    image: 'https://images.unsplash.com/photo-1653941614335-6ff2e9cd459d?q=80&w=1200&auto=format&fit=crop',
    description: 'Light and airy choux filled with sweet whipped cream.',
    urduDescription: 'میٹھی کریم سے بھرا نرم اور لذیذ کریم پف۔',
    sizes: [{ size: '1 Piece', price: 0 }, { size: 'Box of 4', price: 800 }],
    addons: []
  },

  // BROWNIES (3 Items)
  {
    id: 19, name: 'Signature Fudgy Brownies', urduName: 'سگنیچر فجی براؤنیز',
    price: 1500, category: 'brownies', badges: ['bestseller'],
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
    description: 'Dense, rich, and incredibly chocolatey.',
    urduDescription: 'انتہائی چاکلیٹی اور نرم براؤنیز۔',
    sizes: [{ size: 'Box of 4', price: 0 }, { size: 'Box of 8', price: 1200 }],
    addons: []
  },
  {
    id: 20, name: 'Salted Caramel Brownies', urduName: 'سالٹڈ کیریمل براؤنیز',
    price: 1800, category: 'brownies', badges: ['new'],
    image: '/images/Salted-Caramel-Brownies-10-scaled.jpg',
    description: 'Swirled with house-made salted caramel sauce.',
    urduDescription: 'نمکین کیریمل ساس کے ساتھ خاص براؤنیز۔',
    sizes: [{ size: 'Box of 4', price: 0 }, { size: 'Box of 8', price: 1400 }],
    addons: []
  },
  {
    id: 21, name: 'Walnut Brownies', urduName: 'اخروٹ براؤنیز',
    price: 1900, category: 'brownies', badges: [],
    image: '/images/best-walnut-brownie-recipe.jpg',
    description: 'Classic fudgy brownies topped with roasted walnuts.',
    urduDescription: 'بھنے ہوئے اخروٹ کے ساتھ مزیدار براؤنیز۔',
    sizes: [{ size: 'Box of 4', price: 0 }, { size: 'Box of 8', price: 1500 }],
    addons: []
  },

  // DONUTS (3 Items)
  {
    id: 22, name: 'Classic Glazed Donuts', urduName: 'کلاسک گلیزڈ ڈونٹس',
    price: 250, category: 'donuts', badges: [],
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
    description: 'Soft, airy rings coated in sweet sugar glaze.',
    urduDescription: 'نرم اور میٹھے گلیزڈ ڈونٹس۔',
    sizes: [{ size: '1 Piece', price: 0 }, { size: 'Box of 6', price: 1000 }], // Total 1250 (Discounted from 1500)
    addons: []
  },
  {
    id: 23, name: 'Chocolate Frosted Donuts', urduName: 'چاکلیٹ فروسٹڈ ڈونٹس',
    price: 1000, category: 'donuts', badges: ['bestseller'],
    image: '/images/Chocolate-Frosted-Donuts-High-Res-68.webp',
    description: 'Topped with thick chocolate ganache and sprinkles.',
    urduDescription: 'چاکلیٹ اور سپرنکلز والے شاندار ڈونٹس۔',
    sizes: [{ size: 'Box of 4', price: 0 }, { size: 'Box of 6', price: 500 }],
    addons: []
  },
  {
    id: 24, name: 'Strawberry Ring Donut', urduName: 'اسٹرابری رنگ ڈونٹ',
    price: 1100, category: 'donuts', badges: [],
    image: '/images/strawberry-donuts-with-strawberry-glaze.jpg',
    description: 'Sweet strawberry glaze topped with colorful sprinkles.',
    urduDescription: 'اسٹرابری کے ذائقے والے نرم ڈونٹس۔',
    sizes: [{ size: 'Box of 4', price: 0 }, { size: 'Box of 6', price: 600 }],
    addons: []
  },

  // GLUTEN-FREE (6 Items)
  {
    id: 25, name: 'Almond Flour GF Cake', urduName: 'بادام کے آٹے کا گلوٹن فری کیک',
    price: 3000, category: 'gluten-free', badges: ['gluten-free'],
    image: '/images/Gluten-Free-Almond-Cake-5-2.jpg',
    description: '100% gluten-free cake made entirely with premium almond flour.',
    urduDescription: 'صرف بادام کے آٹے سے بنا 100 فیصد گلوٹن فری کیک۔',
    sizes: [{ size: '1 Pound', price: 0 }, { size: '2 Pounds', price: 2500 }],
    addons: []
  },
  {
    id: 26, name: 'GF Banana Bread', urduName: 'گلوٹن فری بنانا بریڈ',
    price: 1800, category: 'gluten-free', badges: ['gluten-free'],
    image: '/images/gluten-free-banana-bread-recipe-3210.jpg',
    description: 'Moist banana loaf made with oat and almond flour.',
    urduDescription: 'کیلوں اور بادام کے آٹے سے بنی نرم بریڈ۔',
    sizes: [{ size: '1 Loaf', price: 0 }],
    addons: []
  },
  {
    id: 27, name: 'Vegan Lemon Loaf', urduName: 'ویگن لیمن لوف',
    price: 1600, category: 'gluten-free', badges: ['gluten-free'],
    image: '/images/starbucks-lemon-loaf.jpg',
    description: 'Eggless, dairy-free, and gluten-free zesty lemon cake.',
    urduDescription: 'انڈے اور ڈیری کے بغیر گلوٹن فری لیمن کیک۔',
    sizes: [{ size: '1 Loaf', price: 0 }],
    addons: []
  },
  {
    id: 28, name: 'GF Chocolate Cupcakes', urduName: 'گلوٹن فری چاکلیٹ کپ کیکس',
    price: 1500, category: 'gluten-free', badges: ['gluten-free'],
    image: '/images/Screenshot 2026-05-01 153154.png',
    description: 'Moist GF cupcakes with rich chocolate frosting.',
    urduDescription: 'گلوٹن فری کپ کیکس بہترین فروسٹنگ کے ساتھ۔',
    sizes: [{ size: 'Box of 6', price: 0 }, { size: 'Box of 12', price: 1200 }],
    addons: []
  },
  {
    id: 29, name: 'GF Apple Cinnamon Muffin', urduName: 'گلوٹن فری ایپل سنیمن مفنز',
    price: 1400, category: 'gluten-free', badges: ['gluten-free'],
    image: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&q=80&w=800',
    description: 'Apples and warm cinnamon baked into a GF muffin.',
    urduDescription: 'سیب اور دارچینی والے گلوٹن فری مفنز۔',
    sizes: [{ size: 'Box of 4', price: 0 }, { size: 'Box of 8', price: 1000 }],
    addons: []
  },
  {
    id: 30, name: 'GF Berry Tart', urduName: 'گلوٹن فری بیری ٹارٹ',
    price: 2500, category: 'gluten-free', badges: ['gf', 'bestseller'],
    image: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&q=80&w=800',
    description: 'Almond flour crust filled with fresh berries and GF custard.',
    urduDescription: 'تازہ بیریز اور بادام کے کرسٹ والا اسپیشل ٹارٹ۔',
    sizes: [{ size: '6 Inch', price: 0 }, { size: '9 Inch', price: 1500 }],
    addons: []
  }
];

export const reviews = [
  {
    id: 1, name: 'Nasira', rating: 5,
    lang: 'ur',
    text: 'واقعی بہترین بیکری ہے! چاکلیٹ کیک اتنا نرم اور مزیدار تھا کہ بس پوچھیں مت۔ ہر آرڈر پر بھروسہ کیا جا سکتا ہے۔'
  },
  {
    id: 2, name: 'Kashif Rauf', rating: 5,
    lang: 'en',
    text: 'Absolutely love the brownies from Velvet Whisk! Perfectly fudgy and rich. Ordered twice already and will keep coming back!'
  },
  {
    id: 3, name: 'Mahelqa', rating: 5,
    lang: 'ur',
    text: 'ریڈ ویلویٹ کیک بہت لاجواب تھا۔ پیکنگ بھی شاندار تھی اور ڈیلیوری بھی وقت پر۔ دل خوش ہو گیا!'
  },
  {
    id: 4, name: 'Tanzeel Ul Rehman', rating: 5,
    lang: 'en',
    text: 'The Lotus Biscoff cake was out of this world! Super moist and the flavors were incredible. Highly recommended!'
  },
  {
    id: 5, name: 'Amir Shahzad', rating: 5,
    lang: 'ur',
    text: 'Velvet Whisk کا ہر آئٹم دل کو خوش کر دیتا ہے۔ کوکیز اتنی کرسپی اور مزیدار تھیں کہ بس دل نہیں مانا رکنے کو۔'
  },
  {
    id: 6, name: 'Abdullah', rating: 5,
    lang: 'en',
    text: 'Great service and even better baked goods! The chocolate chip cookies are the best I have ever tasted. Fresh and warm on delivery.'
  },
  {
    id: 7, name: 'Mohammed Irfan', rating: 5,
    lang: 'ur',
    text: 'بلیک فارسٹ کیک آرڈر کیا تھا، ذائقہ بالکل روایتی اور اصلی تھا۔ گھر کی بنی چیز کا احساس ملا۔ بہت شکریہ!'
  },
  {
    id: 8, name: 'Hania Fatima', rating: 5,
    lang: 'en',
    text: 'The cream puffs and eclairs are divine! Light, airy, and filled with the most delicious custard. Will definitely order again!'
  },
  {
    id: 9, name: 'Madiha Shawal', rating: 5,
    lang: 'ur',
    text: 'گلوٹن فری آپشنز دیکھ کر حیران رہ گئی اور ذائقہ بھی لاجواب۔ بادام کے آٹے کا کیک بالکل پرفیکٹ تھا!'
  },
  {
    id: 10, name: 'Maha', rating: 5,
    lang: 'en',
    text: 'Ordered the fruit tart pastry and it was absolutely stunning! Fresh fruits and the custard was to die for. Love this bakery!'
  },
  {
    id: 11, name: 'Zuha Turab', rating: 5,
    lang: 'ur',
    text: 'ڈونٹس اتنے نرم اور لذیذ تھے کہ گھر میں سب نے تعریف کی۔ اگلی بار پورا باکس منگواؤں گی انشاءاللہ!'
  },
  {
    id: 12, name: 'Zuhaib Ijaz', rating: 5,
    lang: 'en',
    text: 'Salted caramel brownies are simply the best! Perfect balance of sweet and salty. Packaging was premium and delivery was on time.'
  },
  {
    id: 13, name: 'Robeena Naz', rating: 5,
    lang: 'ur',
    text: 'بہت اعلیٰ معیار کی بیکری ہے۔ ونیلا بٹرکریم کیک منہ میں گھل گیا۔ گھر میں سب نے خوب پسند کیا۔'
  },
  {
    id: 14, name: 'Noor', rating: 5,
    lang: 'en',
    text: 'The macadamia and white chocolate cookies are absolutely premium! Crunchy, buttery, and the white chocolate chunks made it perfect.'
  },
  {
    id: 15, name: 'M. Usman', rating: 5,
    lang: 'ur',
    text: 'آرڈر کرنا بہت آسان تھا اور ڈیلیوری بھی تیز۔ چاکلیٹ فروسٹڈ ڈونٹس بے حد مزیدار تھے۔ ضرور دوبارہ آرڈر کروں گا!'
  },
  {
    id: 16, name: 'Haider Khan', rating: 5,
    lang: 'en',
    text: 'Velvet Whisk never disappoints! The pineapple fruit cake was incredibly refreshing. Perfect for celebrations. Five stars without hesitation!'
  },
  {
    id: 17, name: 'AS. Asif', rating: 5,
    lang: 'ur',
    text: 'لوٹس بسکوف کیک پہلی بار آرڈر کیا۔ واللہ اتنا مزیدار تھا! دوستوں نے بھی بہت تعریف کی۔'
  },
  {
    id: 18, name: 'Zaid Malik', rating: 5,
    lang: 'en',
    text: 'Exceptional quality and taste! The walnut brownies are rich, fudgy, and absolutely satisfying. Best home bakery in town by far!'
  },
  {
    id: 19, name: 'Talha', rating: 5,
    lang: 'ur',
    text: 'سگنیچر فجی براؤنیز نے دل جیت لیا! اتنی چاکلیٹی اور نرم کہ بس کھاتے ہی رہیں۔ Velvet Whisk زندہ باد!'
  }
];
