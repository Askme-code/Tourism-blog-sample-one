
'use client';

import { useState, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateBookingStatusAction } from '@/lib/actions/bookingAdminActions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/types/supabase';

interface BookingStatusChangerProps {
  bookingId: string;
  currentStatus: Tables<'bookings'>['status'];
}

const availableStatuses: Array<NonNullable<Tables<'bookings'>['status']>> = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'rescheduled',
];

export default function BookingStatusChanger({ bookingId, currentStatus }: BookingStatusChangerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    const previousStatus = optimisticStatus;
    setOptimisticStatus(newStatus as NonNullable<Tables<'bookings'>['status']>);

    startTransition(async () => {
      const result = await updateBookingStatusAction(bookingId, newStatus);
      if (result.error) {
        toast({
          title: 'Update Failed',
          description: result.message,
          variant: 'destructive',
        });
        setOptimisticStatus(previousStatus); // Revert optimistic update on error
      } else {
        toast({
          title: 'Status Updated',
          description: `Booking status changed to ${newStatus}.`,
        });
        // No need to setOptimisticStatus again, it's already updated.
        // The revalidation will fetch the new truth from server.
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={optimisticStatus || ''}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="h-9 w-[150px] text-xs" disabled={isPending}>
          <SelectValue placeholder="Change status..." />
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status) => (
            <SelectItem key={status} value={status} className="capitalize text-xs">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
