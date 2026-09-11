"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import {
  CircleHelp,
  FileText,
  Footprints,
  ImagePlus,
  Info,
  Loader2,
  Megaphone,
  Phone,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ContentMap, FaqItem, Stat } from "@/lib/content";
import { saveContent } from "@/app/admin/actions";
import { SaveBar } from "@/components/admin/table-widgets";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "hero", label: "هیرو", icon: Megaphone },
  { key: "features", label: "مزایا و خدمات", icon: Sparkles },
  { key: "about", label: "درباره ما", icon: Info },
  { key: "wholesale", label: "عمده‌فروشی", icon: FileText },
  { key: "faq", label: "سوالات متداول", icon: CircleHelp },
  { key: "contact", label: "تماس با ما", icon: Phone },
  { key: "footer", label: "فوتر", icon: Footprints },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ------------------------------ small ui parts ----------------------------- */

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "آپلود ناموفق بود");
      onChange(data.url);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "آپلود ناموفق بود");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-zinc-200 bg-gold-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-4 w-4 text-gold-300" />
        )}
      </div>
      <input className="field flex-1 text-[11px]" value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" style={{ textAlign: "left" }} placeholder="/img/hero.jpg" />
      <label className="btn-outline shrink-0 cursor-pointer px-3.5 py-2.5 text-[11px]">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        آپلود
        <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={busy} />
      </label>
      {err && <span className="text-[10px] font-bold text-red-500">{err}</span>}
    </div>
  );
}

function StringList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className="field"
            value={it}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, xi) => (xi === i ? e.target.value : x)))}
          />
          <button
            onClick={() => onChange(items.filter((_, xi) => xi !== i))}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-300 hover:bg-red-50 hover:text-red-500"
            aria-label="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="btn-outline px-3.5 py-1.5 text-[11px]">
        <Plus className="h-3.5 w-3.5" />
        افزودن مورد
      </button>
    </div>
  );
}

function StatsEditor({ stats, onChange }: { stats: Stat[]; onChange: (v: Stat[]) => void }) {
  return (
    <div className="space-y-2">
      {stats.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
          <input className="field" value={s.value} placeholder="+۱۵" onChange={(e) => onChange(stats.map((x, xi) => (xi === i ? { ...x, value: e.target.value } : x)))} />
          <input className="field" value={s.label} placeholder="سال تجربه" onChange={(e) => onChange(stats.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)))} />
          <button onClick={() => onChange(stats.filter((_, xi) => xi !== i))} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 hover:bg-red-50 hover:text-red-500" aria-label="حذف">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...stats, { value: "", label: "" }])} className="btn-outline px-3.5 py-1.5 text-[11px]">
        <Plus className="h-3.5 w-3.5" />
        افزودن آمار
      </button>
    </div>
  );
}

const ICON_OPTIONS = [
  { value: "shield", label: "سپر — گارانتی" },
  { value: "truck", label: "کامیون — ارسال" },
  { value: "wrench", label: "آچار — فنی" },
  { value: "badge", label: "نشان — قیمت/کیفیت" },
  { value: "headset", label: "هدست — پشتیبانی" },
  { value: "cog", label: "چرخ‌دنده — قطعات" },
  { value: "spark", label: "جرقه — ویژه" },
  { value: "package", label: "بسته — تحویل" },
];

/* --------------------------------- editor ---------------------------------- */

