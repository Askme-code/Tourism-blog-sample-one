
"use client";

import Link from 'next/link';
import Logo from '@/components/icons/Logo';
import { Facebook, Instagram, Twitter, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Skeleton loader while client data is being fetched
const SkeletonFooter = () => (
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
             <li className="h-4 w-2/3 bg-muted rounded"></li> {/* Placeholder for Admin link */}
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

// Actual footer content
const ActualFooterContent = ({ currentDisplayYear }: { currentDisplayYear: number | null }) => (
  <div className="container max-w-screen-2xl">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <Logo iconSize={24} textSize="text-lg" />
        <p className="mt-2 text-sm">Discover the magic of Zanzibar with our curated tours.</p>
        <div className="mt-4 flex space-x-3">
          <Link href="#" aria-label="Facebook" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Facebook size={20} />
          </Link>
          <Link href="#" aria-label="Instagram" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Instagram size={20} />
          </Link>
          <Link href="#" aria-label="Twitter" rel="noopener noreferrer" className="hover:text-primary transition-colors">
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
          <li>
            <Link href="/admin" className="flex items-center hover:text-primary transition-colors">
              <LayoutDashboard size={16} className="mr-1.5" /> Admin Panel
            </Link>
          </li>
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
      <p>&copy; {currentDisplayYear || new Date().getFullYear()} Zanzibar Free Tours. All rights reserved.</p>
    </div>
  </div>
);

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);
  const [displayYear, setDisplayYear] = useState<number | null>(null);
  // Removed isAdmin state as it's no longer used for conditional rendering in the footer link

  useEffect(() => {
    setIsMounted(true);
    // No need to fetch admin status specifically for the footer link anymore
    // Set displayYear here if you want it based on client
    setDisplayYear(new Date().getFullYear()); 
  }, []);


  if (!isMounted) {
    return <SkeletonFooter />;
  }

  return (
    <footer className="bg-muted/50 border-t border-border/40 text-muted-foreground py-8 md:py-12">
      <ActualFooterContent currentDisplayYear={displayYear} />
    </footer>
  );
}
