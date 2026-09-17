import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function loginUrl(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return url;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.redirect(loginUrl(req));
  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET ?? "pta-local-auth",
    );
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(loginUrl(req));
    res.cookies.set("session", "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/checkout", "/account/:path*"],
};