export function ContentEditor({ initial }: { initial: ContentMap }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("hero");

  const [hero, setHero] = useState(initial.hero);
  const [features, setFeatures] = useState(initial.features);
  const [about, setAbout] = useState(initial.about);
  const [wholesale, setWholesale] = useState(initial.wholesale);
  const [faq, setFaq] = useState<FaqItem[]>(initial.faq);
  const [contact, setContact] = useState(initial.contact);
  const [footer, setFooter] = useState(initial.footer);

  const [saving, startSaving] = useTransition();
  const [savedTab, setSavedTab] = useState("");
  const [err, setErr] = useState("");

  function save(key: TabKey) {
    setErr("");
    setSavedTab("");
    const payload: Record<TabKey, unknown> = { hero, features, about, wholesale, faq, contact, footer };
    startSaving(async () => {
      try {
        await saveContent(key, payload[key]);
        setSavedTab(key);
        router.refresh();
      } catch {
        setErr("ذخیره ناموفق بود");
      }
    });
  }

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h1 className="text-xl font-black text-ink-950">محتوای سایت</h1>
        <p className="mt-1 text-xs text-zinc-400">
          متن‌ها، تصاویر و بخش‌های صفحه اصلی را بدون دست‌زدن به کد ویرایش کنید
        </p>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-extrabold transition",
              tab === t.key
                ? "border-gold-500 bg-gold-500 text-zinc-950 shadow-[0_8px_18px_-8px_rgba(207,163,56,0.8)]"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-gold-300 hover:text-gold-700",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600">{err}</p>}

      {tab === "hero" && (
        <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-black text-ink-950">بخش هیرو (تصویر اول صفحه اصلی)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="متن نشان بالای تیتر">
              <input className="field" value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
            </F>
            <F label="تصویر هیرو">
              <ImageField value={hero.image} onChange={(v) => setHero({ ...hero, image: v })} />
            </F>
            <F label="تیتر — بخش اول">
              <input className="field" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
            </F>
            <F label="تیتر — بخش طلایی">
              <input className="field" value={hero.highlight} onChange={(e) => setHero({ ...hero, highlight: e.target.value })} />
            </F>
            <F label="تیتر — ادامه">
              <input className="field" value={hero.titleAfter} onChange={(e) => setHero({ ...hero, titleAfter: e.target.value })} />
            </F>
            <div className="sm:col-span-2">
              <F label="زیرتیتر">
                <textarea className="field min-h-20" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
              </F>
            </div>
            <F label="دکمه اصلی — متن">
              <input className="field" value={hero.primaryCta.label} onChange={(e) => setHero({ ...hero, primaryCta: { ...hero.primaryCta, label: e.target.value } })} />
            </F>
            <F label="دکمه اصلی — لینک">
              <input className="field" value={hero.primaryCta.href} onChange={(e) => setHero({ ...hero, primaryCta: { ...hero.primaryCta, href: e.target.value } })} dir="ltr" style={{ textAlign: "right" }} />
            </F>
            <F label="دکمه دوم — متن">
              <input className="field" value={hero.secondaryCta.label} onChange={(e) => setHero({ ...hero, secondaryCta: { ...hero.secondaryCta, label: e.target.value } })} />
            </F>
            <F label="دکمه دوم — لینک">
              <input className="field" value={hero.secondaryCta.href} onChange={(e) => setHero({ ...hero, secondaryCta: { ...hero.secondaryCta, href: e.target.value } })} dir="ltr" style={{ textAlign: "right" }} />
            </F>
            <div className="sm:col-span-2">
              <F label="آمارهای هیرو">
                <StatsEditor stats={hero.stats} onChange={(v) => setHero({ ...hero, stats: v })} />
              </F>
            </div>
            <F label="کارت شناور ۱ — عنوان">
              <input className="field" value={hero.floatCard1.title} onChange={(e) => setHero({ ...hero, floatCard1: { ...hero.floatCard1, title: e.target.value } })} />
            </F>
            <F label="کارت شناور ۱ — توضیح">
              <input className="field" value={hero.floatCard1.desc} onChange={(e) => setHero({ ...hero, floatCard1: { ...hero.floatCard1, desc: e.target.value } })} />
            </F>
            <F label="کارت شناور ۲ — عنوان">
              <input className="field" value={hero.floatCard2.title} onChange={(e) => setHero({ ...hero, floatCard2: { ...hero.floatCard2, title: e.target.value } })} />
            </F>
            <F label="کارت شناور ۲ — توضیح">
              <input className="field" value={hero.floatCard2.desc} onChange={(e) => setHero({ ...hero, floatCard2: { ...hero.floatCard2, desc: e.target.value } })} />
            </F>
          </div>
          <SaveBar saving={saving} saved={savedTab === "hero"} onSave={() => save("hero")} />
        </section>
      )}

      {tab === "features" && (
        <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-black text-ink-950">بخش مزایا و خدمات</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="تیتر بخش">
              <input className="field" value={features.heading} onChange={(e) => setFeatures({ ...features, heading: e.target.value })} />
            </F>
            <F label="زیرتیتر">
              <input className="field" value={features.subheading} onChange={(e) => setFeatures({ ...features, subheading: e.target.value })} />
            </F>
          </div>
          <div className="mt-5 space-y-3">
            {features.items.map((f, i) => (
              <div key={i} className="grid items-center gap-2 rounded-xl border border-zinc-100 p-3 sm:grid-cols-[180px_1fr_2fr_auto]">
                <select className="field" value={f.icon} onChange={(e) => setFeatures({ ...features, items: features.items.map((x, xi) => (xi === i ? { ...x, icon: e.target.value } : x)) })}>
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <input className="field" value={f.title} placeholder="عنوان" onChange={(e) => setFeatures({ ...features, items: features.items.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)) })} />
                <input className="field" value={f.desc} placeholder="توضیح کوتاه" onChange={(e) => setFeatures({ ...features, items: features.items.map((x, xi) => (xi === i ? { ...x, desc: e.target.value } : x)) })} />
                <button onClick={() => setFeatures({ ...features, items: features.items.filter((_, xi) => xi !== i) })} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 hover:bg-red-50 hover:text-red-500" aria-label="حذف">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setFeatures({ ...features, items: [...features.items, { icon: "shield", title: "", desc: "" }] })}
              className="btn-outline px-3.5 py-1.5 text-[11px]"
            >
              <Plus className="h-3.5 w-3.5" />
              افزودن مزیت
            </button>
          </div>
          <SaveBar saving={saving} saved={savedTab === "features"} onSave={() => save("features")} />
        </section>
      )}

      {tab === "about" && (
        <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-black text-ink-950">بخش درباره ما</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="نشان">
              <input className="field" value={about.badge} onChange={(e) => setAbout({ ...about, badge: e.target.value })} />
            </F>
            <F label="تیتر">
              <input className="field" value={about.heading} onChange={(e) => setAbout({ ...about, heading: e.target.value })} />
            </F>
            <div className="sm:col-span-2">
              <F label="جمله برجسته">
                <input className="field" value={about.lead} onChange={(e) => setAbout({ ...about, lead: e.target.value })} />
              </F>
            </div>
            <div className="sm:col-span-2">
              <F label="متن اصلی">
                <textarea className="field min-h-28" value={about.text} onChange={(e) => setAbout({ ...about, text: e.target.value })} />
              </F>
            </div>
            <F label="تصویر">
              <ImageField value={about.image} onChange={(v) => setAbout({ ...about, image: v })} />
            </F>
            <F label="آمارها">
              <StatsEditor stats={about.stats} onChange={(v) => setAbout({ ...about, stats: v })} />
            </F>
            <div className="sm:col-span-2">
              <F label="نکات کلیدی">
                <StringList items={about.bullets} onChange={(v) => setAbout({ ...about, bullets: v })} placeholder="مثلاً: تامین مستقیم از واردکننده" />
              </F>
            </div>
          </div>
          <SaveBar saving={saving} saved={savedTab === "about"} onSave={() => save("about")} />
        </section>
      )}

      {tab === "wholesale" && (
        <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-black text-ink-950">بخش عمده‌فروشی</h2>
          <div className="grid gap-4">
            <F label="تیتر">
              <input className="field" value={wholesale.heading} onChange={(e) => setWholesale({ ...wholesale, heading: e.target.value })} />
            </F>
            <F label="توضیح">
              <textarea className="field min-h-20" value={wholesale.subheading} onChange={(e) => setWholesale({ ...wholesale, subheading: e.target.value })} />
            </F>
            <F label="مزایا">
              <StringList items={wholesale.bullets} onChange={(v) => setWholesale({ ...wholesale, bullets: v })} placeholder="مثلاً: لیست قیمت اختصاصی همکاران" />
            </F>
          </div>
          <SaveBar saving={saving} saved={savedTab === "wholesale"} onSave={() => save("wholesale")} />
        </section>
      )}

      {tab === "faq" && (
        <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-black text-ink-950">سوالات متداول</h2>
          <div className="space-y-3">
            {faq.map((f, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-zinc-100 p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold-50 text-[11px] font-black text-gold-600 tnum">{i + 1}</span>
                  <input className="field" value={f.q} placeholder="سوال" onChange={(e) => setFaq(faq.map((x, xi) => (xi === i ? { ...x, q: e.target.value } : x)))} />
                  <button onClick={() => setFaq(faq.filter((_, xi) => xi !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-300 hover:bg-red-50 hover:text-red-500" aria-label="حذف">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea className="field min-h-16" value={f.a} placeholder="پاسخ" onChange={(e) => setFaq(faq.map((x, xi) => (xi === i ? { ...x, a: e.target.value } : x)))} />
              </div>
            ))}
            <button onClick={() => setFaq([...faq, { q: "", a: "" }])} className="btn-outline px-3.5 py-1.5 text-[11px]">
              <Plus className="h-3.5 w-3.5" />
              افزودن سوال
            </button>
          </div>
          <SaveBar saving={saving} saved={savedTab === "faq"} onSave={() => save("faq")} />
        </section>
      )}

      {tab === "contact" && (
        <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-black text-ink-950">اطلاعات تماس</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="تیتر بخش">
              <input className="field" value={contact.heading} onChange={(e) => setContact({ ...contact, heading: e.target.value })} />
            </F>
            <F label="ایمیل">
              <input className="field" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} dir="ltr" style={{ textAlign: "right" }} />
            </F>
            <div className="sm:col-span-2">
              <F label="آدرس">
                <input className="field" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
              </F>
            </div>
            <F label="ساعت کاری">
              <input className="field" value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} />
            </F>
            <F label="توضیح کوتاه (زیر تیتر)">
              <input className="field" value={contact.note} onChange={(e) => setContact({ ...contact, note: e.target.value })} />
            </F>
            <div className="sm:col-span-2">
              <F label="شماره‌های تماس">
                <StringList items={contact.phones} onChange={(v) => setContact({ ...contact, phones: v })} placeholder="۰۲۱-..." />
              </F>
            </div>
          </div>
          <SaveBar saving={saving} saved={savedTab === "contact"} onSave={() => save("contact")} />
        </section>
      )}

      {tab === "footer" && (
        <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-black text-ink-950">فوتر سایت</h2>
          <div className="grid gap-4">
            <F label="متن معرفی فروشگاه">
              <textarea className="field min-h-20" value={footer.about} onChange={(e) => setFooter({ ...footer, about: e.target.value })} />
            </F>
            <F label="ساعت کاری (نمایش در فوتر)">
              <input className="field" value={footer.hours} onChange={(e) => setFooter({ ...footer, hours: e.target.value })} />
            </F>
            <F label="متن کپی‌رایت">
              <input className="field" value={footer.note} onChange={(e) => setFooter({ ...footer, note: e.target.value })} />
            </F>
          </div>
          <SaveBar saving={saving} saved={savedTab === "footer"} onSave={() => save("footer")} />
        </section>
      )}
    </div>
  );
}
