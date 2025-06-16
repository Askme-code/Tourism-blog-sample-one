
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Briefcase } from 'lucide-react';
import type { Tables } from '@/types/supabase';
import { DeleteTourButton } from '@/components/admin/tours/TourClientActions';
import QueryParamToast from '@/components/utility/QueryParamToast';
import { Suspense } from 'react';

async function getTours() {
  const supabase = createClient();
  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tours for admin:', error);
    return [];
  }
  return tours;
}

export const metadata = {
  title: 'Manage Tours | Admin Panel',
};

export default async function ManageToursPage() {
  const tours: Tables<'tours'>[] = await getTours();

  const getStatusVariant = (status: string | null): "default" | "secondary" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'available': return 'default'; // Greenish or primary
      case 'unavailable': return 'destructive';
      case 'draft': return 'secondary'; // Greyish
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Suspense fallback={null}><QueryParamToast /></Suspense>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-headline">Manage Tours</h1>
        </div>
        <Button asChild>
          <Link href="/admin/tours/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Tour
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Tours</CardTitle>
          <CardDescription>View, edit, or delete existing tours.</CardDescription>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tours found. Get started by creating one!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tours.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell className="font-medium">{tour.name}</TableCell>
                      <TableCell>{tour.location || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        {tour.price != null ? `$${Number(tour.price).toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>{tour.duration_hours ? `${tour.duration_hours} hrs` : 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(tour.status)} className="capitalize">
                          {tour.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/tours/${tour.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </Button>
                        <DeleteTourButton tourId={tour.id} tourName={tour.name} />
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
