
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { TablesInsert, Tables } from '@/types/supabase';

const NewsSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  publish_date: z.string().optional().nullable().refine(val => val === null || val === '' || !isNaN(Date.parse(val)), { message: "Invalid publish date." }),
  category: z.string().optional().nullable(),
});

export type NewsFormState = {
  message?: string;
  errors?: z.ZodIssue[];
  error?: boolean;
  news_item?: Tables<'news_updates'>; // For pre-filling form in case of error or for edit
};

export async function createNewsAction(prevState: NewsFormState | undefined, formData: FormData): Promise<NewsFormState> {
  const supabase = createClient();

  const validatedFields = NewsSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    publish_date: formData.get('publish_date') || null, // Ensure null if empty
    category: formData.get('category') || null,
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.issues,
      error: true,
    };
  }

  const newsData: TablesInsert<'news_updates'> = {
    ...validatedFields.data,
    publish_date: validatedFields.data.publish_date ? new Date(validatedFields.data.publish_date).toISOString() : null,
  };

  const { error } = await supabase.from('news_updates').insert(newsData);

  if (error) {
    console.error("Error creating news article:", error);
    return {
      message: error.message || "Failed to create news article. Please try again.",
      error: true,
    };
  }

  revalidatePath('/admin/news');
  revalidatePath('/'); // Also revalidate homepage if it shows news
  redirect('/admin/news?message=News article created successfully!');
}

export async function updateNewsAction(id: string, prevState: NewsFormState | undefined, formData: FormData): Promise<NewsFormState> {
  const supabase = createClient();

  const validatedFields = NewsSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    publish_date: formData.get('publish_date') || null,
    category: formData.get('category') || null,
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.issues,
      error: true,
      news_item: { id, ...Object.fromEntries(formData.entries()) } as Tables<'news_updates'> // Send back current form data
    };
  }
  
  const newsData: TablesInsert<'news_updates'> = {
    ...validatedFields.data,
    publish_date: validatedFields.data.publish_date ? new Date(validatedFields.data.publish_date).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('news_updates').update(newsData).eq('id', id);

  if (error) {
    console.error(`Error updating news article ${id}:`, error);
    return {
      message: error.message || "Failed to update news article. Please try again.",
      error: true,
      news_item: { id, ...Object.fromEntries(formData.entries()) } as Tables<'news_updates'>
    };
  }

  revalidatePath('/admin/news');
  revalidatePath(`/admin/news/${id}/edit`);
  revalidatePath('/'); // Revalidate relevant public pages
  redirect(`/admin/news?message=News article updated successfully!`);
}


export async function deleteNewsAction(id: string): Promise<{ error?: string, success?: string }>{
  const supabase = createClient();
  
  const { error } = await supabase.from('news_updates').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting news article ${id}:`, error);
    return { error: error.message || "Failed to delete news article." };
  }

  revalidatePath('/admin/news');
  revalidatePath('/');
  return { success: "News article deleted successfully!" };
}
