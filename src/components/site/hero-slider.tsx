"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, isPaused, safeSlides.length]);

  if (safeSlides.length === 0) return null;

  const textItem = (visible: boolean) =>
    [
      "transition-all duration-300 ease-out motion-reduce:transition-none",
      visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6",
    ].join(" ");

  const textDelay = (visible: boolean, delay: number) => ({
    transitionDelay: `${visible ? delay : 0}ms`,
  });

  return (
    <div
      className={`relative mb-2 w-full transition-all duration-1000 ease-out sm:mb-4 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <section
        className="group relative w-full shrink-0 overflow-hidden rounded-3xl border-2 border-gold-500/40 bg-zinc-50 shadow-[0_20px_50px_-20px_rgba(207,163,56,0.4)] transition-all duration-500 hover:border-gold-500/70 hover:shadow-[0_30px_70px_-20px_rgba(207,163,56,0.6)] dark:bg-black"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="relative h-[280px] w-full sm:h-[340px] md:h-[400px] lg:h-[460px] xl:h-[520px]">
          {safeSlides.map((slide, index) => {
            const active = index === current;
            const visible = isLoaded && active;

            return (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  active
                    ? "z-10 opacity-100"
                    : "z-0 opacity-0 pointer-events-none"
                }`}
                aria-hidden={!active}
              >
                {/* تصویر */}
                {slide.image ? (
                  slide.mobileImage ? (
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
                        sizes="100vw"
                        className={`object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${
                          active ? "scale-100" : "scale-105"
                        }`}
                      />
                    </picture>
                  ) : (
                    <Image
                      src={slide.image}
                      alt={slide.title || "slide"}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className={`object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${
                        active ? "scale-100" : "scale-105"
                      }`}
                    />
                  )
                ) : null}

                {/* گرادیانت‌ها */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent" />

                {/* محتوا */}
                <div
                  dir="rtl"
                  className="absolute inset-0 flex flex-col items-start justify-center px-14 sm:px-20 lg:px-24"
                >
                  <div className="w-full max-w-[92%] text-right sm:max-w-[70%] lg:max-w-[55%]">
                    <span
                      style={textDelay(visible, 0)}
                      className={`${textItem(visible)} inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-white/10 px-3.5 py-1.5 text-[10px] font-extrabold text-gold-200 backdrop-blur-md sm:text-[11px]`}
                    >
                      <Sparkles className="h-3 w-3" />
                      پدیده تجارت الوند
                    </span>

                    {slide.title ? (
                      <h3
                        style={textDelay(visible, 120)}
                        className={`${textItem(visible)} mt-4 text-xl font-black leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.75)] sm:text-3xl md:text-4xl lg:text-5xl`}
                      >
                        {slide.title}
                      </h3>
                    ) : null}

                    {slide.subtitle ? (
                      <p
                        style={textDelay(visible, 220)}
                        className={`${textItem(visible)} mt-3 text-sm font-medium leading-7 text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)] sm:mt-4 sm:text-base md:text-lg`}
                      >
                        {slide.subtitle}
                      </p>
                    ) : null}

                    {slide.cta && slide.link ? (
                      <div
                        style={textDelay(visible, 320)}
                        className={textItem(visible)}
                      >
                        <Link
                          href={slide.link}
                          className="group/cta mt-5 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-extrabold text-zinc-950 shadow-[0_18px_35px_-15px_rgba(207,163,56,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_24px_45px_-15px_rgba(207,163,56,1)] active:translate-y-0 sm:mt-6 sm:px-6 sm:py-3 sm:text-sm md:text-base"
                        >
                          {slide.cta}
                          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-x-1 sm:h-4 sm:w-4" />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {safeSlides.length > 1 ? (
          <>
            {/* دکمه قبلی */}
            <button
              type="button"
              onClick={prev}
              aria-label="اسلاید قبلی"
              className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/5 text-white shadow-lg shadow-black/40 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:scale-110 hover:border-gold-400 hover:bg-gold-500 hover:text-zinc-950 active:scale-95 sm:right-4 sm:h-10 sm:w-10 dark:border-white/30 dark:bg-white/5 dark:text-white dark:backdrop-blur-2xl dark:backdrop-saturate-150 dark:hover:border-gold-400 dark:hover:bg-gold-500 dark:hover:text-white"
            >
              <ChevronRight
                className="h-4 w-4 sm:h-5 sm:w-5"
                strokeWidth={2.5}
              />
            </button>

            {/* دکمه بعدی */}
            <button
              type="button"
              onClick={next}
              aria-label="اسلاید بعدی"
              className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/5 text-white shadow-lg shadow-black/40 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:scale-110 hover:border-gold-400 hover:bg-gold-500 hover:text-zinc-950 active:scale-95 sm:left-4 sm:h-10 sm:w-10 dark:border-white/30 dark:bg-white/5 dark:text-white dark:backdrop-blur-2xl dark:backdrop-saturate-150 dark:hover:border-gold-400 dark:hover:bg-gold-500 dark:hover:text-white"
            >
              <ChevronLeft
                className="h-4 w-4 sm:h-5 sm:w-5"
                strokeWidth={2.5}
              />
            </button>

            {/* نشانگرها */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {safeSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`رفتن به اسلاید ${i + 1}`}
                  aria-current={i === current}
                  className={`h-2 rounded-full transition-all duration-300 ease-out ${
                    i === current
                      ? "w-7 bg-gold-500 shadow-[0_0_12px_rgba(207,163,56,0.85)]"
                      : "w-2 bg-white/40 hover:bg-white/70"
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
