
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, CalendarRange } from 'lucide-react';
import type { Tables, Database } from '@/types/supabase';
import BookingStatusChanger from '@/components/admin/bookings/BookingStatusChanger';
import QueryParamToast from '@/components/utility/QueryParamToast';
import { Suspense } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type BookingWithDetails = Tables<'bookings'> & {
  tours: Pick<Tables<'tours'>, 'id' | 'name'> | null;
  users: Pick<Tables<'users'>, 'id' | 'full_name' | 'email'> | null;
};

async function getBookings() {
  const supabase = createClient();
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tours (id, name),
      users (id, full_name, email)
    `)
    .order('booking_date', { ascending: false });

  if (error) {
    console.error('Error fetching bookings for admin:', error);
    return [];
  }
  return bookings as BookingWithDetails[];
}

export const metadata = {
  title: 'Manage Bookings | Admin Panel',
};

export default async function ManageBookingsPage() {
  const bookings = await getBookings();

  const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'default'; // Often green or primary
      case 'pending': return 'secondary'; // Often yellow or grey
      case 'cancelled': return 'destructive'; // Often red
      case 'completed': return 'outline'; // Neutral or blueish
      case 'rescheduled': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getStatusTextClass = (status: string | null): string => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'cancelled': return 'text-red-600 dark:text-red-400';
      case 'completed': return 'text-blue-600 dark:text-blue-400';
      case 'rescheduled': return 'text-orange-500 dark:text-orange-400';
      default: return 'text-muted-foreground';
    }
  };


  return (
    <div className="space-y-6">
      <Suspense fallback={null}><QueryParamToast /></Suspense>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-headline">Manage Bookings</h1>
        </div>
        {/* Optional: Button for creating bookings manually, if needed later */}
        {/* <Button asChild>
          <Link href="/admin/bookings/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Booking
          </Link>
        </Button> */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage tour bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Tour Date</TableHead>
                    <TableHead className="text-center">Guests</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium min-w-[150px]">
                        {booking.tours?.name || <span className="text-muted-foreground text-xs">Tour data missing</span>}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="text-xs">
                            {booking.users?.full_name || <span className="text-muted-foreground">N/A</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {booking.users?.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {booking.booking_date ? format(new Date(booking.booking_date), 'PP') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(booking.tour_date), 'PP')}
                      </TableCell>
                      <TableCell className="text-center">{booking.number_of_people}</TableCell>
                      <TableCell className="text-right">
                        {booking.total_price != null ? `$${Number(booking.total_price).toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <BookingStatusChanger bookingId={booking.id} currentStatus={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild disabled>
                          <Link href={`/admin/bookings/${booking.id}/edit`}> {/* Placeholder for future edit page */}
                            <Edit className="mr-2 h-3 w-3" /> Details
                          </Link>
                        </Button>
                        {/* Delete Booking Button - implement if needed
                        <DeleteBookingButton bookingId={booking.id} /> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
