import { and, asc, desc, eq, gt, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, admins, type CategoryRow, type ProductRow } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

let seedPromise: Promise<void> | null = null;

export function ensureSeed() {
  if (!seedPromise) {
    seedPromise = doSeed().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  return seedPromise;
}

const CATEGORY_SEED = [
  { name: "سیستم ترمز", slug: "brakes", image: "/img/p-brake-disc.jpg", description: "دیسک، لنت، کالیپر و قطعات ترمز", sort: 1 },
  { name: "تعلیق و فرمان", slug: "suspension", image: "/img/p-shock.jpg", description: "کمک‌فنر، فنر و قطعات جلوبندی", sort: 2 },
  { name: "موتور و انتقال قدرت", slug: "engine", image: "/img/p-belt.jpg", description: "شمع، تسمه، سرسیلندر و قطعات موتور", sort: 3 },
  { name: "فیلتر و مصرفی", slug: "filters", image: "/img/p-filter.jpg", description: "فیلتر روغن، هوا، بنزین و کابین", sort: 4 },
  { name: "روشنایی", slug: "lighting", image: "/img/p-headlight.jpg", description: "چراغ جلو، مه‌شکن و ماژول LED", sort: 5 },
  { name: "برق و الکتریک", slug: "electrical", image: "/img/p-alternator.jpg", description: "دینام، باتری، استارت و سنسورها", sort: 6 },
];

const PRODUCT_SEED = [
  {
    name: "دیسک ترمز جلو ونتیله برمبو",
    slug: "brembo-ventilated-front-brake-disc",
    brand: "Brembo",
    partNumber: "09.A969.21",
    categorySlug: "brakes",
    price: 4850000,
    compareAtPrice: 5600000,
    stock: 24,
    featured: true,
    images: ["/img/p-brake-disc.jpg"],
    shortDesc: "دیسک ترمز ونتیله با روکش ضدزنگ UV و ساختار چدن پرکربن، ساخته‌شده دقیقاً با تلورانس‌های OEM.",
    description:
      "دیسک ترمز برمبو با طراحی ونتیله (تهویه‌دار) گرمای ناشی از ترمزگیری‌های متوالی را به‌سرعت دفع می‌کند و از خمیدگی سطح جلوگیری می‌نماید. سطح ترمز با دقت میکرونی ماشین‌کاری شده و روکش UV روی قسمت‌های غیر تماسی از خوردگی و زنگ‌زدگی محافظت می‌کند.\n\nتعادل داینامیک هر دیسک به‌صورت جداگانه در کارخانه کنترل می‌شود تا لرزش پدال و صدای ترمز به حداقل برسد. این قطعه جایگزین مستقیم دیسک اورجینال است و بدون نیاز به تغییر نصب می‌شود.",
    benefits: [
      "اتلاف حرارتی بالا در ترمزگیری‌های پی‌درپی",
      "روکش UV ضدخوردهگی برای دوام بیشتر",
      "کاهش لرزش، صدای سوت و لقی پدال",
      "نصب مستقیم مطابق استاندارد OEM",
    ],
    specs: [
      { label: "قطر خارجی", value: "۲۸۳ میلی‌متر" },
      { label: "ضخامت", value: "۲۶ میلی‌متر" },
      { label: "نوع دیسک", value: "ونتیله (تهویه‌دار)" },
      { label: "تعداد سوراخ چرخ", value: "۴ پیچ" },
      { label: "جنس", value: "چدن پرکربن ضدزنگ" },
      { label: "کشور سازنده", value: "ایتالیا" },
    ],
    compatibility: ["پژو ۲۰۶ تیپ ۵ به بالا", "پژو ۲۰۷ اتوماتیک و دنده‌ای", "رانا پلاس", "دنا (قبل از فیس‌لیفت)"],
  },
  {
    name: "لنت ترمز سرامیکی جلو تکستار",
    slug: "textar-ceramic-front-brake-pads",
    brand: "Textar",
    partNumber: "epads 2376601",
    categorySlug: "brakes",
    price: 2980000,
    compareAtPrice: 3450000,
    stock: 40,
    featured: true,
    images: ["/img/p-brake-pads.jpg"],
    shortDesc: "لنت سرامیکی کم‌غبار با لایه شیب‌دار (Chamfer) و صفحه فلزی ضدلرزش، بدون سوت و خراش دیسک.",
    description:
      "لنت‌های سرامیکی تکستار با فرمولاسیون اختصاصی، گرد و غبار ترمز را تا ۷۰٪ کاهش داده و رینگ‌ها را تمیز نگه می‌دارند. لایه شیب‌دار لبه‌ها و صفحه فلزی پشتی، صدای سوت را عملاً حذف می‌کند.\n\nاین لنت‌ها در دمای بالا پایداری اصطکاک عالی دارند و با دیسک‌های اورجینال و برمبو کاملاً سازگارند.",
    benefits: [
      "فرمول سرامیکی کم‌غبار، رینگ تمیزتر",
      "بدون صدای سوت با صفحه فلزی ضدلرزش",
      "عمر مفید ۲۰٪ بیشتر نسبت به لنت ارganic",
      "عملکرد پایدار در دمای بالا",
    ],
    specs: [
      { label: "جنس ترکیب", value: "سرامیک کم‌فلز (Low-Metallic)" },
      { label: "ضخامت لنت", value: "۱۸.۵ میلی‌متر" },
      { label: "استاندارد", value: "ECE R90" },
      { label: "دامنه دمای کاری", value: "تا ۶۵۰ درجه" },
      { label: "کشور سازنده", value: "آلمان" },
    ],
    compatibility: ["پژو ۲۰۶ تمام تیپ‌ها", "پژو ۲۰۷", "رانا", "سمند LX و EF7", "پارس TU5"],
  },
  {
    name: "کالیپر ترمز چهار پیستونه ATE بازسازی‌شده",
    slug: "ate-4-piston-brake-caliper",
    brand: "ATE",
    partNumber: "24.3541-8701.5",
    categorySlug: "brakes",
    price: 12400000,
    compareAtPrice: null,
    stock: 8,
    featured: false,
    images: ["https://images.pexels.com/photos/34277923/pexels-photo-34277923.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    shortDesc: "کالیپر چهار پیستونه با فشار یکنواخت روی لنت، کاملاً سرویس‌شده با کیت آب‌بندی جدید.",
    description:
      "کالیپر چهار پیستونه ATE با توزیع یکنواخت فشار روی سطح لنت، ترمزگیری دقیق‌تر و خطی‌تری ارائه می‌دهد. تمام قطعات داخلی شامل پیستون‌ها، سیلها و گردگیرها با کیت اورجینال تعویض شده‌اند.\n\nقبل از ارسال، هر کالیپر در دستگاه تست فشار هیدرولیک ۲۵۰ بار تست می‌شود و گواهی سلامت صادر می‌گردد.",
    benefits: [
      "توزیع یکنواخت فشار ترمز روی لنت",
      "تست فشار هیدرولیک ۲۵۰ بار",
      "کیت آب‌بندی و پیستون نو",
      "یک سال گارانتی تعویض",
    ],
    specs: [
      { label: "تعداد پیستون", value: "۴ عدد" },
      { label: "قطر پیستون", value: "۴۰ میلی‌متر" },
      { label: "قابلیت نصب", value: "دیسک ۲۸۳ تا ۳۲۴ م‌م" },
      { label: "گارانتی", value: "۱۲ ماه" },
      { label: "کشور سازنده", value: "آلمان" },
    ],
    compatibility: ["پژو ۲۰۷ اسپرت", "مگان ۲۰۰۰ سی‌اس", "سمند سورن پلاس", "هیوندای النترا ۲۰۱۶-۲۰۲۰"],
  },
  {
    name: "کمک‌فنر گازی عقب KYB Excel-G",
    slug: "kyb-excel-g-rear-shock-absorber",
    brand: "KYB",
    partNumber: "344459",
    categorySlug: "suspension",
    price: 6750000,
    compareAtPrice: null,
    stock: 18,
    featured: true,
    images: ["/img/p-shock.jpg"],
    shortDesc: "کمک‌فنر گاز نیتروژن با میله کروم سخت، جذب نرم ضربات و پایداری عالی در سرعت.",
    description:
      "کمک‌فنر Excel-G سری محبوب KYB است که با گاز نیتروژن تحت فشار، کف‌کردن روغن (Cavitation) را حذف می‌کند و پاسخ‌دهی خطی در تمام شرایط جاده حفظ می‌نماید.\n\nمیله کروم سخت و بشقابک‌های دقیق این کمک‌فنر، فرسودگی ناشی از ضربات مکرر را به حداقل رسانده و عمر آن را تا دو برابر مدل‌های معمولی افزایش می‌دهد.",
    benefits: [
      "گاز نیتروژن — بدون کف‌کردن روغن",
      "میله کروم سخت با آبکاری سه‌لایه",
      "پایداری در پیچ‌ها و تغییر مسیر ناگهانی",
      "نصب بدون تغییر روی پایه‌های اورجینال",
    ],
    specs: [
      { label: "نوع", value: "گازی-هیدرولیک دو لوله" },
      { label: "طول بسته", value: "۳۸۵ میلی‌متر" },
      { label: "حرکت کاری", value: "۱۲۰ میلی‌متر" },
      { label: "قطر میله", value: "۱۶ میلی‌متر" },
      { label: "کشور سازنده", value: "ژاپن" },
    ],
    compatibility: ["پژو ۴۰۵ تمام مدل‌ها", "سمند سورن", "پارس", "رانا", "مازندران"],
  },
  {
    name: "کیت تسمه تایم + هرزگرد ContiTech",
    slug: "contitech-timing-belt-kit",
    brand: "ContiTech",
    partNumber: "CT1184K1",
    categorySlug: "engine",
    price: 8900000,
    compareAtPrice: 9800000,
    stock: 14,
    featured: true,
    images: ["/img/p-belt.jpg"],
    shortDesc: "کیت کامل تسمه تایم شامل تسمه، هرزگرد کششی و هرزگرد ثابت ContiTech، ساخت آلمان.",
    description:
      "کیت ContiTech شامل تسمه تایم با الیاف شیشه‌محور، هرزگرد کششی خودتنظیم و هرزگرد ثابت است؛ هر سه قطعه دقیقاً با تلورانس‌های کارخانه موتور مطابقت دارند.\n\nتعویض هم‌زمان تسمه و هرزگردها (توصیه کارخانه) از شکست تسمه و آسیب‌های میلیونی به سوپاپ‌ها جلوگیری می‌کند. این کیت برای موتورهای TU3، TU5 و EF7 طراحی شده است.",
    benefits: [
      "تسمه با الیاف شیشه‌محور Triple Layer",
      "هرزگرد خودتنظیم با دقت تنش دائمی",
      "عمر مفید ۸۰٬۰۰۰ کیلومتر",
      "تطابق کامل با موتورهای TU5 و EF7",
    ],
    specs: [
      { label: "تعداد دندانه", value: "۱۱۴ دندان" },
      { label: "عرض تسمه", value: "۲۳ میلی‌متر" },
      { label: "محتویات کیت", value: "تسمه + ۲ هرزگرد" },
      { label: "گارانتی", value: "۸۰٬۰۰۰ کیلومتر" },
      { label: "کشور سازنده", value: "آلمان" },
    ],
    compatibility: ["پژو ۴۰۵ SLX و GLX", "سمند EF7", "پارس", "دنا", "دنا پلاس", "رانا"],
  },
  {
    name: "شمع ایریدیوم NGK Laser Iridium (بسته ۴ عددی)",
    slug: "ngk-laser-iridium-spark-plugs-4pcs",
    brand: "NGK",
    partNumber: "ILZKR7B-11S",
    categorySlug: "engine",
    price: 1640000,
    compareAtPrice: null,
    stock: 85,
    featured: false,
    images: ["/img/p-spark.jpg"],
    shortDesc: "شمع ایریدیوم با الکترود مرکزی ۰.۶ میلی‌متری، جرقه قوی‌تر و عمر ۱۰۰٬۰۰۰ کیلومتری.",
    description:
      "شمع‌های Laser Iridium با الکترود مرکزی ایریدیوم ۰/۶ میلی‌متری، جرقه‌ای متمرکز و قدرتمند تولید می‌کنند که احتراق کامل‌تر، مصرف سوخت کمتر و استارت سریع‌تر را به همراه دارد.\n\nعمر مفید این شمع‌ها حدود ۱۰۰٬۰۰۰ کیلومتر است — پنج برابر شمع‌های نیکل معمولی — و نیاز به تنظیم دوره‌ای ندارند.",
    benefits: [
      "الکترود ایریدیوم ۰/۶ م‌م — جرقه متمرکز",
      "عمر ۱۰۰٬۰۰۰ کیلومتر — ۵ برابر شمع معمولی",
      "کاهش مصرف سوخت تا ۵٪",
      "مقاوم در برابر رسوب و تجمع کربن",
    ],
    specs: [
      { label: "نوع الکترود", value: "ایریدیوم تک‌پلاتین" },
      { label: "فاصله الکترود", value: "۱.۱ میلی‌متر" },
      { label: "مقاومت داخلی", value: "۵ کیلواهم" },
      { label: "گشتاور نصب", value: "۲۵ تا ۳۰ نیوتن‌متر" },
      { label: "کشور سازنده", value: "ژاپن" },
    ],
    compatibility: ["پژو ۲۰۶ TU5", "۲۰۷ TCH5", "رانا TU5P", "سمند EF7", "دنا", "تیبا ۲"],
  },
  {
    name: "سرسیلندر کامل AMC با سوپاپ و میل‌بادامک",
    slug: "amc-complete-cylinder-head",
    brand: "AMC",
    partNumber: "908 781",
    categorySlug: "engine",
    price: 46500000,
    compareAtPrice: null,
    stock: 3,
    featured: false,
    images: ["https://images.pexels.com/photos/7006682/pexels-photo-7006682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    shortDesc: "سرسیلندر کامل مونتاژ‌شده شامل سوپاپ‌ها، فنرها، میل‌بادامک و لفرماها؛ آماده نصب.",
    description:
      "سرسیلندر کامل AMC با ریخته‌گری آلومینیوم پرفشار، تمام قطعات داخلی از جمله سوپاپ‌ها، سیت‌ها، فنرها، میل‌بادامک و لفرماها به‌صورت فابریک مونتاژ شده است.\n\nاین قطعه آماده نصب مستقیم روی بلوک موتور TU5 و EF7 است؛ بدون نیاز به تراشکاری یا تنظیم. همراه با واشر سرسیلندر و گایدهای سوپاپ عرضه می‌شود.",
    benefits: [
      "مونتاژ کامل فابریک — آماده نصب",
      "ریخته‌گری آلومینیوم پرفشار (HPDC)",
      "شامل واشر سرسیلندر OEM",
      "تست فشار ریخته‌گری ۱۰۰٪",
    ],
    specs: [
      { label: "جنس", value: "آلومینیوم ریخته‌گری HPDC" },
      { label: "تعداد سوپاپ", value: "۱۶ سوپاپ" },
      { label: "شامل", value: "میل‌بادامک، سوپاپ، فنر، لفرما" },
      { label: "وضعیت", value: "نو — Zero-Milage" },
      { label: "کشور سازنده", value: "اسپانیا" },
    ],
    compatibility: ["پژو ۴۰۶", "پژو ۴۰۷", "سمند EF7", "دنا", "پارس"],
  },
  {
    name: "فیلتر روغن موتور MANN W712/75",
    slug: "mann-w71275-oil-filter",
    brand: "MANN-FILTER",
    partNumber: "W 712/75",
    categorySlug: "filters",
    price: 1285000,
    compareAtPrice: 1520000,
    stock: 60,
    featured: false,
    images: ["/img/p-filter.jpg"],
    shortDesc: "فیلتر روغن با مدیا سلولزی-مصنوعی هیبرید و واشر ضدبرگشت سیلیکونی.",
    description:
      "فیلتر W712/75 از مدیا هیبرید سلولزی-مصنوعی با راندمان فیلتراسیون ۹۹.۵٪ در ۲۵ میکرون استفاده می‌کند و ذرات ساینده را قبل از رسیدن به یاتاقان‌ها متوقف می‌سازد.\n\nواشر ضدبرگشت سیلیکونی از خشک‌شدن مدار روغن در استارت سرد جلوگیری کرده و استارت صبحگاهی را روان می‌سازد. ساختار مقاومی بدنه تا فشار ۱۸ بار تست شده است.",
    benefits: [
      "راندمان فیلتراسیون ۹۹.۵٪",
      "واشر ضدبرگشت سیلیکونی دائمی",
      "بدنه مقاوم تا فشار ۱۸ بار",
      "نصب آسان با شش‌پر استاندارد",
    ],
    specs: [
      { label: "قطر", value: "۷۶ میلی‌متر" },
      { label: "ارتفاع", value: "۷۹ میلی‌متر" },
      { label: "رزوه", value: "M20 × 1.5" },
      { label: "دقت فیلتر", value: "۲۵ میکرون" },
      { label: "کشور سازنده", value: "آلمان" },
    ],
    compatibility: ["پژو ۲۰۶", "۲۰۷", "رانا", "سمند", "دنا", "تارا", "شاهین", "کوییک"],
  },
  {
    name: "چراغ جلو LED والئو Matrix Beam",
    slug: "valeo-matrix-led-headlight",
    brand: "Valeo",
    partNumber: "047562",
    categorySlug: "lighting",
    price: 34900000,
    compareAtPrice: null,
    stock: 5,
    featured: true,
    images: ["/img/p-headlight.jpg"],
    shortDesc: "چراغ LED ماتریکسی با نور روز خط‌دار، پروژکتور دوقلو و شیشه پلی‌کربنات UV.",
    description:
      "چراغ جلو LED والئو با فناوری Matrix Beam نوردهی هوشمند و بدون خیره‌کردن رانندگان مقابل را فراهم می‌کند. پروژکتور دوقلوی Bi-LED نور بالا و پایین را از یک ماژول تامین می‌سازد.\n\nشیشه پلی‌کربنات با پوشش UV از کدری و زردشدگی در اثر نور خورشید جلوگیری می‌کند. نور روز خط‌دار LED با امضای نوری شاخص، چهره خودرو را لوکس می‌کند.",
    benefits: [
      "فناوری Matrix Beam — نوردهی هوشمند",
      "پروژکتور Bi-LED نور بالا و پایین",
      "شیشه ضدخش و ضد UV",
      "مقاومت IP67 در برابر آب",
    ],
    specs: [
      { label: "نوع لامپ", value: "LED ماتریکسی" },
      { label: "فلاکس نوری", value: "۳۲۰۰ لومن" },
      { label: "دمای رنگ", value: "۶۰۰۰ کلوین" },
      { label: "استاندارد حفاظت", value: "IP67" },
      { label: "کشور سازنده", value: "فرانسه" },
    ],
    compatibility: ["شاهین پلاس", "دنا پلاس توربو", "تیگو ۸ پرو", "فیدلیتی پرایم"],
  },
  {
    name: "دینام ۱۲۰ آمپر بوش با رگلاتور هوشمند",
    slug: "bosch-120a-alternator",
    brand: "Bosch",
    partNumber: "0 125 715 002",
    categorySlug: "electrical",
    price: 18750000,
    compareAtPrice: null,
    stock: 9,
    featured: false,
    images: ["/img/p-alternator.jpg"],
    shortDesc: "دینام ۱۲۰ آمپر با رگلاتور هوشمند SSR و سیم‌پیچ مسی کامل، ساخت شرکت بوش آلمان.",
    description:
      "دینام ۱۲۰ آمپر بوش با سیم‌پیچ مسی ۱۰۰٪ و رگلاتور هوشمند Super Smart Regulation (SSR) ولتاژ شارژ را با دقت ۰/۱ ولت ثابت نگه می‌دارد و عمر باتری را تا ۳۰٪ افزایش می‌دهد.\n\nپولی اورانر با بلبرینگ‌های ژاپنی NSK، صدای دینام را در دور بالا عملاً حذف می‌کند. قفس داخلی سیم‌پیچ با عایق کلاس H در برابر حرارت محافظت شده است.",
    benefits: [
      "رگلاتور هوشمند SSR — ولتاژ ثابت",
      "سیم‌پیچ مسی ۱۰۰٪ با عایق کلاس H",
      "بلبرینگ ژاپنی NSK کم‌صدا",
      "خروجی ۱۲۰ آمپر واقعی در دور موتور",
    ],
    specs: [
      { label: "جریان خروجی", value: "۱۲۰ آمپر" },
      { label: "ولتاژ", value: "۱۴.۴ ولت" },
      { label: "نوع پولى", value: "۶ شیار سرعت‌ثابت" },
      { label: "کلاس عایق", value: "H — تا ۱۸۰ درجه" },
      { label: "کشور سازنده", value: "آلمان" },
    ],
    compatibility: ["سمند EF7", "دنا", "دنا پلاس", "پژو ۴۰۵", "پارس"],
  },
  {
    name: "باتری ۷۴ آمپر AGM وارتا Silver Dynamic",
    slug: "varta-agm-silver-battery-74ah",
    brand: "Varta",
    partNumber: "570 901 076 AGM",
    categorySlug: "electrical",
    price: 9680000,
    compareAtPrice: null,
    stock: 22,
    featured: false,
    images: ["https://images.pexels.com/photos/32282232/pexels-photo-32282232.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    shortDesc: "باتری AGM با فناوری جاذب جداسازی‌شده، ۷۶۰ آمپر استارت سرد و عمر ۴ سال.",
    description:
      "باتری AGM وارتا Silver Dynamic با فناوری Absorbent Glass Mat، الکترولیت را در جداسازهای شیشه‌ای نگه می‌دارد و در برابر لرزش، گرمتر شدن و چرخه عمیق مقاوم‌تر از باتری‌های معمولی است.\n\nجریان استارت سرد ۷۶۰ آمپر، روشن‌شدن آسان حتی در سرمای منفی ۳۰ درجه را تضمین می‌کند. درب‌ها کاملاً مهر و موم شده و بدون نیاز به سرویس است.",
    benefits: [
      "فناوری AGM — بدون نشتی اسید",
      "جریان استارت سرد ۷۶۰ آمپر",
      "عمر ۴ سال (دوبرابر معمولی)",
      "قابلیت استارت در سرمای شدید",
    ],
    specs: [
      { label: "ظرفیت", value: "۷۴ آمپر‌ساعت" },
      { label: "جریان استارت (CCA)", value: "۷۶۰ آمپر" },
      { label: "ابعاد", value: "۳۱۵ × ۱۷۵ × ۱۹۰ م‌م" },
      { label: "قطب", value: "راست (+ برعکس)" },
      { label: "کشور سازنده", value: "آلمان" },
    ],
    compatibility: ["پژو ۲۰۷", "هیوندای النترا", "کیا سراتو", "شاهین", "فیدلیتی"],
  },
];

async function doSeed() {
  const adminCount = await db.$count(admins);
  if (adminCount === 0) {
    await db.insert(admins).values({
      username: "admin",
      passwordHash: hashPassword("4815"),
    });
  }

  const catCount = await db.$count(categories);
  if (catCount > 0) return;

  const inserted = await db.insert(categories).values(CATEGORY_SEED).returning();
  const bySlug = new Map(inserted.map((c) => [c.slug, c.id]));

  await db.insert(products).values(
    PRODUCT_SEED.map((p) => ({
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      partNumber: p.partNumber,
      categoryId: bySlug.get(p.categorySlug) ?? null,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      stock: p.stock,
      featured: p.featured,
      active: true,
      images: p.images,
      shortDesc: p.shortDesc,
      description: p.description,
      benefits: p.benefits,
      specs: p.specs,
      compatibility: p.compatibility,
    })),
  );
}

/* ------------------------------------------------------------------ */
/* Storefront queries                                                  */
/* ------------------------------------------------------------------ */

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  partNumber: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string;
  featured: boolean;
  categoryName: string | null;
  categorySlug: string | null;
};

function toCard(row: ProductRow, cat?: CategoryRow | null): ProductCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    partNumber: row.partNumber,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    stock: row.stock,
    image: row.images?.[0] ?? "",
    featured: row.featured,
    categoryName: cat?.name ?? null,
    categorySlug: cat?.slug ?? null,
  };
}

export async function listCategories(): Promise<(CategoryRow & { count: number })[]> {
  await ensureSeed();
  const rows = await db
    .select({
      cat: categories,
      count: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.active, true)))
    .groupBy(categories.id)
    .orderBy(asc(categories.sort), asc(categories.name));
  return rows.map((r) => ({ ...r.cat, count: r.count }));
}

