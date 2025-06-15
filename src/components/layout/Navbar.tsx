
import Link from 'next/link';
import Logo from '@/components/icons/Logo';
import { ModeToggle } from '@/components/layout/ModeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu as MenuIcon, User as UserIconFallback } from 'lucide-react'; // Renamed User to UserIconFallback
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { createClient as createSupabaseServerClient} from '@/lib/supabase/server'; // Renamed to avoid conflict in AuthStatus
import { UserNav } from './UserNav';
import { Suspense } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@/lib/supabase/client'; // For client-side role fetch

// This AuthStatus component will run on the server to get the initial auth user
// For client-side updates or fetching public.users.role, UserNav or a new client component will handle it
async function AuthStatus() {
  const supabase = createSupabaseServerClient(); // Server client for initial auth check
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser) {
    // For UserNav, we need to pass the role from public.users
    // This requires an async operation, best handled inside a client component
    // if we want to fetch it dynamically for the main navbar.
    // Or, for admin layout, it's passed directly.
    // Here, we'll pass the authUser and let UserNav (or a wrapper) fetch the public role if needed.
    // For now, UserNav will just get passedRole from AdminLayout.
    // A more advanced solution for Navbar would be a dedicated Client Component for AuthStatus
    // that fetches the public.users.role on the client.

    // For UserNav to show admin link correctly in main navbar, it needs the role.
    // Let's create a small client component wrapper for UserNav here to fetch the role.
    return <UserNavWithRoleFetcher authUser={authUser} />;
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  );
}

// New client component to fetch public.users.role for UserNav in the main navbar
function UserNavWithRoleFetcher({ authUser }: { authUser: SupabaseAuthUser }) {
  'use client';
  const [role, setRole] = React.useState<string | undefined>(undefined);
  const [isLoadingRole, setIsLoadingRole] = React.useState(true);

  React.useEffect(() => {
    async function fetchRole() {
      if (authUser) {
        const supabase = createSupabaseClient();
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single();
        if (!error && userProfile) {
          setRole(userProfile.role);
        } else if (error) {
          console.error("Error fetching user role for UserNav:", error.message);
        }
        setIsLoadingRole(false);
      } else {
        setIsLoadingRole(false);
      }
    }
    fetchRole();
  }, [authUser]);

  if (isLoadingRole) {
    // Basic fallback while role is loading
    return <Button variant="ghost" size="icon" className="rounded-full"><UserIconFallback className="h-5 w-5"/></Button>;
  }
  
  // Type assertion for user_metadata if needed by UserNav structure
  const typedUser = authUser as SupabaseAuthUser & { user_metadata: { full_name?: string, avatar_url?: string }};

  return <UserNav user={typedUser} passedRole={role} />;
}


export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo iconSize={28} textSize="text-xl" />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {['Home', 'About', 'Contact', 'Book Tour'].map((label) => {
            const href = `/${label.toLowerCase().replace(' ', '-')}`;
            return (
              <Link
                key={href}
                href={href === '/home' ? '/' : href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <div className="hidden md:flex relative w-full max-w-xs items-center">
            <Input
              type="search"
              placeholder="Search tours..."
              className="pl-8 pr-4 py-2 h-9"
              aria-label="Search tours"
            />
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          
          <LanguageSwitcher />
          <ModeToggle />
          <Suspense fallback={<Button variant="ghost" size="icon" className="rounded-full"><UserIconFallback className="h-5 w-5"/></Button>}>
            <AuthStatus />
          </Suspense>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px]">
                <SheetHeader className="mb-4">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-3">
                  {['Home', 'About', 'Contact', 'Book Tour'].map((label) => {
                     const href = `/${label.toLowerCase().replace(' ', '-')}`;
                    return (
                      <SheetClose asChild key={href}>
                        <Link
                          href={href === '/home' ? '/' : href}
                          className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          {label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <div className="relative mt-4">
                     <Input
                        type="search"
                        placeholder="Search tours..."
                        className="pl-8 pr-4 py-2 h-10 w-full"
                        aria-label="Search tours"
                      />
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
