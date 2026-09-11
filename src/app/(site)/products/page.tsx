import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { listBrands, listCategories, listProductCards } from "@/lib/data";
import { ShopFilters } from "@/components/site/shop-filters";
import { ProductCardView } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { toFaDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "فروشگاه قطعات",
  description: "خرید قطعات یدکی اصلی خودرو با ضمانت اصالت کالا — ترمز، تعلیق، موتور، فیلتر، برق و روشنایی.",
};

type SP = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined) {
  return typeof v === "string" ? v : "";
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const cat = one(sp.cat).trim();
  const brand = one(sp.brand).trim();
  const sortRaw = one(sp.sort).trim();
  const sort = sortRaw === "price-asc" || sortRaw === "price-desc" ? sortRaw : "newest";
  const inStock = one(sp.stock) === "1";

  const [{ items, total }, categories, brands] = await Promise.all([
    listProductCards({ q, cat, brand, sort, inStock }),
    listCategories(),
    listBrands(),
  ]);

  const activeCat = categories.find((c) => c.slug === cat);

  return (
    <div className="bg-gold-radial">
      <div className="container-x py-8 sm:py-10">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold text-gold-600">فروشگاه قطعات یدکی</p>
              <h1 className="mt-1.5 text-2xl font-black tracking-tight text-ink-950 sm:text-3xl">
                {activeCat ? activeCat.name : q ? `نتایج جستجو برای «${q}»` : "همه محصولات"}
              </h1>
            </div>
            <p className="text-xs font-bold text-zinc-400 tnum">{toFaDigits(total)} کالا یافت شد</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <ShopFilters
            initial={{ q, cat, brand, sort, inStock }}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: c.count }))}
            brands={brands}
          />
        </Reveal>

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-zinc-200 bg-white py-20 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gold-50 text-gold-400">
              <PackageSearch className="h-7 w-7" />
            </span>
            <p className="text-sm font-extrabold text-zinc-700">کالایی با این مشخصات یافت نشد</p>
            <p className="max-w-sm text-xs leading-6 text-zinc-400">
              عبارت دیگری را جستجو کنید یا فیلترها را تغییر دهید. اگر قطعه خاصی مدنظر دارید، کد OEM
              آن را جستجو کنید.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 60}>
                <ProductCardView product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