export type ProductFilters = {
  q?: string;
  cat?: string;
  brand?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  inStock?: boolean;
  featured?: boolean;
  activeOnly?: boolean;
  limit?: number;
};

export async function listProducts(filters: ProductFilters = {}) {
  await ensureSeed();
  const conds = [];
  if (filters.activeOnly !== false) conds.push(eq(products.active, true));
  if (filters.featured) conds.push(eq(products.featured, true));
  if (filters.inStock) conds.push(gt(products.stock, 0));
  if (filters.brand) conds.push(eq(products.brand, filters.brand));
  if (filters.q) {
    const like = `%${filters.q.trim()}%`;
    conds.push(
      or(
        ilike(products.name, like),
        ilike(products.brand, like),
        ilike(products.partNumber, like),
        ilike(products.shortDesc, like),
      ),
    );
  }
  if (filters.cat) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, filters.cat)).limit(1);
    if (cat) conds.push(eq(products.categoryId, cat.id));
    else return { items: [], catName: null as string | null };
  }

  const order =
    filters.sort === "price-asc"
      ? [asc(products.price)]
      : filters.sort === "price-desc"
        ? [desc(products.price)]
        : [desc(products.featured), desc(products.createdAt)];

  let query = db
    .select({ p: products, c: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(...order)
    .$dynamic();
  if (filters.limit) query = query.limit(filters.limit);

  const rows = await query;
  return {
    items: rows.map((r) => ({ ...r.p, category: r.c }) as ProductRow & { category: CategoryRow | null }),
    catName: null as string | null,
  };
}

export async function listProductCards(filters: ProductFilters = {}): Promise<{
  items: ProductCard[];
  total: number;
}> {
  const { items } = await listProducts(filters);
  return { items: items.map((p) => toCard(p, p.category)), total: items.length };
}

export async function getProductBySlug(slug: string) {
  await ensureSeed();
  const rows = await db
    .select({ p: products, c: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  if (!rows[0]) return null;
  return { product: rows[0].p, category: rows[0].c };
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limitCount = 4) {
  await ensureSeed();
  const conds = [eq(products.active, true), ne(products.id, excludeId)];
  if (categoryId) conds.push(eq(products.categoryId, categoryId));
  const rows = await db
    .select({ p: products, c: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conds))
    .orderBy(desc(products.featured), desc(products.createdAt))
    .limit(limitCount);
  return rows.map((r) => toCard(r.p, r.c));
}

export async function listBrands(): Promise<string[]> {
  await ensureSeed();
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand).filter(Boolean);
}
