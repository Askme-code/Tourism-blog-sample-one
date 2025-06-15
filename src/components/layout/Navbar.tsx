import Link from 'next/link';
import Logo from '@/components/icons/Logo';
import { ModeToggle } from '@/components/layout/ModeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu as MenuIcon, X as XIcon, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { createClient } from '@/lib/supabase/server';
import { UserNav } from './UserNav';
import { Suspense } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/book-tour', label: 'Book Tour' },
];

async function AuthStatus() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Augment user type to include user_metadata for role
    const typedUser = user as typeof user & { user_metadata: { role?: string, full_name?: string, avatar_url?: string } };
    return <UserNav user={typedUser} />;
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {link.label}
            </Link>
          ))}
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
          <Suspense fallback={<Button variant="ghost" size="icon" className="rounded-full"><User className="h-5 w-5"/></Button>}>
            <AuthStatus />
          </Suspense>

          {/* Mobile Navigation */}
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
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
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
