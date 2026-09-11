import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import { Logo } from "@/components/site/header";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ورود مدیران" };

export default async function AdminLoginPage() {
  const admin = await getSessionAdmin().catch(() => null);
  if (admin) redirect("/admin");

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-white bg-gold-radial px-4">
      <div className="bg-dotgrid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(55%_55%_at_50%_40%,black,transparent)]" />
      <div className="relative w-full max-w-md">
        <div className="rounded-[2rem] border border-zinc-100 bg-white/90 p-8 shadow-[0_40px_80px_-40px_rgba(120,84,39,0.5)] backdrop-blur sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Logo />
            <div>
              <h1 className="text-lg font-black text-ink-950">پنل مدیریت فروشگاه</h1>
              <p className="mt-1 text-xs text-zinc-400">برای ادامه وارد حساب مدیریت شوید</p>
            </div>
          </div>
          <LoginForm />
        </div>
        <p className="mt-5 text-center text-[10px] font-bold text-zinc-400" dir="ltr">
          PADIDEH TEJARAT ALVAND — ADMIN PANEL
        </p>
      </div>
    </main>
  );
}
