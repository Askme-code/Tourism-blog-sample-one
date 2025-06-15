import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, Briefcase, Edit, MessageSquare, Users, Settings, LogOut, PanelLeft } from "lucide-react";
import Logo from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { UserNav } from "@/components/layout/UserNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User as SupabaseUser } from '@supabase/supabase-js';

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/tours", label: "Manage Tours", icon: Briefcase },
  { href: "/admin/bookings", label: "Manage Bookings", icon: Edit },
  { href: "/admin/news", label: "Manage News", icon: Edit },
  { href: "/admin/reviews", label: "Moderate Reviews", icon: MessageSquare },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login?message=Please log in to access the admin panel.");
  }

  const typedUser = user as SupabaseUser & { user_metadata: { role?: string, full_name?: string, avatar_url?: string } };
  
  // Check if user_metadata and role exist
  if (!typedUser.user_metadata || typedUser.user_metadata.role !== 'admin') {
     console.warn(`User ${user.id} with email ${user.email} attempted to access admin panel without admin role. Current role: ${typedUser.user_metadata?.role}`);
     return redirect("/?error=unauthorized&message=You are not authorized to access this page.");
  }


  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background fixed">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin">
            <Logo iconSize={24} textSize="text-lg" />
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {adminNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
                prefetch={false}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
         <div className="mt-auto p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/">
                    <LogOut className="mr-2 h-4 w-4 rotate-180" /> Exit Admin
                </Link>
            </Button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 md:ml-64">
        {/* Mobile Header & Desktop Header Content */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 justify-between md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs p-0">
                <div className="flex h-16 items-center border-b px-6">
                  <Link href="/admin">
                    <Logo iconSize={24} textSize="text-lg" />
                  </Link>
                </div>
                <ScrollArea className="h-[calc(100vh-4rem)] py-2">
                  <nav className="grid gap-2 px-4 text-sm font-medium">
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
                        prefetch={false}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>
                <div className="mt-auto p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/">
                            <LogOut className="mr-2 h-4 w-4 rotate-180" /> Exit Admin
                        </Link>
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Right side of header for desktop and mobile */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserNav user={typedUser} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
