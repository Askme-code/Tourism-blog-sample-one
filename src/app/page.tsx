import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/server";
import { MapPin, CalendarDays, Users, Search, Tag, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getTours() {
  const supabase = createClient();
  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
  return tours;
}

export default async function Home() {
  const tours = await getTours();

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://placehold.co/1600x900.png?text=Zanzibar+Beach')" }} data-ai-hint="tropical beach sunset">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 p-4 text-white">
          <h1 className="text-4xl md:text-6xl font-headline mb-4 drop-shadow-lg">Discover Zanzibar With Us</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md font-body">
            Unforgettable adventures await. Explore pristine beaches, rich culture, and breathtaking landscapes.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href="/tours">Explore Tours</Link>
          </Button>
        </div>
      </section>

      {/* Search & Filter Bar - Simplified for Homepage */}
      <section className="py-8 md:py-12 bg-background sticky top-16 z-40 shadow-sm">
        <div className="container">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end p-6 bg-card rounded-lg shadow-lg">
            <div>
              <Label htmlFor="destination" className="sr-only">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" id="destination" name="destination" placeholder="Search destination..." className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="duration" className="sr-only">Duration</Label>
               <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Select name="duration">
                  <SelectTrigger id="duration" className="pl-10">
                    <SelectValue placeholder="Any Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="half-day">Half-day</SelectItem>
                    <SelectItem value="full-day">Full-day</SelectItem>
                    <SelectItem value="multi-day">Multi-day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="price-range" className="sr-only">Price Range</Label>
               <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Select name="price-range">
                  <SelectTrigger id="price-range" className="pl-10">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-50">$0 - $50</SelectItem>
                    <SelectItem value="51-100">$51 - $100</SelectItem>
                    <SelectItem value="101+">$101+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full lg:w-auto bg-accent hover:bg-accent/90">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>
        </div>
      </section>

      {/* Tours Listing Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-headline text-center mb-10">Popular Tours & Safaris</h2>
          {tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <Card key={tour.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <CardHeader className="p-0">
                    <div className="aspect-video relative">
                      <Image 
                        src={tour.image_url || `https://placehold.co/600x400.png?text=${encodeURIComponent(tour.name)}`} 
                        alt={tour.name} 
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="tour landscape"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow">
                    <CardTitle className="text-xl font-headline mb-2">{tour.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                      {tour.location || 'Zanzibar'}
                    </div>
                    <CardDescription className="text-sm line-clamp-3 mb-3">
                      {tour.description || 'An amazing tour experience awaits you.'}
                    </CardDescription>
                     <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1.5 text-primary" />
                        {tour.duration_hours ? `${tour.duration_hours} hours` : 'Varies'}
                      </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-4 border-t">
                    <p className="text-lg font-semibold text-primary">
                      ${tour.price ? Number(tour.price).toFixed(2) : 'Contact us'}
                    </p>
                    <Button asChild variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href={`/tours/${tour.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No tours available at the moment. Please check back later!</p>
          )}
           <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/tours">View All Tours</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* News & Updates Section Placeholder */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-headline text-center mb-10">News & Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <Card key={i} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                   <Image src={`https://placehold.co/600x400.png?text=News+Image+${i}`} alt={`News ${i}`} width={600} height={400} className="rounded-t-lg aspect-video object-cover" data-ai-hint="travel news"/>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl font-headline mb-2">Exciting New Spice Tour Launched!</CardTitle>
                  <p className="text-xs text-muted-foreground mb-2">Published on: {new Date().toLocaleDateString()}</p>
                  <CardDescription className="text-sm line-clamp-3">
                    Discover the aromatic wonders of Zanzibar with our newly launched Spice Tour. Immerse yourself in the island's rich history...
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="link" asChild className="text-primary p-0">
                    <Link href={`/news/${i}`}>Read More &rarr;</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
