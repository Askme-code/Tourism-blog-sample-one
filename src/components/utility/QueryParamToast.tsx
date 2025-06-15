
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function QueryParamToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error'); // Optional: for error messages via redirect

    if (message) {
      toast({
        title: error ? "Error" : "Notification",
        description: message,
        variant: error ? "destructive" : "default",
        duration: error ? 8000 : 5000, // Longer duration for errors
      });
      
      // Remove the message and error query params from URL after showing toast to prevent re-showing on refresh
      const currentPath = window.location.pathname;
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('message');
      newSearchParams.delete('error');
      
      // Use router.replace to update URL without adding to history and without page reload
      // Check if there are any other params left before adding '?'
      const newQueryString = newSearchParams.toString();
      router.replace(currentPath + (newQueryString ? `?${newQueryString}` : ''), { scroll: false });

    }
  }, [searchParams, toast, router]);

  return null; // This component doesn't render anything itself
}
