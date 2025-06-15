
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fallback: if getUser didn't populate user, try getSession to ensure session state is reflected
  // This can sometimes happen if cookies are not perfectly synced on the first request after login.
  // However, getUser() should be authoritative after refresh.
  const { data: { session } } = await supabase.auth.getSession();


  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || !user) { // Check both session and user for robustness
      return NextResponse.redirect(new URL('/auth/login?message=Please log in to access the admin panel.', request.url));
    }
    // Supabase User type includes user_metadata: { [key: string]: any; }
    // Casting for more specific type checking of 'role'
    const typedUser = user as typeof user & { user_metadata?: { role?: string } };
    
    if (typedUser.user_metadata?.role !== 'admin') {
      console.warn(`Admin access denied for user ${user.id} (${user.email}). Role: '${typedUser.user_metadata?.role || 'not set'}'`);
      return NextResponse.redirect(new URL('/?error=unauthorized&message=You are not authorized to access the admin panel.', request.url));
    }
  }

  // Protect profile and booking routes
  if (pathname.startsWith('/profile') || pathname.startsWith('/bookings') || pathname.startsWith('/book-tour')) {
     if (!session) { // Only session check is sufficient here as user object might not be needed for the redirect message
      return NextResponse.redirect(new URL(`/auth/login?message=Please log in to access this page.&redirect_to=${pathname}`, request.url));
    }
  }


  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
