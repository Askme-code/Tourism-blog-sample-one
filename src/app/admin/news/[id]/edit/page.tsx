
import NewsForm from '@/components/admin/news/NewsForm';
import { updateNewsAction } from '@/lib/actions/newsAdminActions';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import type { Tables } from '@/types/supabase';

export const metadata = {
  title: 'Edit News Article | Admin Panel',
};

async function getNewsArticle(id: string): Promise<Tables<'news_updates'> | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('news_updates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching news article for editing:', error);
    return null;
  }
  return data;
}

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const article = await getNewsArticle(params.id);

  if (!article) {
    notFound();
  }

  const updateNewsActionWithId = updateNewsAction.bind(null, article.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Newspaper className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-headline">Edit News Article: {article.title}</h1>
      </div>
      <NewsForm
        action={updateNewsActionWithId}
        initialData={article}
        submitButtonText="Save Changes"
        formTitle="Update News Article Information"
        formDescription="Modify the details of this news article."
      />
    </div>
  );
}
