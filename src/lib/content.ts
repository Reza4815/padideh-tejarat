import { db } from "@/db";
import { siteContents } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Stat = { value: string; label: string };

export type HeroContent = {
  badge: string;
  title: string;
  highlight: string;
  titleAfter: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: Stat[];
  image: string;
  floatCard1: { title: string; desc: string };
  floatCard2: { title: string; desc: string };
};

export type FeatureItem = { icon: string; title: string; desc: string };

export type FeaturesContent = {
  heading: string;
  subheading: string;
  items: FeatureItem[];
};

export type AboutContent = {
  badge: string;
  heading: string;
  lead: string;
  text: string;
  bullets: string[];
  image: string;
  stats: Stat[];
};

export type FaqItem = { q: string; a: string };

export type ContactContent = {
  heading: string;
  address: string;
  phones: string[];
  email: string;
  hours: string;
  note: string;
};

export type FooterContent = {
  about: string;
  hours: string;
  note: string;
};

export type WholesaleContent = {
  heading: string;
  subheading: string;
  bullets: string[];
};

export type SlideItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  link: string;
  cta: string;
};

export type SliderContent = {
  slides: SlideItem[];
};

export const DEFAULT_SLIDER: SliderContent = {
  slides: [
    {
      id: "1",
      title: "قطعات موتور و انتقال قدرت",
      subtitle: "اورجینال و با ضمانت اصالت کالا",
      image:
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&q=80",
      mobileImage: "",
      link: "/products",
      cta: "مشاهده محصولات",
    },
    {
      id: "2",
      title: "سیستم ترمز و تعلیق",
      subtitle: "ایمنی خودروی شما، اولویت ما",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80",
      mobileImage: "",
      link: "/products",
      cta: "مشاهده محصولات",
    },
    {
      id: "3",
      title: "برق و الکترونیک خودرو",
      subtitle: "برندهای معتبر جهانی با گارانتی",
      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80",
      mobileImage: "",
      link: "/products",
      cta: "مشاهده محصولات",
    },
  ],
};

export const DEFAULT_HERO: HeroContent = {
  badge: "تامین‌کننده تخصصی قطعات یدکی خودرو",
  title: "قطعات یدکی اصلی،",
  highlight: "عملکرد بی‌نقص",
  titleAfter: "برای خودروی شما",
  subtitle:
    "پدیده تجارت الوند با بیش از پانزده سال تجربه، مرجع معتمد تامین قطعات یدکی اورجینال خودروهای سواری و تجاری است؛ با ضمانت اصالت کالا، قیمت رقابتی و ارسال سراسری.",
  primaryCta: { label: "مشاهده فروشگاه", href: "/products" },
  secondaryCta: { label: "استعلام عمده‌فروشی", href: "/#wholesale" },
  stats: [
    { value: "+۱۵", label: "سال تجربه" },
    { value: "+۲۴٬۰۰۰", label: "قلم کالا" },
    { value: "٪۹۸", label: "رضایت مشتری" },
  ],
  image: "/img/hero.jpg",
  floatCard1: { title: "ضمانت اصالت", desc: "تطابق ۱۰۰٪ با کد OEM" },
  floatCard2: { title: "ارسال ۲۴ ساعته", desc: "به سراسر کشور" },
};

export const DEFAULT_FEATURES: FeaturesContent = {
  heading: "چرا پدیده تجارت الوند؟",
  subheading: "دقت، کیفیت و اعتماد؛ سه اصل ثابت ما در تامین قطعات یدکی.",
  items: [
    {
      icon: "shield",
      title: "گارانتی اصالت کالا",
      desc: "تمامی قطعات با ضمانت‌نامه اصالت و سلامت فیزیکی عرضه می‌شوند.",
    },
    {
      icon: "truck",
      title: "ارسال سریع سراسری",
      desc: "پردازش سفارش در همان روز و ارسال به سراسر کشور با بیمه بار.",
    },
    {
      icon: "wrench",
      title: "مشاوره فنی تخصصی",
      desc: "کارشناسان ما قطعه دقیق متناسب با خودروی شما را معرفی می‌کنند.",
    },
    {
      icon: "badge",
      title: "تضمین بهترین قیمت",
      desc: "خرید مستقیم از واردکنندگان رسمی، یعنی حذف واسطه و قیمت رقابتی.",
    },
  ],
};

export const DEFAULT_ABOUT: AboutContent = {
  badge: "درباره ما",
  heading: "دقت مهندسی، اعتماد یک‌دهه‌و‌نیم",
  lead: "پدیده تجارت الوند؛ همراه مطمئن خودروی شما",
  text: "ما از دل بازار قطعات یدکی با یک هدف روشن شروع کردیم: دسترسی آسان صاحبان خودرو و تعمیرگاه‌ها به قطعات اصلی با قیمت منصفانه. امروز با شبکه‌ای از واردکنندگان رسمی برندهای معتبر جهانی، انبار مرکزی مجهز و تیم فنی متخصص، هزاران قلم کالای اورجینال را با ضمانت اصالت عرضه می‌کنیم.",
  bullets: [
    "تامین مستقیم از نمایندگی‌های رسمی برند",
    "کنترل کیفیت و تطابق کد OEM پیش از ارسال",
    "تیم فنی با تجربه عملی در سطح مکانیکی",
    "امکان تامین سازمانی برای ناوگان و تعمیرگاه‌ها",
  ],
  image: "/img/about.jpg",
  stats: [
    { value: "+۳٬۲۰۰", label: "مشتری سازمانی" },
    { value: "+۴۰", label: "برند معتبر جهانی" },
  ],
};

