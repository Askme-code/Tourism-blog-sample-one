
"use client";

import Link from 'next/link';
import Logo from '@/components/icons/Logo';
import { Facebook, Instagram, Twitter, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setIsMounted(true); 

    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single(); // .single() is okay here if we expect a profile to always exist post-signup logic
        
        if (!error && userProfile && userProfile.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          // Log if there's an error or profile isn't found, for debugging.
          // The "no rows" error from .single() would be caught here.
          if (error) console.warn("Footer: Error or no profile found fetching user role:", error.message);
          else if (!userProfile) console.warn("Footer: No profile found for user:", authUser.id);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, []);

  if (!isMounted) {
    // Avoid rendering different content on server and client initial render
    return (
        <footer className="bg-muted/50 border-t border-border/40 text-muted-foreground py-8 md:py-12">
            <div className="container max-w-screen-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                    <div>
                        <div className="h-8 w-48 bg-muted rounded"></div>
                        <div className="mt-2 h-4 w-full bg-muted rounded"></div>
                        <div className="mt-4 flex space-x-3">
                            <div className="h-5 w-5 bg-muted rounded-full"></div>
                            <div className="h-5 w-5 bg-muted rounded-full"></div>
                            <div className="h-5 w-5 bg-muted rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div className="h-6 w-24 bg-muted rounded mb-3"></div>
                        <ul className="space-y-2 text-sm">
                            {[...Array(3)].map((_, i) => <li key={i} className="h-4 w-3/4 bg-muted rounded"></li>)}
                        </ul>
                    </div>
                    <div>
                        <div className="h-6 w-32 bg-muted rounded mb-3"></div>
                         <div className="space-y-1 text-sm">
                            <div className="h-4 w-full bg-muted rounded"></div>
                            <div className="h-4 w-5/6 bg-muted rounded"></div>
                            <div className="h-4 w-4/5 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border/60 text-center text-xs">
                    <div className="h-3 w-1/3 bg-muted rounded mx-auto"></div>
                </div>
            </div>
        </footer>
    ); 
  }

  return (
    <footer className="bg-muted/50 border-t border-border/40 text-muted-foreground py-8 md:py-12">
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
              {isAdmin && (
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
          <p>&copy; {currentYear} Zanzibar Free Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
