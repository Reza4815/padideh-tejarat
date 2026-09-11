import { getAllSiteContent } from "@/lib/content";
import { ensureSeed } from "@/lib/data";
import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "محتوای سایت" };

export default async function AdminContentPage() {
  await ensureSeed();
  const content = await getAllSiteContent();
  return <ContentEditor initial={content} />;
}
