
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, MapPin, Users, Briefcase, Info } from "lucide-react";
import Image from "next/image";
import { format } from 'date-fns';
import type { Database } from '@/types/supabase'; // Ensure Database type is imported
import QueryParamToast from '@/components/utility/QueryParamToast';
import { Suspense } from 'react';


type BookingWithTour = Tables<'bookings'> & {
  tours: Pick<Tables<'tours'>, 'id' | 'name' | 'image_url' | 'location'> | null;
};

async function getUserBookings() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This should be caught by middleware, but as a fallback:
    return [];
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tours ( id, name, image_url, location )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }); // Order by creation date to see newest first

  if (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
  return bookings as BookingWithTour[];
}


export default async function MyBookingsPage() {
  const bookings = await getUserBookings();

  const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'default'; 
      case 'pending': return 'secondary'; 
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline'; 
      default: return 'secondary';
    }
  };
  
  const getStatusTextClass = (status: string | null): string => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'cancelled': return 'text-red-600 dark:text-red-400';
      case 'completed': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  }


  return (
    <div className="container py-8 md:py-12">
      <Suspense fallback={null}>
        <QueryParamToast />
      </Suspense>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-headline">My Bookings</h1>
        <Button asChild>
          <Link href="/tours">
            <Briefcase className="mr-2 h-4 w-4" /> Book a New Tour
          </Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card className="shadow-lg text-center py-12">
          <CardHeader>
            <Info className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="font-headline text-2xl">No Bookings Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg">
              You haven&apos;t booked any tours with us yet.
            </CardDescription>
            <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/tours">Explore Our Tours</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="grid md:grid-cols-3">
                <div className="md:col-span-1 relative aspect-video md:aspect-auto min-h-[200px]">
                  {booking.tours?.image_url ? (
                    <Image 
                      src={booking.tours.image_url} 
                      alt={booking.tours.name || 'Tour image'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                      data-ai-hint="tour booking"
                    />
                  ) : (
                    <div className="bg-muted h-full flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <CardTitle className="text-xl font-headline text-primary">{booking.tours?.name || 'Tour Details Unavailable'}</CardTitle>
                       <Badge variant={getStatusVariant(booking.status)} className={`capitalize text-xs px-2.5 py-1 ${getStatusTextClass(booking.status)} border ${getStatusTextClass(booking.status)}`}>
                        {booking.status || 'Unknown'}
                      </Badge>
                    </div>
                     {booking.tours?.location && (
                        <CardDescription className="flex items-center text-sm mt-1">
                            <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" /> {booking.tours.location}
                        </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                        <strong>Tour Date:</strong>&nbsp;{format(new Date(booking.tour_date), 'PPP')}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <strong>Guests:</strong>&nbsp;{booking.number_of_people}
                      </div>
                       <div className="flex items-center">
                        <strong className="text-muted-foreground">Booking ID:</strong>&nbsp;<span className="font-mono text-xs">{booking.id.substring(0,8)}...</span>
                      </div>
                      <div className="flex items-center">
                         <strong className="text-muted-foreground">Total Price:</strong>&nbsp;
                         {booking.total_price !== null ? `$${Number(booking.total_price).toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                    {booking.booking_date && (
                       <div className="flex items-center text-xs text-muted-foreground">
                         Booked on: {format(new Date(booking.booking_date), 'PPp')}
                       </div>
                    )}
                    {booking.notes && (
                      <div>
                        <strong className="text-muted-foreground">Notes:</strong>
                        <p className="text-xs bg-muted/50 p-2 rounded-md mt-1 whitespace-pre-wrap">{booking.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 pt-4 border-t">
                    {booking.status?.toLowerCase() === 'pending' && ( // Example: Allow modification only if pending
                      <Button variant="outline" size="sm" disabled>Modify Booking (soon)</Button>
                    )}
                    {booking.status?.toLowerCase() !== 'cancelled' && booking.status?.toLowerCase() !== 'completed' && (
                       <Button variant="destructive" size="sm" disabled>Cancel Booking (soon)</Button>
                    )}
                     <Button variant="link" size="sm" asChild className="text-primary">
                      <Link href={`/tours/${booking.tour_id}`}>View Tour Details</Link>
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Ensure Tables type is correctly defined or imported if it's from supabase
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// It seems Database type might not be fully defined or accessible in this context for Tables type.
// If `Database` type is correctly generated and available in ` '@/types/supabase'`,
// this should work. Otherwise, a minimal local definition might be needed if the import fails.
// For example:
// interface Database { public: { Tables: { bookings: { Row: any }, tours: { Row: any } } } }

