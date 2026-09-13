"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SlideItem } from "@/lib/content";

function SlideContent({ slide }: { slide: SlideItem }) {
  const [isLight, setIsLight] = useState<boolean | null>(null);

  useEffect(() => {
    if (!slide.image) return;
    setIsLight(null);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = slide.image;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // فقط سمت راست تصویر رو تحلیل کن (جایی که متن قرار می‌گیره)
        ctx.drawImage(
          img,
          img.width * 0.5,
          0,
          img.width * 0.5,
          img.height,
          0,
          0,
          size,
          size,
        );

        const data = ctx.getImageData(0, 0, size, size).data;
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += r * 0.299 + g * 0.587 + b * 0.114;
        }
        const avgBrightness = totalBrightness / (size * size);

        // اگه روشنایی بالای ۱۳۰ بود، یعنی عکس روشنه
        setIsLight(avgBrightness > 130);
      } catch {
        setIsLight(false);
      }
    };

    img.onerror = () => setIsLight(false);
  }, [slide.image]);

  const textColor = isLight === true ? "text-black" : "text-white";
  const shadowStyle =
    isLight === true
      ? "drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]"
      : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]";

  return (
    <>
      {/* اگه عکس روشن بود، یه لایه تیره ملایم پشت متن */}
      {isLight === true && (
        <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/15 to-transparent" />
      )}

      <div className="absolute inset-0 flex flex-col justify-center items-start text-right px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="max-w-[85%] sm:max-w-[60%] md:max-w-[55%] lg:max-w-[50%]">
          {slide.title ? (
            <h3
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight transition-colors duration-300 ${textColor} ${shadowStyle}`}
            >
              {slide.title}
            </h3>
          ) : null}
          {slide.subtitle ? (
            <p
              className={`text-sm sm:text-base md:text-lg mb-5 md:mb-7 leading-7 transition-colors duration-300 ${textColor} ${shadowStyle}`}
            >
              {slide.subtitle}
            </p>
          ) : null}
          {slide.cta && slide.link ? (
            <Link
              href={slide.link}
              className="inline-block rounded-full bg-amber-500 px-6 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base font-bold text-black hover:bg-amber-400 transition shadow-lg"
            >
              {slide.cta}
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default function HeroSlider({ slides }: { slides: SlideItem[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeSlides = slides && slides.length > 0 ? slides : [];

  const next = useCallback(() => {
    if (safeSlides.length === 0) return;
    setCurrent((prev) => (prev + 1) % safeSlides.length);
  }, [safeSlides.length]);

  const prev = useCallback(() => {
    if (safeSlides.length === 0) return;
    setCurrent((prev) => (prev - 1 + safeSlides.length) % safeSlides.length);
  }, [safeSlides.length]);

  useEffect(() => {
    if (isPaused || safeSlides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused, safeSlides.length]);

  if (safeSlides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 shadow-sm dark:shadow-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative h-[420px] sm:h-[420px] md:h-[460px] lg:h-[520px]">
        {safeSlides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.title || "slide"}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
              />
            ) : null}

            <SlideContent slide={slide} />
          </div>
        ))}
      </div>

      {safeSlides.length > 1 ? (
        <>
          <button
            onClick={prev}
            aria-label="اسلاید قبلی"
            className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/20 dark:bg-black/40 text-white hover:bg-amber-500 hover:text-black transition backdrop-blur"
          >
            ›
          </button>

          <button
            onClick={next}
            aria-label="اسلاید بعدی"
            className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/20 dark:bg-black/40 text-white hover:bg-amber-500 hover:text-black transition backdrop-blur"
          >
            ‹
          </button>

          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {safeSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`رفتن به اسلاید ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "bg-amber-500 w-8" : "bg-white/50 w-2"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
