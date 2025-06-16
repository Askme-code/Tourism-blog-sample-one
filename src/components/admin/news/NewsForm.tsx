
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Loader2, Save, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import type { NewsFormState } from '@/lib/actions/newsAdminActions';
import type { Tables } from '@/types/supabase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';


interface NewsFormProps {
  action: (prevState: NewsFormState | undefined, formData: FormData) => Promise<NewsFormState>;
  initialData?: Tables<'news_updates'> | null;
  submitButtonText?: string;
  formTitle?: string;
  formDescription?: string;
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" /> {text}
        </>
      )}
    </Button>
  );
}

export default function NewsForm({
  action,
  initialData,
  submitButtonText = "Create Article",
  formTitle = "Create New News Article",
  formDescription = "Fill in the details for the news article."
}: NewsFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const [publishDate, setPublishDate] = useState<Date | undefined>(
    initialData?.publish_date ? parseISO(initialData.publish_date) : undefined
  );

  useEffect(() => {
    if (initialData?.publish_date) {
      setPublishDate(parseISO(initialData.publish_date));
    }
  }, [initialData]);

  const findErrorForField = (fieldName: string) => {
    return state?.errors?.find(err => err.path.includes(fieldName))?.message;
  };
  
  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{formTitle}</CardTitle>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.message && !state.errors && (
          <Alert variant={state.error ? 'destructive' : 'default'} className="mb-4">
            {state.error ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
            <AlertTitle>{state.error ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <form action={formAction} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={initialData?.title || ''} required className="mt-1" />
            {findErrorForField('title') && <p className="text-sm text-destructive mt-1">{findErrorForField('title')}</p>}
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" name="content" defaultValue={initialData?.content || ''} required rows={8} className="mt-1" />
            {findErrorForField('content') && <p className="text-sm text-destructive mt-1">{findErrorForField('content')}</p>}
          </div>

          <div>
            <Label htmlFor="publish_date">Publish Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !publishDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={publishDate}
                  onSelect={setPublishDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name="publish_date" value={publishDate ? format(publishDate, 'yyyy-MM-dd') : ''} />
            {findErrorForField('publish_date') && <p className="text-sm text-destructive mt-1">{findErrorForField('publish_date')}</p>}
          </div>

          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Input id="category" name="category" defaultValue={initialData?.category || ''} placeholder="e.g., Announcement, Event" className="mt-1" />
            {findErrorForField('category') && <p className="text-sm text-destructive mt-1">{findErrorForField('category')}</p>}
          </div>
          
          <CardFooter className="px-0 pt-6 flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/admin/news">Cancel</Link>
            </Button>
            <SubmitButton text={submitButtonText} />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
