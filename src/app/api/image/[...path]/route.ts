import { NextRequest, NextResponse } from "next/server";
import { Client } from "basic-ftp";
import { Writable } from "stream";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filePath = segments.join("/");

  const client = new Client();
  try {
    await client.access({
      host: process.env.FTP_HOST || "services.irn1.chabokan.net",
      user: process.env.FTP_USER || "padide-main",
      password: process.env.FTP_PASS,
      secure: false,
    });

    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk);
        cb();
      },
    });

    await client.downloadTo(writable, filePath);
    client.close();

    const buffer = Buffer.concat(chunks);

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
    client.close();
    return new NextResponse("Image Not Found", { status: 404 });
  }
}
