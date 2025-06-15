
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const BookingSchema = z.object({
  tourId: z.string().uuid({ message: "Invalid Tour ID." }),
  tour_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Please select a valid date." }),
  number_of_people: z.coerce.number().int().min(1, { message: "Number of people must be at least 1." }),
  notes: z.string().max(500, { message: "Notes cannot exceed 500 characters." }).optional(),
});

export async function submitBookingAction(prevState: any, formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // This should ideally be caught by middleware, but as a safeguard:
    return redirect('/auth/login?message=Please log in to book a tour.&redirect_to=' + formData.get('pathname'));
  }

  const validatedFields = BookingSchema.safeParse({
    tourId: formData.get('tourId'),
    tour_date: formData.get('tour_date'),
    number_of_people: formData.get('number_of_people'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      error: true,
      message: "Invalid form data. Please check your inputs.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { tourId, tour_date, number_of_people, notes } = validatedFields.data;

  // Fetch tour price
  const { data: tourData, error: tourError } = await supabase
    .from('tours')
    .select('price, name')
    .eq('id', tourId)
    .single();

  if (tourError || !tourData) {
    console.error('Error fetching tour price:', tourError);
    return {
      error: true,
      message: 'Could not find tour details. Please try again.',
      errors: null,
    };
  }

  const totalPrice = tourData.price ? tourData.price * number_of_people : null;

  const { error: bookingError } = await supabase.from('bookings').insert({
    user_id: user.id,
    tour_id: tourId,
    tour_date: new Date(tour_date).toISOString(),
    number_of_people: number_of_people,
    status: 'pending', // Default status
    total_price: totalPrice,
    notes: notes || null, // Ensure notes is null if empty string or undefined
    booking_date: new Date().toISOString(), 
  });

  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    return {
      error: true,
      message: bookingError.message || 'Could not submit your booking request. Please try again.',
      errors: null,
    };
  }

  revalidatePath('/bookings');
  revalidatePath(`/tours/${tourId}`);
  redirect('/bookings?message=Booking request for ' + tourData.name + ' submitted successfully! We will confirm shortly.');
}
