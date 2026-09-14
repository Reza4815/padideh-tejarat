import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Cog,
  Diamond,
  Headset,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import type {
  AboutContent,
  ContactContent,
  FaqItem,
  FeaturesContent,
  HeroContent,
  WholesaleContent,
} from "@/lib/content";
import type { CategoryRow } from "@/db/schema";
import { Reveal } from "@/components/site/reveal";
import { WholesaleForm } from "@/components/site/wholesale-form";
import { FaqAccordion } from "@/components/site/faq-accordion";

/* ------------------------------ section heading ----------------------------- */

export function SectionHead({
  chip,
  title,
  sub,
  align = "center",
}: {
  chip: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
}) {
  const center = align === "center";
  return (
    <div
      className={
        center ? "mx-auto mb-10 max-w-2xl text-center" : "mb-8 max-w-2xl"
      }
    >
      <Reveal>
        <span className="chip border-gold-200 bg-gold-50 text-gold-700">
          <Diamond className="h-2.5 w-2.5 fill-gold-500 text-gold-500" />
          {chip}
        </span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-ink-950 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
      </Reveal>
      {sub ? (
        <Reveal delay={140}>
          <p className="mt-3 text-sm leading-7 text-zinc-500">{sub}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ---------------------------------- hero ----------------------------------- */

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section className="relative overflow-hidden bg-white bg-gold-radial">
      <div className="bg-dotgrid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]" />
      <div className="container-x relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:py-24">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white/80 px-4 py-1.5 text-[11px] font-extrabold text-gold-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
              </span>
              {content.badge}
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-6 text-[2rem] font-black leading-[1.3] tracking-tight text-ink-950 sm:text-5xl sm:leading-[1.25] lg:text-[3.4rem]">
              {content.title}{" "}
              <span className="text-gold-gradient">{content.highlight}</span>
              {content.titleAfter ? ` ${content.titleAfter}` : ""}
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-5 max-w-xl text-sm leading-8 text-zinc-500 sm:text-[15px]">
              {content.subtitle}
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={content.primaryCta.href} className="btn-gold">
                {content.primaryCta.label}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href={content.secondaryCta.href} className="btn-outline">
                {content.secondaryCta.label}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-10 flex items-center gap-8 border-t border-zinc-100 pt-7 sm:gap-12">
              {content.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-ink-950 tnum sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-zinc-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="relative mx-auto max-w-xl">
            <div className="animate-spin-slow absolute -top-10 -left-6 h-36 w-36 rounded-full border-2 border-dashed border-gold-200 sm:h-44 sm:w-44" />
            <div className="absolute -inset-3 rounded-[2.5rem] border border-gold-200/70" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.image}
              alt="پدیده تجارت الوند — قطعات یدکی اصلی خودرو"
              className="gold-ring relative aspect-[4/3] w-full rounded-[2rem] object-cover"
            />

            {/* کارت شناور ۱ */}
            <div className="animate-float absolute -right-3 top-8 flex items-center gap-3 overflow-hidden rounded-2xl border border-white/50 bg-white/30 p-3.5 shadow-[0_8px_32px_0_rgba(207,163,56,0.35)] backdrop-blur-xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(24px)_saturate(1.5)] dark:border-white/15 dark:bg-white/5 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] sm:-right-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent dark:from-white/10 dark:via-white/2" />
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gold-500 text-zinc-950">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="relative">
                <span className="block text-[13px] font-black text-ink-950 dark:text-zinc-50">
                  {content.floatCard1.title}
                </span>
                <span className="block text-[10px] font-bold text-zinc-600 dark:text-gold-300">
                  {content.floatCard1.desc}
                </span>
              </span>
            </div>

            {/* کارت شناور ۲ */}
            <div className="animate-float absolute -left-3 bottom-10 flex items-center gap-3 overflow-hidden rounded-2xl border border-white/50 bg-white/30 p-3.5 shadow-[0_8px_32px_0_rgba(207,163,56,0.35)] backdrop-blur-xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(24px)_saturate(1.5)] [animation-delay:1.2s] dark:border-white/15 dark:bg-white/5 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] sm:-left-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent dark:from-white/10 dark:via-white/2" />
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gold-500 text-zinc-950">
                <Truck className="h-5 w-5" />
              </span>
              <span className="relative">
                <span className="block text-[13px] font-black text-ink-950 dark:text-zinc-50">
                  {content.floatCard2.title}
                </span>
                <span className="block text-[10px] font-bold text-zinc-600 dark:text-gold-300">
                  {content.floatCard2.desc}
                </span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
/* --------------------------------- marquee --------------------------------- */

const BRANDS = [
  "BOSCH",
  "BREMBO",
  "NGK",
  "MANN-FILTER",
  "KYB",
  "VALEO",
  "CONTITECH",
  "TEXTAR",
  "VARTA",
  "ATE",
  "SKF",
  "GATES",
];

export function BrandMarquee() {
  const row = (key: string) => (
    <div key={key} className="flex w-max shrink-0 items-center">
      {BRANDS.map((b) => (
        <span key={`${key}-${b}`} className="flex items-center">
          <span
            className="px-7 text-lg font-black tracking-[0.18em] text-zinc-300 transition hover:text-gold-500 sm:text-xl"
            dir="ltr"
          >
            {b}
          </span>
          <Diamond className="h-2 w-2 fill-gold-400 text-gold-400" />
        </span>
      ))}
    </div>
  );
  return (
    <section className="border-y border-zinc-100 bg-white py-6" dir="ltr">
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_left,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee flex w-max">
          {row("a")}
          {row("b")}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- categories -------------------------------- */

export function CategoriesSection({
  categories,
}: {
  categories: (CategoryRow & { count: number })[];
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <SectionHead
          chip="دسته‌بندی قطعات"
          title="هر قطعه‌ای که خودروی شما نیاز دارد"
          sub="از سیستم ترمز تا برق و روشنایی؛ دسته‌بندی دقیق برای یافتن سریع‌تر قطعه موردنظر."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <Link
                href={`/products?cat=${c.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-zinc-100 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_22px_45px_-26px_rgba(120,84,39,0.4)]"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-gold-50/60">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : null}
                </div>
                <p className="text-[12px] font-extrabold text-ink-950 transition group-hover:text-gold-700 sm:text-[13px]">
                  {c.name}
                </p>
                <p className="mt-1 text-[10px] font-bold text-zinc-400 tnum">
                  {c.count} قلم کالا
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- features --------------------------------- */

const FEATURE_ICONS: Record<string, typeof ShieldCheck> = {
  shield: ShieldCheck,
  truck: Truck,
  wrench: Wrench,
  badge: BadgeCheck,
  headset: Headset,
  cog: Cog,
  spark: Sparkles,
  package: PackageCheck,
};

export function FeaturesSection({ content }: { content: FeaturesContent }) {
  return (
    <section className="relative overflow-hidden bg-gold-50/40 py-12 sm:py-16 lg:py-20 dark:bg-zinc-900/40">
      <div className="bg-dotgrid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
      <div className="container-x relative">
        <SectionHead
          chip="خدمات و مزایا"
          title={content.heading}
          sub={content.subheading}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {content.items.map((f, i) => {
            const Icon = FEATURE_ICONS[f.icon] ?? ShieldCheck;
            return (
              <Reveal key={`${f.title}-${i}`} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-zinc-100 bg-white p-3.5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_20px_40px_-20px_rgba(120,84,39,0.4)] sm:rounded-3xl sm:p-6 sm:text-right dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-600 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-zinc-950 sm:mx-0 sm:h-12 sm:w-12 sm:rounded-2xl">
                    <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </span>
                  <h3 className="mt-2.5 text-[12px] font-black text-ink-950 sm:mt-4 sm:text-[15px] dark:text-zinc-100">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[10px] leading-5 text-zinc-500 sm:mt-2 sm:text-[12.5px] sm:leading-6 dark:text-zinc-400">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- about ----------------------------------- */

export function AboutSection({ content }: { content: AboutContent }) {
  return (
    <section id="about" className="scroll-mt-28 py-16 sm:py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative mx-auto max-w-lg">
            <div className="absolute -inset-3 rounded-[2.5rem] border border-gold-200/70" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.image}
              alt="درباره پدیده تجارت الوند"
              loading="lazy"
              decoding="async"
              className="relative aspect-[4/3.4] w-full rounded-[2rem] object-cover shadow-[0_35px_70px_-35px_rgba(120,84,39,0.5)]"
            />
            {content.stats[0] ? (
              <div className="absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-ink-950 p-4 shadow-xl sm:right-10">
                <span className="text-2xl font-black text-gold-400 tnum">
                  {content.stats[0].value}
                </span>
                <span className="max-w-24 text-[10px] font-bold leading-4 text-zinc-300">
                  {content.stats[0].label}
                </span>
              </div>
            ) : null}
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHead
            chip={content.badge}
            title={content.heading}
            align="start"
          />
          <Reveal delay={120}>
            <p className="text-[15px] font-extrabold leading-7 text-gold-700">
              {content.lead}
            </p>
            <p className="mt-4 text-sm leading-8 text-zinc-500">
              {content.text}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {content.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-[13px] font-bold text-zinc-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-500" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-gold">
                مشاهده محصولات
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/#contact" className="btn-outline">
                مشاوره رایگان
              </Link>
            </div>
          </Reveal>
          {content.stats[1] ? (
            <Reveal delay={340}>
              <div className="mt-8 flex items-center gap-3 text-xs font-bold text-zinc-400">
                <span className="h-px w-10 bg-gold-300" />
                <span className="tnum">
                  {content.stats[1].value} {content.stats[1].label}
                </span>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- wholesale --------------------------------- */

export function WholesaleSection({ content }: { content: WholesaleContent }) {
  return (
    <section id="wholesale" className="scroll-mt-24 py-8 sm:py-12">
      <div className="container-x">
        <div className="group relative">
          {/* هاله طلایی-نارنجی پشت باکس */}
          <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-gold-400/10 via-orange-500/10 to-red-500/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100 dark:opacity-100" />

          {/* خط نورانی بالای باکس */}
          <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-l from-transparent via-gold-400/60 to-transparent" />

          {/* باکس اصلی */}
          <div className="relative rounded-[2rem] border border-gold-200 bg-gradient-to-br from-gold-100 via-gold-50 to-white p-5 sm:rounded-[2.5rem] sm:p-10 lg:p-14 dark:border-gold-700/40 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900">
            {/* الگوی نقطه‌ای */}
            <div className="bg-dotgrid pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] opacity-40 [mask-image:radial-gradient(50%_50%_at_85%_15%,black,transparent)] sm:rounded-[2.5rem] dark:opacity-60" />

            {/* گرادیانت درخشان گوشه بالا-راست */}
            <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl dark:bg-orange-500/20" />

            {/* گرادیانت درخشان گوشه پایین-چپ */}
            <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold-300/15 blur-3xl dark:bg-red-500/15" />

            <div className="relative grid items-start gap-10 lg:grid-cols-2">
              <div>
                <Reveal>
                  <span className="chip border-gold-300 bg-white/70 text-gold-700 dark:border-orange-500/40 dark:bg-orange-950/30 dark:text-orange-300">
                    <Diamond className="h-2.5 w-2.5 fill-gold-500 text-gold-500 dark:fill-orange-400 dark:text-orange-400" />
                    عمده‌فروشی
                  </span>
                  <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-ink-950 sm:text-3xl lg:text-4xl dark:text-zinc-50">
                    {content.heading}
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-8 text-zinc-600 dark:text-zinc-400">
                    {content.subheading}
                  </p>
                </Reveal>

                <Reveal delay={150}>
                  <ul className="mt-6 space-y-3">
                    {content.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-[13px] font-bold text-zinc-700 dark:text-zinc-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-600 dark:text-orange-400" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              <Reveal delay={120}>
                <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_35px_70px_-35px_rgba(120,84,39,0.5)] backdrop-blur sm:rounded-[1.75rem] sm:p-7 dark:border-zinc-700 dark:bg-zinc-900/90">
                  <WholesaleForm />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- faq ------------------------------------ */

export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="scroll-mt-28 py-16 sm:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionHead
            chip="سوالات متداول"
            title="پاسخ سوالات شما، شفاف و سریع"
            sub="پاسخ رایج‌ترین سوالات درباره اصالت کالا، ارسال، مرجوعی و خرید عمده را اینجا آورده‌ایم."
            align="start"
          />
        </div>
        <Reveal delay={120}>
          <FaqAccordion items={items} />
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- contact ---------------------------------- */

export function ContactSection({ content }: { content: ContactContent }) {
  const cards = [
    { icon: MapPin, title: "آدرس فروشگاه", value: content.address },
    {
      icon: Phone,
      title: "تلفن تماس",
      value: content.phones.join("  |  "),
      ltr: true,
    },
    { icon: Mail, title: "ایمیل", value: content.email, ltr: true },
    { icon: Clock3, title: "ساعت کاری", value: content.hours },
  ];
  return (
    <section id="contact" className="scroll-mt-28 pb-20 pt-4">
      <div className="container-x">
        <SectionHead
          chip="تماس با ما"
          title={content.heading}
          sub={content.note}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="group h-full rounded-3xl border border-zinc-100 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_26px_55px_-28px_rgba(120,84,39,0.4)]">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gold-100 text-gold-600 transition-colors group-hover:bg-gold-500 group-hover:text-zinc-950">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-black text-ink-950">
                  {c.title}
                </h3>
                <p
                  className="mt-2 text-[12.5px] font-bold leading-6 text-zinc-500"
                  dir={c.ltr ? "ltr" : undefined}
                >
                  {c.value}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
