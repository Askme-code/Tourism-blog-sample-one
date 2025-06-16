
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
  pathname: z.string().optional(), // Added for redirect flexibility
});

export async function submitBookingAction(prevState: any, formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = formData.get('pathname') as string || '/';

  if (!user) {
    return redirect(`/auth/login?message=Please log in to book a tour.&redirect_to=${pathname}`);
  }

  // Verify user exists in public.users table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching user profile for booking:', profileError);
    return {
      error: true,
      message: 'There was an error verifying your user profile. Please try again or contact support.',
      errors: null,
    };
  }

  if (!userProfile) {
    console.warn(`Booking attempt by authenticated user ${user.id} failed: No corresponding profile in public.users.`);
    return {
      error: true,
      message: 'Your user profile is not fully set up. Please try logging out and back in, or contact support if the issue persists.',
      errors: null,
    };
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

  const totalPrice = tourData.price ? Number(tourData.price) * number_of_people : null;
  const formattedTourDate = new Date(tour_date).toISOString().split('T')[0]; // Format as YYYY-MM-DD

  const { error: bookingError } = await supabase.from('bookings').insert({
    user_id: user.id, // This ID is now confirmed to exist in public.users
    tour_id: tourId,
    tour_date: formattedTourDate, // Use YYYY-MM-DD formatted date
    number_of_people: number_of_people,
    status: 'pending', // Default status
    total_price: totalPrice,
    notes: notes || null,
    booking_date: new Date().toISOString(),
  });

  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    // Check for specific foreign key violation on tour_id, though less likely if tourData was fetched
    if (bookingError.message.includes("bookings_tour_id_fkey")) {
         return {
            error: true,
            message: 'The selected tour is no longer available or valid. Please refresh and try again.',
            errors: null,
         };
    }
    return {
      error: true,
      message: bookingError.message || 'Could not submit your booking request. Please try again.',
      errors: null,
    };
  }

  revalidatePath('/bookings');
  revalidatePath(`/tours/${tourId}`);
  redirect(`/bookings?message=Booking request for "${tourData.name}" submitted successfully! We will confirm shortly.`);
}

