
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export function createClient() {
  const cookieStore = cookies();

  const supabaseUrlString = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKeyString = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrlString) {
    throw new Error(
      "Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is not defined. Please set it in your .env.local file for local development and in Vercel project settings for deployments. Remember to restart your dev server or redeploy on Vercel after changes."
    );
  }
  if (supabaseUrlString === 'YOUR_SUPABASE_URL_HERE' || supabaseUrlString === 'YOUR_ACTUAL_SUPABASE_URL') {
    throw new Error(
      "The placeholder value for NEXT_PUBLIC_SUPABASE_URL is still being used. You MUST replace it with your actual Supabase project URL in your .env.local file (and restart dev server) AND in your Vercel project environment variables (and redeploy)."
    );
  }

  if (!supabaseAnonKeyString) {
    throw new Error(
      "Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is not defined. Please set it in your .env.local file for local development and in Vercel project settings for deployments. Remember to restart your dev server or redeploy on Vercel after changes."
    );
  }
  if (supabaseAnonKeyString === 'YOUR_SUPABASE_ANON_KEY_HERE' || supabaseAnonKeyString === 'YOUR_ACTUAL_SUPABASE_ANON_KEY') {
     throw new Error(
      "The placeholder value for NEXT_PUBLIC_SUPABASE_ANON_KEY is still being used. You MUST replace it with your actual Supabase anon key in your .env.local file (and restart dev server) AND in your Vercel project environment variables (and redeploy)."
    );
  }

  try {
    new URL(supabaseUrlString); // Validate the URL format
  } catch (e) {
    console.error("Raw Supabase URL causing error: ", "'" + supabaseUrlString + "'");
    throw new Error(
      `The provided Supabase URL ('${supabaseUrlString}') is not a valid URL. Ensure it starts with http:// or https:// and has no typos or extra spaces. Check NEXT_PUBLIC_SUPABASE_URL in your environment settings.`
    );
  }

  return createServerClient<Database>(
    supabaseUrlString,
    supabaseAnonKeyString,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

