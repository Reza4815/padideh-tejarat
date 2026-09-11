import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await getSessionAdmin().catch(() => null);
  if (!admin) redirect("/admin/login");
  return <AdminShell username={admin.username}>{children}</AdminShell>;
}
