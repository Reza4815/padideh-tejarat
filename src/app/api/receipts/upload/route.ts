import { NextResponse } from "next/server";
import { Client } from "basic-ftp";
import { Readable } from "stream";

// NOTE: منطق آپلود دقیقاً مشابه src/app/api/admin/upload/route.ts است
// (همان آپلود روی FTP چابکان) با این تفاوت‌ها:
// - بدون نیاز به لاگین ادمین (عمومی، برای رسید کارت‌به‌کارت مشتری)
// - حداکثر ۲ مگابایت و فقط jpg/png/webp
// - ذخیره در پوشه receipts/ و بازگرداندن آدرس /api/image/receipts/<file>
// آپلود از سمت کلاینت با FormData انجام می‌شود تا درگیر سقف ۴.۵ مگابایتی
// بدنه‌ی Server Action نشود.
//
// چرا دیگر Vercel Blob استفاده نمی‌شود؟
// توکن Blob روی هاست چابکان معتبر/در دسترس نیست و put() با خطای توکن
// می‌افتاد؛ این خطا باعث می‌شد پاسخ سرور JSON معتبر نباشد و کلاینت
// با خطای «Unexpected end of JSON input» کرش کند.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 2 * 1024 * 1024;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    // ── خواندن امن فرم ──
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return json({ ok: false, error: "فایلی ارسال نشده است" }, 400);
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ ok: false, error: "فایلی ارسال نشده است" }, 400);
    }
    if (file.size > MAX_SIZE) {
      return json(
        { ok: false, error: "حجم رسید باید حداکثر ۲ مگابایت باشد" },
        400,
      );
    }
    const ext = ALLOWED[file.type];
    if (!ext) {
      return json({ ok: false, error: "فقط فایل jpg/png/webp مجاز است" }, 400);
    }

    const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    // ── آپلود روی FTP چابکان (مثل آپلود تصاویر محصولات) ──
    const client = new Client();
    try {
      await client.access({
        host: process.env.FTP_HOST || "services.irn1.chabokan.net",
        user: process.env.FTP_USER || "padide-main",
        password: process.env.FTP_PASS,
        secure: false,
      });

      // ساخت پوشه receipts در FTP (اگر نباشد)
      await client.ensureDir("receipts");

      const buffer = Buffer.from(await file.arrayBuffer());
      await client.uploadFrom(Readable.from(buffer), filename);
    } catch (err) {
      console.error("FTP Upload Error Details:", err);
      return json({ ok: false, error: "آپلود رسید ناموفق بود" }, 500);
    } finally {
      try {
        client.close();
      } catch {
        /* ignore */
      }
    }

    // آدرس رسید از همان مسیر سرو شدهٔ تصاویر
    const url = `/api/image/receipts/${filename}`;

    return json({ ok: true, url });
  } catch (e) {
    console.error("[receipts/upload]", e);
    return json({ ok: false, error: "آپلود رسید ناموفق بود" }, 500);
  }
}
