
"use client";

import Link from 'next/link';
import Logo from '@/components/icons/Logo';
import { Facebook, Instagram, Twitter, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AppUser extends User {
  user_metadata: {
    role?: string;
    [key: string]: any;
  };
}

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);
  const [dynamicYear, setDynamicYear] = useState<number | string>("...");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Set isMounted to true after initial client render

    setDynamicYear(new Date().getFullYear());

    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const appUser = user as AppUser;
        if (appUser.user_metadata?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false); // Explicitly set to false if not admin
        }
      } else {
        setIsAdmin(false); // Explicitly set to false if no user
      }
    };
    checkAdminStatus();
  }, []);

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
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              {isMounted && isAdmin && (
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
          <p>&copy; {isMounted ? dynamicYear : "..."} Zanzibar Free Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
