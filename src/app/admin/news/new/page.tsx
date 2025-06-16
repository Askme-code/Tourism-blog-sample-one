
import NewsForm from '@/components/admin/news/NewsForm';
import { createNewsAction } from '@/lib/actions/newsAdminActions';
import { Newspaper } from 'lucide-react';

export const metadata = {
  title: 'Create New News Article | Admin Panel',
};

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Newspaper className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-headline">Create New News Article</h1>
      </div>
      <NewsForm 
        action={createNewsAction} 
        submitButtonText="Publish Article"
        formTitle="Add a New News Article"
        formDescription="Share updates, announcements, or stories."
      />
    </div>
  );
}
