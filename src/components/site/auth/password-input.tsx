"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordInput({
  label,
  name,
  autoComplete,
  minLength,
  placeholder = "••••••••",
  required = true,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
  placeholder?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-gold-500" />
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn("field h-12 pl-12 pr-10")}
          dir="ltr"
          style={{ textAlign: "right" }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-gold-700 dark:hover:bg-zinc-800 dark:hover:text-gold-400"
          aria-label={show ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
          aria-pressed={show}
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}