export const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "چطور از اصالت قطعات مطمئن شوم؟",
    a: "تمام قطعات ما با ضمانت‌نامه اصالت کالا عرضه می‌شوند. کد OEM روی هر قطعه قابل استعلام است و پیش از ارسال، تطابق قطعه با خودروی شما توسط تیم فنی بررسی می‌شود.",
  },
  {
    q: "ارسال به شهرستان‌ها چقدر زمان می‌برد؟",
    a: "سفارش‌های ثبت‌شده تا ساعت ۱۴ همان روز پردازش و تحویل باربری می‌شوند. بسته به مقصد، تحویل بین ۲۴ تا ۷۲ ساعت زمان می‌برد و همه مرسولات بیمه هستند.",
  },
  {
    q: "آیا امکان خرید عمده برای تعمیرگاه‌ها وجود دارد؟",
    a: "بله. تعمیرگاه‌ها، ناوگان حمل‌ونقل و شرکت‌ها می‌توانند از طریق فرم عمده‌فروشی درخواست خود را ثبت کنند تا واحد فروش سازمانی با لیست قیمت اختصاصی با آن‌ها تماس بگیرد.",
  },
  {
    q: "شرایط مرجوعی کالا چگونه است؟",
    a: "تا ۷ روز پس از تحویل، در صورت عدم نصب و سلامت بسته‌بندی، امکان مرجوعی وجود دارد. قطعات برقی طبق ضمانت‌نامه مهلت تست دارند.",
  },
  {
    q: "اگر قطعه موردنظرم در سایت موجود نبود چه کنم؟",
    a: "با تماس تلفنی یا ارسال کد فنی قطعه (OEM) از طریق فرم تماس، تیم ما قطعه را از شبکه تامین پیدا کرده و ظرف ۴۸ ساعت قیمت و موجودی را اعلام می‌کند.",
  },
];

export const DEFAULT_CONTACT: ContactContent = {
  heading: "در تماس باشیم",
  address:
    "تهران، جاده قدیم قم، بازار بزرگ قطعات یدکی خودرو (چراغ‌برق)، پلاک ۱۲۸",
  phones: ["۰۲۱-۳۳۹۰۱۲۳۴", "۰۹۱۲۳۴۵۶۷۸۹"],
  email: "info@ptalvand.ir",
  hours: "شنبه تا پنجشنبه | ۸:۳۰ تا ۱۸:۰۰",
  note: "برای استعلام موجودی و قیمت، کد فنی قطعه یا مدل دقیق خودرو را همراه داشته باشید.",
};

export const DEFAULT_FOOTER: FooterContent = {
  about:
    "پدیده تجارت الوند، مرجع تخصصی قطعات یدکی اصلی خودرو با بیش از پانزده سال تجربه؛ تامین‌کننده مستقیم برندهای معتبر جهانی با ضمانت اصالت کالا و ارسال سراسری.",
  hours: "شنبه تا پنجشنبه | ۸:۳۰ تا ۱۸:۰۰",
  note: "تمامی حقوق مادی و معنوی این وب‌سایت متعلق به پدیده تجارت الوند است.",
};

export const DEFAULT_WHOLESALE: WholesaleContent = {
  heading: "خرید عمده و همکاری سازمانی",
  subheading:
    "تعمیرگاه، ناوگان یا فروشگاه لوازم یدکی دارید؟ فرم زیر را تکمیل کنید تا کارشناسان فروش سازمانی ما با پیشنهاد قیمت اختصاصی با شما تماس بگیرند.",
  bullets: [
    "لیست قیمت اختصاصی برای همکاران",
    "تامین سفارش‌های حجیم در کوتاه‌ترین زمان",
    "امکان تسویه اعتباری برای مشتریان سازمانی",
    "پشتیبانی اختصاصی و پیگیری لحظه‌ای سفارش",
  ],
};

export type ContentMap = {
  hero: HeroContent;
  slider: SliderContent;
  features: FeaturesContent;
  about: AboutContent;
  faq: FaqItem[];
  contact: ContactContent;
  footer: FooterContent;
  wholesale: WholesaleContent;
};

export const CONTENT_DEFAULTS: ContentMap = {
  hero: DEFAULT_HERO,
  slider: DEFAULT_SLIDER,
  features: DEFAULT_FEATURES,
  about: DEFAULT_ABOUT,
  faq: DEFAULT_FAQ,
  contact: DEFAULT_CONTACT,
  footer: DEFAULT_FOOTER,
  wholesale: DEFAULT_WHOLESALE,
};

export type ContentKey = keyof ContentMap;

export async function getSiteContent<K extends ContentKey>(
  key: K,
): Promise<ContentMap[K]> {
  const def = CONTENT_DEFAULTS[key];
  try {
    const [row] = await db
      .select()
      .from(siteContents)
      .where(eq(siteContents.key, key))
      .limit(1);
    if (row?.value != null) {
      if (Array.isArray(def)) {
        return (Array.isArray(row.value) ? row.value : def) as ContentMap[K];
      }
      return { ...(def as object), ...(row.value as object) } as ContentMap[K];
    }
  } catch {
    // table might not exist yet during first boot
  }
  return def;
}

export async function getAllSiteContent(): Promise<ContentMap> {
  const keys = Object.keys(CONTENT_DEFAULTS) as ContentKey[];
  const entries = await Promise.all(
    keys.map(async (k) => [k, await getSiteContent(k)] as const),
  );
  return Object.fromEntries(entries) as ContentMap;
}
