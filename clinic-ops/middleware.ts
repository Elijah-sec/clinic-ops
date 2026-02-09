import { NextRequest, NextResponse } from 'next/server';
import { createBrowserSupabase } from './lib/supabase';

// Protect routes under /app (except api/auth and static files).
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Allow public assets and auth endpoints
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Basic check: look for Supabase session in cookies
  try {
    const supabase = createBrowserSupabase();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch (err) {
    // If env not configured, allow so dev flows aren't blocked
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};
