"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SlideItem } from "@/lib/content";

export default function HeroSlider({ slides }: { slides: SlideItem[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPaused || safeSlides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused, safeSlides.length]);

  if (safeSlides.length === 0) return null;

  return (
    <div
      className={`relative transition-all duration-1000 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* هاله طلایی */}
      <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gold-400/8 blur-2xl" />

      {/* خط دور گرادیانت طلایی */}
      <div className="pointer-events-none absolute -inset-[1.5px] rounded-[1.75rem] bg-gradient-to-br from-gold-300 via-gold-500 to-gold-300 opacity-40" />

      {/* اسلایدر اصلی */}
      <section
        className="group relative w-full overflow-hidden rounded-[1.7rem] bg-zinc-50 dark:bg-black shadow-[0_20px_50px_-20px_rgba(207,163,56,0.4)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-20px_rgba(207,163,56,0.6)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="relative h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px]">
          {safeSlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === current
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0"
              }`}
            >
              {slide.image ? (
                <>
                  {/* موبایل: عکس موبایل (اگه هست) */}
                  {slide.mobileImage ? (
                    <picture>
                      <source
                        media="(max-width: 768px)"
                        srcSet={slide.mobileImage}
                      />
                      <Image
                        src={slide.image}
                        alt={slide.title || "slide"}
                        fill
                        priority={index === 0}
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        sizes="100vw"
                      />
                    </picture>
                  ) : (
                    <Image
                      src={slide.image}
                      alt={slide.title || "slide"}
                      fill
                      priority={index === 0}
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      sizes="100vw"
                    />
                  )}
                </>
              ) : null}

              {/* گرادیانت از راست */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />

              {/* محتوا - سمت راست */}
              <div className="absolute inset-0 flex flex-col justify-center items-start text-right px-6 sm:px-10 md:px-16 lg:px-24">
                <div className="max-w-[85%] sm:max-w-[60%] md:max-w-[55%] lg:max-w-[50%]">
                  {slide.title ? (
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight">
                      {slide.title}
                    </h3>
                  ) : null}
                  {slide.subtitle ? (
                    <p className="text-sm sm:text-base md:text-lg text-gray-100 mb-5 md:mb-7 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-7">
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
            </div>
          ))}
        </div>

        {safeSlides.length > 1 ? (
          <>
            <button
              onClick={prev}
              aria-label="اسلاید قبلی"
              className="absolute top-1/2 right-3 sm:right-5 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-amber-500 hover:text-black hover:scale-110"
            >
              ›
            </button>

            <button
              onClick={next}
              aria-label="اسلاید بعدی"
              className="absolute top-1/2 left-3 sm:left-5 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-amber-500 hover:text-black hover:scale-110"
            >
              ‹
            </button>

            <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {safeSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`رفتن به اسلاید ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-gold-500 w-7 shadow-[0_0_12px_rgba(207,163,56,0.8)]"
                      : "bg-white/60 w-1.5 hover:bg-white/90"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
