
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { TablesInsert } from '@/types/supabase';

const TourSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  location: z.string().min(3, { message: "Location is required." }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }).optional().nullable(),
  duration_hours: z.coerce.number().min(0.5, { message: "Duration must be at least 0.5 hours." }).optional().nullable(),
  image_url: z.string().url({ message: "Please enter a valid URL for the image." }).optional().nullable(),
  status: z.enum(['available', 'unavailable', 'draft'], { message: "Invalid status." }),
});

export type TourFormState = {
  message?: string;
  errors?: z.ZodIssue[];
  error?: boolean;
  tour?: TablesInsert<'tours'>;
};

export async function createTourAction(prevState: TourFormState | undefined, formData: FormData): Promise<TourFormState> {
  const supabase = createClient();

  const validatedFields = TourSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    location: formData.get('location'),
    price: formData.get('price') ? Number(formData.get('price')) : null,
    duration_hours: formData.get('duration_hours') ? Number(formData.get('duration_hours')) : null,
    image_url: formData.get('image_url'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.issues,
      error: true,
    };
  }

  const tourData: TablesInsert<'tours'> = {
    ...validatedFields.data,
    // Ensure price and duration_hours are explicitly null if not provided or zero,
    // or handle them as per your DB schema (e.g., default values).
    // The coercion to number and optional().nullable() in Zod handles this.
  };

  const { error } = await supabase.from('tours').insert(tourData);

  if (error) {
    console.error("Error creating tour:", error);
    return {
      message: error.message || "Failed to create tour. Please try again.",
      error: true,
    };
  }

  revalidatePath('/admin/tours');
  revalidatePath('/'); // Also revalidate homepage if it shows tours
  redirect('/admin/tours?message=Tour created successfully!');
}

export async function updateTourAction(id: string, prevState: TourFormState | undefined, formData: FormData): Promise<TourFormState> {
  const supabase = createClient();

  const validatedFields = TourSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    location: formData.get('location'),
    price: formData.get('price') ? Number(formData.get('price')) : null,
    duration_hours: formData.get('duration_hours') ? Number(formData.get('duration_hours')) : null,
    image_url: formData.get('image_url'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.issues,
      error: true,
    };
  }
  
  const tourData: TablesInsert<'tours'> = {
    ...validatedFields.data,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('tours').update(tourData).eq('id', id);

  if (error) {
    console.error(`Error updating tour ${id}:`, error);
    return {
      message: error.message || "Failed to update tour. Please try again.",
      error: true,
    };
  }

  revalidatePath('/admin/tours');
  revalidatePath(`/admin/tours/${id}/edit`);
  revalidatePath(`/tours/${id}`);
  revalidatePath('/');
  redirect(`/admin/tours?message=Tour updated successfully!`);
}


export async function deleteTourAction(id: string): Promise<{ error?: string, success?: string }>{
  const supabase = createClient();
  
  // Optional: Check if tour has associated bookings that need handling
  // For now, direct delete. Add cascade delete in DB or handle related data here if needed.

  const { error } = await supabase.from('tours').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting tour ${id}:`, error);
    return { error: error.message || "Failed to delete tour." };
  }

  revalidatePath('/admin/tours');
  revalidatePath('/');
  return { success: "Tour deleted successfully!" };
}
