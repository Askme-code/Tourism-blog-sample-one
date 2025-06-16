
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const BookingStatusEnum = z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'], {
    message: "Invalid booking status."
});

export type UpdateBookingStatusFormState = {
  message?: string;
  error?: boolean;
  bookingId?: string;
  newStatus?: string;
};

export async function updateBookingStatusAction(
  bookingId: string,
  newStatus: string
): Promise<UpdateBookingStatusFormState> {
  const supabase = createClient();

  const statusValidation = BookingStatusEnum.safeParse(newStatus);
  if (!statusValidation.success) {
    return {
      error: true,
      message: statusValidation.error.issues[0]?.message || "Invalid status value.",
      bookingId,
      newStatus,
    };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (error) {
    console.error(`Error updating booking status for ${bookingId} to ${newStatus}:`, error);
    return {
      error: true,
      message: error.message || "Failed to update booking status. Please try again.",
      bookingId,
      newStatus,
    };
  }

  revalidatePath('/admin/bookings');
  revalidatePath('/bookings'); // Revalidate user's booking page if they can see statuses

  return {
    error: false,
    message: `Booking status successfully updated to ${newStatus}.`,
    bookingId,
    newStatus,
  };
}

// Placeholder for deleting a booking - usually less common for admins
// export async function deleteBookingAction(id: string): Promise<{ error?: string, success?: string }>{
//   const supabase = createClient();
//   // Add logic to check if booking can be deleted (e.g., not in the past, etc.)
//   const { error } = await supabase.from('bookings').delete().eq('id', id);

//   if (error) {
//     console.error(`Error deleting booking ${id}:`, error);
//     return { error: error.message || "Failed to delete booking." };
//   }

//   revalidatePath('/admin/bookings');
//   revalidatePath('/bookings');
//   return { success: "Booking deleted successfully!" };
// }
