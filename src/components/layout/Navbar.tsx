
import Link from 'next/link';
import Logo from '@/components/icons/Logo';
import { ModeToggle } from '@/components/layout/ModeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu as MenuIcon, User as UserIconFallback } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { createClient as createSupabaseServerClient} from '@/lib/supabase/server';
import { Suspense } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import UserNavWithRoleFetcher from './UserNavWithRoleFetcher'; // Import the new client component

// This AuthStatus component will run on the server to get the initial auth user
async function AuthStatus() {
  const supabase = createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser) {
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
