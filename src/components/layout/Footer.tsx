
"use client";

import Link from 'next/link';
import Logo from '@/components/icons/Logo';
import { Facebook, Instagram, Twitter, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// This component renders the actual footer content once client-side state is ready
const ActualFooterContent = ({ currentIsAdmin, currentDisplayYear }: { currentIsAdmin: boolean; currentDisplayYear: number | null }) => (
  <>
    <div className="container max-w-screen-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Logo iconSize={24} textSize="text-lg" />
          <p className="mt-2 text-sm">
            Discover the magic of Zanzibar with our curated tours.
          </p>
          <div className="mt-4 flex space-x-3">
            <Link href="#" aria-label="Facebook" className="hover:text-primary transition-colors">
              <Facebook size={20} />
            </Link>
            <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
              <Instagram size={20} />
            </Link>
            <Link href="#" aria-label="Twitter" className="hover:text-primary transition-colors">
              <Twitter size={20} />
            </Link>
          </div>
        </div>
        
        <div>
          <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/tours" className="hover:text-primary transition-colors">Our Tours</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ (Coming Soon)</Link></li>
            {currentIsAdmin && (
              <li>
                <Link href="/admin" className="flex items-center hover:text-primary transition-colors">
                  <LayoutDashboard size={16} className="mr-1.5" /> Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Contact Us</h3>
          <address className="not-italic text-sm space-y-1">
            <p>Stone Town, Zanzibar</p>
            <p>Email: <a href="mailto:info@zanzibarfreetours.com" className="hover:text-primary transition-colors">info@zanzibarfreetours.com</a></p>
            <p>Phone: <a href="tel:+255777123456" className="hover:text-primary transition-colors">+255 777 123 456</a></p>
          </address>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-border/60 text-center text-xs">
        {currentDisplayYear ? (
          <p>&copy; {currentDisplayYear} Zanzibar Free Tours. All rights reserved.</p>
        ) : (
          <p className="h-4 w-1/3 bg-muted rounded mx-auto">&nbsp;</p> 
        )}
      </div>
    </div>
  </>
);


export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayYear, setDisplayYear] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs only on the client, after isMounted is true
    if (isMounted) {
      setDisplayYear(new Date().getFullYear());

      const checkAdminStatus = async () => {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (error) {
             if (error.message.includes("multiple (or no) rows returned")) {
              console.warn(`Footer: No profile/role found for user ${authUser.id} (reported as: ${error.message}). Assuming non-admin.`);
            } else {
              console.error("Footer: Error fetching user role:", error.message);
            }
            setIsAdmin(false);
          } else if (!userProfile) {
            console.warn(`Footer: No profile found in public.users for user ${authUser.id}. Assuming non-admin.`);
            setIsAdmin(false);
          } else {
            setIsAdmin(userProfile.role === 'admin');
          }
        } else {
          setIsAdmin(false);
        }
      };
      checkAdminStatus();
    }
  }, [isMounted]);

  if (!isMounted) {
    // Skeleton rendered on the server and initial client render BEFORE isMounted is true
    return (
        <footer className="bg-muted/50 border-t border-border/40 text-muted-foreground py-8 md:py-12">
            <div className="container max-w-screen-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 bg-primary/20 rounded-full"></div>
                            <div className="h-5 w-40 bg-muted rounded"></div>
                        </div>
                        <p className="mt-2 text-sm h-4 w-3/4 bg-muted rounded"></p>
                        <div className="mt-4 flex space-x-3">
                            <div className="h-5 w-5 bg-muted rounded-full"></div>
                            <div className="h-5 w-5 bg-muted rounded-full"></div>
                            <div className="h-5 w-5 bg-muted rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-headline text-lg font-semibold text-transparent bg-muted rounded h-5 w-24 mb-3"></h3>
                        <ul className="space-y-2 text-sm">
                            {[...Array(4)].map((_, i) => (
                                <li key={`skel-link-${i}`} className="h-4 w-2/3 bg-muted rounded"></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-headline text-lg font-semibold text-transparent bg-muted rounded h-5 w-28 mb-3"></h3>
                        <address className="not-italic text-sm space-y-1">
                            <p className="h-4 w-3/4 bg-muted rounded"></p>
                            <p className="h-4 w-full bg-muted rounded"></p>
                            <p className="h-4 w-1/2 bg-muted rounded"></p>
                        </address>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border/60 text-center text-xs">
                    <p className="h-4 w-1/3 bg-muted rounded mx-auto">&nbsp;</p>
                </div>
            </div>
        </footer>
    );
  }

  // Actual content rendered on the client AFTER isMounted is true and other states are determined
  return (
    <footer className="bg-muted/50 border-t border-border/40 text-muted-foreground py-8 md:py-12">
      <ActualFooterContent currentIsAdmin={isAdmin} currentDisplayYear={displayYear} />
    </footer>
  );
}
