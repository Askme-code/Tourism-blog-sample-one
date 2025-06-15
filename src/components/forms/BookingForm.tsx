
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitBookingAction } from "@/lib/actions/booking";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarDays, AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";


interface BookingFormProps {
  tourId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={pending}>
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

export default function BookingForm({ tourId }: BookingFormProps) {
  const initialState = { message: null, errors: null, error: false };
  const [state, formAction] = useFormState(submitBookingAction, initialState);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    // This effect handles general success/error messages returned from the server action
    // that are not Zod validation errors and when no redirect happens.
    if (state?.message && state.error && !state.errors) {
      toast({
        title: "Booking Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);


  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tourId" value={tourId} />
      <input type="hidden" name="pathname" value={pathname} />

      {state?.error && state.message && !state.errors && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Booking Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
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
          placeholder="Any special requests or notes..." 
          rows={3} 
          className="mt-1" 
          aria-describedby="notes_error"
        />
         {state?.errors?.notes && <p id="notes_error" className="text-sm text-destructive mt-1">{state.errors.notes[0]}</p>}
      </div>
      <SubmitButton />
      <p className="text-xs text-muted-foreground text-center">
        Your booking is a request and will be confirmed via email.
      </p>
    </form>
  );
}

