"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

type PaletteName = "gold" | "blue";

export function PaletteToggle() {
  const [palette, setPalette] = useState<PaletteName>("gold");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current =
      document.documentElement.getAttribute("data-palette") === "blue"
        ? "blue"
        : "gold";
    setPalette(current);
  }, []);

  const toggle = () => {
    const next: PaletteName = palette === "gold" ? "blue" : "gold";
    setPalette(next);
    document.documentElement.setAttribute("data-palette", next);
    try {
      localStorage.setItem("palette", next);
    } catch {}
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-gold-400 hover:text-gold-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      title={palette === "gold" ? "تغییر به تم آبی" : "تغییر به تم طلایی"}
    >
      <Palette className="h-4 w-4" />
      {palette === "gold" ? "طلایی" : "آبی"}
    </button>
  );
}
