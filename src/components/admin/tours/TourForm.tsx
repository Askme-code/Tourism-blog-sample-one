
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import type { TourFormState } from '@/lib/actions/tourAdminActions';
import type { Tables } from '@/types/supabase';

interface TourFormProps {
  action: (prevState: TourFormState | undefined, formData: FormData) => Promise<TourFormState>;
  initialData?: Tables<'tours'> | null;
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

export default function TourForm({
  action,
  initialData,
  submitButtonText = "Create Tour",
  formTitle = "Create New Tour",
  formDescription = "Fill in the details to add a new tour."
}: TourFormProps) {
  const [state, formAction] = useActionState(action, undefined);

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
            <Label htmlFor="name">Tour Name</Label>
            <Input id="name" name="name" defaultValue={initialData?.name || ''} required className="mt-1" />
            {findErrorForField('name') && <p className="text-sm text-destructive mt-1">{findErrorForField('name')}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description || ''} required rows={4} className="mt-1" />
            {findErrorForField('description') && <p className="text-sm text-destructive mt-1">{findErrorForField('description')}</p>}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={initialData?.location || ''} required className="mt-1" />
            {findErrorForField('location') && <p className="text-sm text-destructive mt-1">{findErrorForField('location')}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={initialData?.price?.toString() || ''} placeholder="e.g., 75.50" className="mt-1" />
              {findErrorForField('price') && <p className="text-sm text-destructive mt-1">{findErrorForField('price')}</p>}
            </div>
            <div>
              <Label htmlFor="duration_hours">Duration (Hours)</Label>
              <Input id="duration_hours" name="duration_hours" type="number" step="0.5" defaultValue={initialData?.duration_hours?.toString() || ''} placeholder="e.g., 4.5" className="mt-1" />
              {findErrorForField('duration_hours') && <p className="text-sm text-destructive mt-1">{findErrorForField('duration_hours')}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" type="url" defaultValue={initialData?.image_url || ''} placeholder="https://example.com/image.jpg" className="mt-1" />
            {findErrorForField('image_url') && <p className="text-sm text-destructive mt-1">{findErrorForField('image_url')}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={initialData?.status || 'draft'} required>
              <SelectTrigger id="status" className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            {findErrorForField('status') && <p className="text-sm text-destructive mt-1">{findErrorForField('status')}</p>}
          </div>
          
          <CardFooter className="px-0 pt-6 flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/admin/tours">Cancel</Link>
            </Button>
            <SubmitButton text={submitButtonText} />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
