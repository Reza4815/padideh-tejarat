import { getSessionAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "تنظیمات" };

export default async function AdminSettingsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-ink-950">تنظیمات حساب مدیریت</h1>
        <p className="mt-1 text-xs text-zinc-400">نام کاربری و رمز عبور پنل را تغییر دهید</p>
      </div>
      <SettingsForm username={admin.username} />
    </div>
  );
}
