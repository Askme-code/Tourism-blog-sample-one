
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
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/tours", label: "Manage Tours", icon: Briefcase },
  { href: "/admin/bookings", label: "Manage Bookings", icon: Edit },
  { href: "/admin/news", label: "Manage News", icon: Edit },
  { href: "/admin/reviews", label: "Moderate Reviews", icon: MessageSquare },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface UserWithPublicRole extends SupabaseAuthUser {
  // For data primarily from auth.users (like email, user_metadata for avatar/name)
  user_metadata: { 
    full_name?: string; 
    avatar_url?: string;
    // role from user_metadata is now secondary, public.users.role is primary
    role?: string; 
  };
  // Explicitly add the role fetched from public.users
  public_role?: string; 
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return redirect("/auth/login?message=Please log in to access the admin panel.&redirect_to=/admin");
  }

  // Fetch role from public.users table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('role, full_name, phone') // fetch full_name as well if it's primarily in public.users
    .eq('id', authUser.id)
    .single();

  if (profileError || !userProfile) {
    console.error(`AdminLayout: Error fetching profile for user ${authUser.id} or profile not found:`, profileError);
    return redirect("/?error=unauthorized&message=User profile not found. Cannot verify admin status.");
  }

  if (userProfile.role !== 'admin') {
     console.warn(`AdminLayout: User ${authUser.id} with email ${authUser.email} attempted to access admin panel. Role from public.users: ${userProfile.role}`);
     return redirect("/?error=unauthorized&message=You are not authorized to access this page.");
  }

  // Construct the user object for UserNav, prioritizing data from public.users if available
  // and falling back to authUser.user_metadata for display purposes like full_name, avatar_url
  const displayUser: UserWithPublicRole = {
    ...authUser,
    user_metadata: {
      ...authUser.user_metadata, // Keep existing user_metadata
      full_name: userProfile.full_name || authUser.user_metadata?.full_name || authUser.email || '',
      // avatar_url could still come from authUser.user_metadata if not in public.users
    },
    public_role: userProfile.role, // This is the authoritative role
  };


  return (
    <div className="flex min-h-screen w-full bg-muted/40">
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
          
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserNav user={displayUser} passedRole={userProfile.role} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
