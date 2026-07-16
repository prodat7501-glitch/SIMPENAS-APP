import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("simpenas_session");

  // Menentukan rute login
  const isAuthPage = pathname === "/login";

  // Melewati pemrosesan berkas statis & ikon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Jika belum masuk dan mencoba mengakses selain halaman login, arahkan ke /login
  if (!hasSession && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah masuk dan mencoba mengakses halaman login atau akar /, arahkan ke /dashboard
  if (hasSession && (isAuthPage || pathname === "/")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua rute permintaan kecuali:
     * - api (rute API)
     * - _next/static (berkas statis Next.js)
     * - _next/image (optimasi gambar Next.js)
     * - manifest.json / sw.js / workbox-* / icons (PWA & service worker assets)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|manifest.json|sw.js|workbox-|icons|favicon.ico).*)",
  ],
};
