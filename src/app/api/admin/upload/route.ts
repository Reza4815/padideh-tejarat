import {NextResponse} from "next/server";
import {getSessionAdmin} from "@/lib/auth";
import {Client} from "basic-ftp";
import {Readable} from "stream";

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
  if (!admin) return NextResponse.json({error: "unauthorized"}, {status: 401});

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File))
    return NextResponse.json({error: "فایلی ارسال نشده"}, {status: 400});
  if (file.size > MAX_SIZE)
    return NextResponse.json({error: "حجم فایل زیاد است"}, {status: 400});

  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({error: "فرمت مجاز نیست"}, {status: 400});

  const filename = `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const client = new Client();
  try {
    await client.access({
      host: process.env.FTP_HOST || "services.irn1.chabokan.net",
      user: process.env.FTP_USER || "padide-main",
      password: process.env.FTP_PASS,
      secure: false,
    });

    // ❌ خط ensureDir حذف شد تا فایل مستقیماً در روت FTP ذخیره شود
    // await client.ensureDir("products");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // آپلود مستقیماً در روت
    await client.uploadFrom(stream, filename);
  } catch (err) {
    console.error("FTP Upload Error Details:", err);
    return NextResponse.json({error: "آپلود به FTP ناموفق بود"}, {status: 500});
  } finally {
    client.close();
  }

  // آدرس جدید بدون پوشه products
  const url = `/api/image/${filename}`;
  return NextResponse.json({ok: true, url});
}
