import { NextResponse, type NextRequest } from "next/server";
import { hasEditAccess, PAINEL_COOKIE } from "@/lib/painel-auth";

/** Painel e APIs: somente o dono do site (senha). Visitantes só leem as páginas publicadas. */
export async function middleware(request: NextRequest) {
  if (await hasEditAccess(request.cookies.get(PAINEL_COOKIE)?.value)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = `?volta=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/painel/:path*", "/api/:path*"],
};
