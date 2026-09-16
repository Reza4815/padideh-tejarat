import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// NOTE: منطق آپلود دقیقاً مشابه src/app/api/admin/upload/route.ts است
// (همان put به Vercel Blob) با این تفاوت‌ها:
// - بدون نیاز به لاگین ادمین (عمومی، برای رسید کارت‌به‌کارت مشتری)
// - حداکثر ۲ مگابایت و فقط jpg/png/webp
// - ذخیره در پوشه receipts/
// آپلود از سمت کلاینت با FormData انجام می‌شود تا درگیر سقف ۴.۵ مگابایتی
// بدنه‌ی Server Action نشود.

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "فایلی ارسال نشده است" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, error: "حجم رسید باید حداکثر ۲ مگابایت باشد" },
      { status: 400 },
    );
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "فقط فایل jpg/png/webp مجاز است" },
      { status: 400 },
    );
  }

  const name = `receipts/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const blob = await put(name, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ ok: true, url: blob.url });
}
