
'use client';

import { useState, useEffect, useActionState, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { submitBookingAction } from '@/lib/actions/booking';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CalendarDays, Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import type { Tables } from '@/types/supabase';
import { usePathname } from 'next/navigation';
import QueryParamToast from '@/components/utility/QueryParamToast';


type Tour = Tables<'tours'>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Request...
        </>
      ) : (
        <>
          <CalendarDays className="mr-2 h-5 w-5" /> Request Booking
        </>
      )}
    </Button>
  );
}


export default function BookTourPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>(undefined);
  const [loadingTours, setLoadingTours] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  const initialState = { message: null, errors: null, error: false };
  const [state, formAction] = useActionState(submitBookingAction, initialState);

  useEffect(() => {
    const fetchTours = async () => {
      setLoadingTours(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tours')
        .select('id, name, price, status')
        .eq('status', 'available')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching tours:', error);
        toast({
          title: "Error",
          description: "Could not load available tours. Please try again later.",
          variant: "destructive",
        });
        setTours([]);
      } else {
        setTours(data || []);
      }
      setLoadingTours(false);
    };
    fetchTours();
  }, [toast]);
  
  useEffect(() => {
    // Handle server action responses for NON-redirect scenarios (e.g., validation errors)
    if (state?.message && state.error && !state.errors) {
      toast({
        title: "Booking Error",
        description: state.message,
        variant: "destructive",
      });
    }
    // Successful booking redirects are handled by the action and shows message via QueryParamToast on the target page.
    // Login redirects are also handled by the action.
  }, [state, toast]);


  const selectedTour = tours.find(tour => tour.id === selectedTourId);

  return (
    <div className="container py-8 md:py-12">
        <Suspense fallback={null}><QueryParamToast /></Suspense>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-3xl font-headline">Book Your Adventure</CardTitle>
            <CardDescription>Select a tour and fill in your details to request a booking.</CardDescription>
          </CardHeader>
          <CardContent>
            {state?.error && state.message && !state.errors && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Booking Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <form action={formAction} className="space-y-6">
              <input type="hidden" name="pathname" value={pathname} />
              
              <div>
                <Label htmlFor="tourId">Choose a Tour</Label>
                <Select 
                  name="tourId" 
                  required 
                  onValueChange={setSelectedTourId}
                  value={selectedTourId}
                  disabled={loadingTours || tours.length === 0}
                >
                  <SelectTrigger id="tourId" className="mt-1" aria-describedby="tourId_error">
                    <SelectValue placeholder={loadingTours ? "Loading tours..." : "Select a tour"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingTours ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : tours.length === 0 ? (
                       <SelectItem value="no-tours" disabled>No tours available currently.</SelectItem>
                    ) : (
                      tours.map(tour => (
                        <SelectItem key={tour.id} value={tour.id}>
                          {tour.name} {tour.price ? `($${Number(tour.price).toFixed(2)})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {state?.errors?.tourId && <p id="tourId_error" className="text-sm text-destructive mt-1">{state.errors.tourId[0]}</p>}
              </div>

              {selectedTourId && selectedTour && (
                <>
                  <div>
                    <Label htmlFor="tour_date">Select Date</Label>
                    <Input 
                      type="date" 
                      id="tour_date" 
                      name="tour_date" 
                      required 
                      min={new Date().toISOString().split('T')[0]} 
                      className="mt-1" 
                      aria-describedby="tour_date_error"
                    />
                    {state?.errors?.tour_date && <p id="tour_date_error" className="text-sm text-destructive mt-1">{state.errors.tour_date[0]}</p>}
                  </div>
                  <div>
                    <Label htmlFor="number_of_people">Number of People</Label>
                    <Input 
                      type="number" 
                      id="number_of_people" 
                      name="number_of_people" 
                      defaultValue="1" 
                      min="1" 
                      required 
                      className="mt-1" 
                      aria-describedby="number_of_people_error"
                    />
                    {state?.errors?.number_of_people && <p id="number_of_people_error" className="text-sm text-destructive mt-1">{state.errors.number_of_people[0]}</p>}
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      placeholder="Any special requests or information..." 
                      rows={3} 
                      className="mt-1" 
                      aria-describedby="notes_error"
                    />
                    {state?.errors?.notes && <p id="notes_error" className="text-sm text-destructive mt-1">{state.errors.notes[0]}</p>}
                  </div>
                  <SubmitButton />
                  <p className="text-xs text-muted-foreground text-center">
                    Your booking for "{selectedTour.name}" is a request and will be confirmed via email.
                  </p>
                </>
              )}
              {!selectedTourId && tours.length > 0 && !loadingTours && (
                <p className="text-sm text-muted-foreground text-center pt-4">Please select a tour to see booking options.</p>
              )}
               {tours.length === 0 && !loadingTours && (
                <div className="text-center pt-4">
                    <p className="text-muted-foreground mb-4">No tours currently available for booking.</p>
                    <Button variant="outline" asChild>
                        <Link href="/tours">View All Tours</Link>
                    </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    