import Link from "next/link";
import HeroSlider from "@/components/site/hero-slider";
import { ArrowLeft } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { listCategories, listProductCards } from "@/lib/data";
import {
  AboutSection,
  BrandMarquee,
  CategoriesSection,
  ContactSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  SectionHead,
  WholesaleSection,
} from "@/components/site/home-sections";
import { ProductCardView } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    hero,
    slider,
    features,
    about,
    faq,
    contact,
    wholesale,
    categories,
    featured,
  ] = await Promise.all([
    getSiteContent("hero"),
    getSiteContent("slider"),
    getSiteContent("features"),
    getSiteContent("about"),
    getSiteContent("faq"),
    getSiteContent("contact"),
    getSiteContent("wholesale"),
    listCategories().catch(() => []),
    listProductCards({ featured: true, limit: 8 }).catch(() => ({
      items: [],
      total: 0,
    })),
  ]);

  const featuredItems = featured.items.length > 0 ? featured.items : [];

  return (
    <>
      <HeroSection content={hero} />

      <div className="container-x mt-6 sm:mt-8">
        <HeroSlider slides={slider.slides} />
      </div>

      <BrandMarquee />

      <section className="pb-4 pt-10 sm:pb-8 sm:pt-14">
        <div className="container-x">
          <div className="flex items-end justify-between gap-4">
            <SectionHead
              chip="منتخب فروشگاه"
              title="قطعات پیشنهادی این هفته"
              align="start"
            />
            <Reveal delay={150} className="mb-10 hidden sm:block">
              <Link
                href="/products"
                className="btn-outline whitespace-nowrap py-2.5 text-xs"
              >
                مشاهده همه محصولات
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>

          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {featuredItems.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 70}>
                  <ProductCardView product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-zinc-400">
              محصولی برای نمایش وجود ندارد.
            </p>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-outline py-2.5 text-xs">
              مشاهده همه محصولات
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <CategoriesSection categories={categories} />

      <FeaturesSection content={features} />

      <AboutSection content={about} />

      <WholesaleSection content={wholesale} />

      <FaqSection items={faq} />

      <ContactSection content={contact} />
    </>
  );
}
