import { NextResponse, type NextRequest } from "next/server";
import { PAINEL_COOKIE, painelSenha, painelToken } from "@/lib/painel-auth";

/** Protege o painel e as APIs com senha — somente se PAINEL_SENHA estiver definida. */
export async function middleware(request: NextRequest) {
  const senha = painelSenha();
  if (!senha) return NextResponse.next();

  const cookie = request.cookies.get(PAINEL_COOKIE)?.value;
  if (cookie && cookie === (await painelToken(senha))) return NextResponse.next();

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
