import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { LoginForm } from "@/components/site/auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود به حساب کاربری",
  description: "ورود با شماره موبایل و رمز عبور.",
};

function safeRedirect(raw?: string) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

export default async function UserLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const user = await getCurrentUser().catch(() => null);
  const { redirect: redirectRaw } = await searchParams;
  const redirectTo = safeRedirect(redirectRaw);
  if (user) redirect(redirectTo);

  return (
    <div className="bg-gold-radial">
      <div className="container-x py-10 sm:py-16">
        <LoginForm redirect={redirectTo} />
      </div>
    </div>
  );
}
