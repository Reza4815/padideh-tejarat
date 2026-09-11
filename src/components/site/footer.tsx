import Link from "next/link";
import { AtSign, Clock, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import type { CategoryRow } from "@/db/schema";
import type { ContactContent, FooterContent } from "@/lib/content";
import { Logo } from "@/components/site/header";

export function Footer({
  contact,
  footer,
  categories,
}: {
  contact: ContactContent;
  footer: FooterContent;
  categories: Pick<CategoryRow, "name" | "slug">[];
}) {
  return (
    <footer className="border-t border-gold-100 bg-gradient-to-b from-white to-gold-50/60">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-[13px] leading-7 text-zinc-500">{footer.about}</p>
          <div className="mt-5 flex items-center gap-2">
            {[
              { icon: AtSign, label: "اینستاگرام" },
              { icon: Send, label: "تلگرام" },
              { icon: MessageCircle, label: "واتساپ" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:border-gold-400 hover:text-gold-600"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black text-ink-950">دسترسی سریع</h4>
          <ul className="space-y-2.5 text-[13px] font-bold text-zinc-500">
            {[
              { label: "خانه", href: "/" },
              { label: "فروشگاه قطعات", href: "/products" },
              { label: "عمده‌فروشی", href: "/#wholesale" },
              { label: "درباره ما", href: "/#about" },
              { label: "سوالات متداول", href: "/#faq" },
              { label: "تماس با ما", href: "/#contact" },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="inline-flex items-center gap-2 transition hover:text-gold-700">
                  <span className="h-1 w-1 rounded-full bg-gold-400" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black text-ink-950">دسته‌بندی‌ها</h4>
          <ul className="space-y-2.5 text-[13px] font-bold text-zinc-500">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products?cat=${c.slug}`}
                  className="inline-flex items-center gap-2 transition hover:text-gold-700"
                >
                  <span className="h-1 w-1 rounded-full bg-gold-400" />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black text-ink-950">اطلاعات تماس</h4>
          <ul className="space-y-3.5 text-[13px] text-zinc-500">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span className="leading-6">{contact.address}</span>
            </li>
            {contact.phones.slice(0, 2).map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                <span className="tnum font-bold text-zinc-600" dir="ltr">{p}</span>
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-gold-500" />
              <span>{footer.hours}</span>
            </li>
            <li className="flex items-center gap-2.5 rounded-xl border border-gold-200 bg-gold-50 p-3 text-[11px] font-bold text-gold-800">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              تمامی قطعات دارای ضمانت اصالت کالا هستند
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-ink-950">
        <div className="container-x flex h-11 flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <p>{footer.note}</p>
          <div className="flex items-center gap-4">
            <span dir="ltr" className="font-bold tracking-widest">PADIDEH TEJARAT ALVAND</span>
            <Link href="/admin" className="transition hover:text-gold-400">
              ورود مدیران
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
