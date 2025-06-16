
import TourForm from '@/components/admin/tours/TourForm';
import { updateTourAction } from '@/lib/actions/tourAdminActions';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import type { Tables } from '@/types/supabase';

export const metadata = {
  title: 'Edit Tour | Admin Panel',
};

async function getTour(id: string): Promise<Tables<'tours'> | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tour for editing:', error);
    return null;
  }
  return data;
}

export default async function EditTourPage({ params }: { params: { id: string } }) {
  const tour = await getTour(params.id);

  if (!tour) {
    notFound();
  }

  // Bind the tour ID to the update action
  const updateTourActionWithId = updateTourAction.bind(null, tour.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-headline">Edit Tour: {tour.name}</h1>
      </div>
      <TourForm
        action={updateTourActionWithId}
        initialData={tour}
        submitButtonText="Save Changes"
        formTitle="Update Tour Information"
        formDescription="Modify the details of this tour."
      />
    </div>
  );
}

