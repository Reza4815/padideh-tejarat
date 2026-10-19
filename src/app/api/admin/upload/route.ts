import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "فایلی ارسال نشده است" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "حجم فایل بیش از ۴ مگابایت است" },
      { status: 400 },
    );
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "فرمت تصویر مجاز نیست" },
      { status: 400 },
    );
  }

  const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  // ✅ مسیر جدید: storage/uploads/products (بیرون از public)
  const uploadDir = path.join(process.cwd(), "storage", "uploads", "products");
  const filePath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(filePath, buffer);

  // ✅ URL از /uploads/... استفاده می‌کنه که route جدید سروش می‌کنه
  const url = `/uploads/products/${filename}`;

  return NextResponse.json({ ok: true, url });
}
