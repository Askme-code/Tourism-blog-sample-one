
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

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!session || !authUser) {
      return NextResponse.redirect(new URL('/auth/login?message=Please log in to access the admin panel.&redirect_to=/admin', request.url));
    }

    // Fetch role from public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle(); // Use maybeSingle to handle "no row" gracefully

    if (profileError) {
      // This error is now for actual database issues or if multiple rows were found (PK should prevent this)
      console.error(`Middleware: Database error fetching profile for user ${authUser.id}:`, profileError.message);
      return NextResponse.redirect(new URL('/?error=unauthorized&message=Error accessing your user profile data.', request.url));
    }
    
    if (!userProfile) {
      // User is authenticated in auth.users but no corresponding profile in public.users
      console.warn(`Middleware: No profile found in public.users for user ${authUser.id} (${authUser.email}). Admin access denied.`);
      return NextResponse.redirect(new URL('/?error=unauthorized&message=User profile not found. Cannot verify admin status.', request.url));
    }

    if (userProfile.role !== 'admin') {
      console.warn(`Middleware: Admin access denied for user ${authUser.id} (${authUser.email}). Role from public.users: '${userProfile.role}'.`);
      return NextResponse.redirect(new URL('/?error=unauthorized&message=You are not authorized to access the admin panel.', request.url));
    }
  }

  if (pathname.startsWith('/profile') || pathname.startsWith('/bookings') || pathname.startsWith('/book-tour')) {
     if (!session) {
      return NextResponse.redirect(new URL(`/auth/login?message=Please log in to access this page.&redirect_to=${pathname}`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

