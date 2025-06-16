
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Newspaper } from 'lucide-react';
import type { Tables } from '@/types/supabase';
import { DeleteNewsButton } from '@/components/admin/news/NewsClientActions';
import QueryParamToast from '@/components/utility/QueryParamToast';
import { Suspense } from 'react';
import { format } from 'date-fns';

async function getNewsArticles() {
  const supabase = createClient();
  const { data: news, error } = await supabase
    .from('news_updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news articles for admin:', error);
    return [];
  }
  return news;
}

export const metadata = {
  title: 'Manage News | Admin Panel',
};

export default async function ManageNewsPage() {
  const newsArticles: Tables<'news_updates'>[] = await getNewsArticles();

  return (
    <div className="space-y-6">
      <Suspense fallback={null}><QueryParamToast /></Suspense>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-headline">Manage News</h1>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Article
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All News Articles</CardTitle>
          <CardDescription>View, edit, or delete existing news articles.</CardDescription>
        </CardHeader>
        <CardContent>
          {newsArticles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No news articles found. Get started by creating one!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Publish Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        {article.category ? <Badge variant="secondary">{article.category}</Badge> : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {article.publish_date ? format(new Date(article.publish_date), 'PPP') : 'Not set'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/news/${article.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </Button>
                        <DeleteNewsButton newsId={article.id} newsTitle={article.title} />
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
