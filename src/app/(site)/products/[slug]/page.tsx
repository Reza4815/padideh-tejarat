import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { ProductDetailView, type ProductDetailDto } from "@/components/site/product-detail";
import { ProductCardView } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug).catch(() => null);
  if (!data) return { title: "محصول" };
  return {
    title: data.product.name,
    description: data.product.shortDesc || data.product.name,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductBySlug(slug).catch(() => null);
  if (!data) notFound();

  const { product, category } = data;
  const related = await getRelatedProducts(product.categoryId, product.id, 4).catch(() => []);

  const dto: ProductDetailDto = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    partNumber: product.partNumber,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    shortDesc: product.shortDesc,
    description: product.description,
    benefits: product.benefits ?? [],
    specs: product.specs ?? [],
    compatibility: product.compatibility ?? [],
    images: product.images ?? [],
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
  };

  return (
    <div className="bg-gold-radial">
      <div className="container-x py-6 sm:py-10">
        <Reveal>
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-zinc-400">
            <Link href="/" className="transition hover:text-gold-700">
              خانه
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <Link href="/products" className="transition hover:text-gold-700">
              فروشگاه
            </Link>
            {category ? (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <Link href={`/products?cat=${category.slug}`} className="transition hover:text-gold-700">
                  {category.name}
                </Link>
              </>
            ) : null}
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="max-w-56 truncate text-zinc-600">{product.name}</span>
          </nav>
        </Reveal>

        <ProductDetailView product={dto} />

        {related.length > 0 ? (
          <section className="mt-16 border-t border-zinc-100 pt-12 sm:mt-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-gold-600">پیشنهاد مرتبط</p>
                <h2 className="mt-1.5 text-xl font-black tracking-tight text-ink-950 sm:text-2xl">
                  محصولات مشابه
                </h2>
              </div>
              {category ? (
                <Link href={`/products?cat=${category.slug}`} className="btn-outline hidden py-2.5 text-xs sm:inline-flex">
                  مشاهده بیشتر
                </Link>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 60}>
                  <ProductCardView product={p} />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
