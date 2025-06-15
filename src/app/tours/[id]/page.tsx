import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, DollarSign, Info, MapPin, MessageSquare, Star, Users, ChevronLeft, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type TourPageProps = {
  params: { id: string };
};

async function getTourDetails(id: string) {
  const supabase = createClient();
  const { data: tour, error } = await supabase
    .from('tours')
    .select(`
      *,
      user_reviews (
        id,
        rating,
        comment,
        created_at,
        users ( id, full_name, email )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !tour) {
    console.error('Error fetching tour details:', error);
    return null;
  }
  return tour;
}

// Placeholder for booking action
async function submitBooking(formData: FormData) {
  "use server";
  // TODO: Implement actual booking logic
  console.log("Booking submitted:", Object.fromEntries(formData.entries()));
  // Redirect or show success message
}

// Placeholder for review action
async function submitReview(formData: FormData) {
  "use server";
  // TODO: Implement actual review submission logic
  console.log("Review submitted:", Object.fromEntries(formData.entries()));
  // Redirect or show success message
}


export default async function TourDetailPage({ params }: TourPageProps) {
  const tour = await getTourDetails(params.id);

  if (!tour) {
    notFound();
  }
  
  const typedTour = tour as typeof tour & { user_reviews: Array<typeof tour.user_reviews[0] & { users: {id: string, full_name: string | null, email: string} | null }>};


  const averageRating = typedTour.user_reviews && typedTour.user_reviews.length > 0
    ? typedTour.user_reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / typedTour.user_reviews.length
    : 0;

  return (
    <div className="bg-background text-foreground">
      <div className="container py-8 md:py-12">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/tours">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Tours
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Image Gallery & Main Info */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="p-0 relative aspect-[16/10]">
                <Image
                  src={tour.image_url || `https://placehold.co/800x500.png?text=${encodeURIComponent(tour.name)}`}
                  alt={tour.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                  data-ai-hint="tour detail"
                />
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <h1 className="font-headline text-3xl md:text-4xl text-primary mb-3">{tour.name}</h1>
                <div className="flex items-center space-x-4 mb-4 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-accent" />
                    <span>{tour.location || 'Zanzibar'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-accent" />
                    <span>{tour.duration_hours ? `${tour.duration_hours} hours` : 'Varies'}</span>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-1 text-amber-400 fill-amber-400" />
                      <span>{averageRating.toFixed(1)} ({typedTour.user_reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
                
                <div className="prose prose-sm sm:prose-base max-w-none font-body text-foreground/90">
                  <h2 className="font-headline text-2xl mt-6 mb-3 text-foreground">Tour Description</h2>
                  <p>{tour.description || 'No description available for this tour.'}</p>
                </div>

                {/* Potential sections for Itinerary, Inclusions, Exclusions can be added here */}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Booking & Price */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-xl sticky top-24"> {/* Sticky for booking form */}
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Book This Tour</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary mb-4">
                  ${tour.price ? Number(tour.price).toFixed(2) : 'Contact Us'}
                  {tour.price && <span className="text-sm font-normal text-muted-foreground"> / person</span>}
                </div>
                
                <form action={submitBooking} className="space-y-4">
                  <input type="hidden" name="tourId" value={tour.id} />
                  <div>
                    <Label htmlFor="tour_date">Select Date</Label>
                    <Input type="date" id="tour_date" name="tour_date" required 
                           min={new Date().toISOString().split('T')[0]} 
                           className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="number_of_people">Number of People</Label>
                    <Input type="number" id="number_of_people" name="number_of_people" defaultValue="1" min="1" required className="mt-1" />
                  </div>
                   <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea id="notes" name="notes" placeholder="Any special requests or notes..." rows={3} className="mt-1" />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <CalendarDays className="mr-2 h-5 w-5" /> Request Booking
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center">
                  Your booking is a request and will be confirmed via email.
                </p>
              </CardContent>
            </Card>

             {/* Tour Highlights/Info Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Tour Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-primary" /> Price from ${Number(tour.price || 0).toFixed(2)}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" /> Suitable for small groups
                </div>
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-primary" /> English speaking guide
                </div>
                 <div className="flex items-center">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{tour.status || 'Available'}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12 md:mt-16">
          <h2 className="font-headline text-3xl text-center mb-8">What Our Guests Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Review Form Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Leave a Review</CardTitle>
                <CardDescription>Share your experience with this tour!</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={submitReview} className="space-y-4">
                  <input type="hidden" name="tourId" value={tour.id} />
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Button key={star} type="button" variant="ghost" size="icon" name="rating_star" value={star} 
                                onClick={(e) => {
                                  // Basic star rating logic, can be improved with state
                                  const ratingInput = document.getElementById('rating_value') as HTMLInputElement;
                                  if (ratingInput) ratingInput.value = String(star);
                                  
                                  const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
                                  buttons?.forEach((btn, index) => {
                                    const svg = btn.querySelector('svg');
                                    if (svg) {
                                      if (index < star) {
                                        svg.classList.add('fill-amber-400', 'text-amber-400');
                                      } else {
                                        svg.classList.remove('fill-amber-400', 'text-amber-400');
                                      }
                                    }
                                  });
                                }}>
                          <Star className="h-6 w-6 text-muted-foreground transition-colors hover:text-amber-400" />
                        </Button>
                      ))}
                    </div>
                    <input type="hidden" id="rating_value" name="rating" />
                  </div>
                  <div>
                    <Label htmlFor="comment">Your Review</Label>
                    <Textarea id="comment" name="comment" placeholder="Tell us about your experience..." required rows={4} className="mt-1" />
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Edit3 className="mr-2 h-4 w-4" /> Submit Review
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Reviews */}
            {typedTour.user_reviews && typedTour.user_reviews.length > 0 ? (
              typedTour.user_reviews.map(review => (
                <Card key={review.id} className="shadow-lg">
                  <CardHeader className="flex flex-row items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${review.users?.full_name?.[0] || 'U'}`} data-ai-hint="avatar person" />
                      <AvatarFallback>{review.users?.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-md">{review.users?.full_name || 'Anonymous'}</CardTitle>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < (review.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                        ))}
                         <span className="ml-2 text-xs text-muted-foreground">
                          {new Date(review.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg md:col-span-1 flex items-center justify-center min-h-[200px]">
                 <CardContent className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                    <p>No reviews yet for this tour. Be the first to share your experience!</p>
                 </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
