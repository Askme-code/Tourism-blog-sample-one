
import TourForm from '@/components/admin/tours/TourForm';
import { createTourAction } from '@/lib/actions/tourAdminActions';
import { Briefcase } from 'lucide-react';

export const metadata = {
  title: 'Create New Tour | Admin Panel',
};

export default function NewTourPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-headline">Create New Tour</h1>
      </div>
      <TourForm 
        action={createTourAction} 
        submitButtonText="Create Tour"
        formTitle="Add a New Tour Adventure"
        formDescription="Define the details for your new tour offering."
      />
    </div>
  );
}
