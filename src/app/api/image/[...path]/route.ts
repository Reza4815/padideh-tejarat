import {NextRequest, NextResponse} from "next/server";
import {Client} from "basic-ftp";

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{path: string[]}>},
) {
  const {path: segments} = await params;
  const filePath = segments.join("/");

  const client = new Client();
  try {
    await client.access({
      host: process.env.FTP_HOST || "services.irn1.chabokan.net",
      user: process.env.FTP_USER || "padide-main",
      password: process.env.FTP_PASS,
      secure: false,
    });

    // ✅ روش استاندارد و مطمئن‌تر برای خواندن فایل از FTP
    const stream = await client.download(filePath);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    client.close();

    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : ext === "avif"
              ? "image/avif"
              : "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("FTP Image Fetch Error:", err);
    client.close();
    return new NextResponse("Image Not Found", {status: 404});
  }
}
