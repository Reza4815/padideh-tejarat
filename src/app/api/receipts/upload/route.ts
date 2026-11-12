import { NextResponse } from "next/server";
import { Client } from "basic-ftp";
import { Readable } from "stream";

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

      // ✅ رفتن به داخل پوشه receipts (حل مشکل 553)
      await client.cwd("receipts");

      // آپلود فایل با نام ساده (چون الان داخل پوشه هستیم)
      const buffer = Buffer.from(await file.arrayBuffer());
      await client.uploadFrom(Readable.from(buffer), filename);
    } catch (err) {
      console.error("FTP Receipt Upload Error Details:", err);
      return json({ ok: false, error: "آپلود رسید ناموفق بود" }, 500);
    } finally {
      try {
        client.close();
      } catch {
        /* ignore */
      }
    }

    const url = `/api/image/receipts/${filename}`;

    return json({ ok: true, url });
  } catch (e) {
    console.error("[receipts/upload]", e);
    return json({ ok: false, error: "آپلود رسید ناموفق بود" }, 500);
  }
}
