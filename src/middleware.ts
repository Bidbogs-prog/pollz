import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route
  if (!session && req.nextUrl.pathname !== '/auth') {
    // Redirect them to /auth
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // If there's a session and they're on the auth page
  if (session && req.nextUrl.pathname === '/auth') {
    // Redirect them to the home page
    return NextResponse.redirect(new URL('/', req.url));
    
  }

  return res;
}

// Specify which routes should be protected
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};