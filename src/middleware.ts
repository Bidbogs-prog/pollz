import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const cookies = req.headers
    .get("cookie")
    ?.split(";")
    .reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

  console.log("All cookies:", cookies);

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Session check:", {
    hasSession: !!session,
    hasAccessToken: !!cookies?.["sb-access-token"],
    hasRefreshToken: !!cookies?.["sb-refresh-token"],
  });

  // Auth page handling
  if (req.nextUrl.pathname === "/auth") {
    if (session) {
      console.log("Session found on auth page - redirecting to home");
      return NextResponse.redirect(new URL("/", req.url));
    }

    return res;
  }

  if (!session) {
    console.log("No session - redirecting to auth");
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return res;
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
