"use client";

import { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { createClient } from '@/lib/supabase/client'; // Use client for interactive filtering
import { MapPin, Search, Tag, Clock, FilterX, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Tables } from '@/types/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type Tour = Tables<'tours'>;

function TourFiltersAndList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [duration, setDuration] = useState(searchParams.get('duration') || 'any');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice') || 0),
    Number(searchParams.get('maxPrice') || 500)
  ]);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tours:', error);
        setTours([]);
      } else {
        setTours(data || []);
      }
      setLoading(false);
    };
    fetchTours();
  }, []);

  useEffect(() => {
    let currentFilteredTours = [...tours];

    if (searchTerm) {
      currentFilteredTours = currentFilteredTours.filter(tour =>
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tour.description && tour.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (location) {
      currentFilteredTours = currentFilteredTours.filter(tour =>
        tour.location && tour.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (duration !== 'any') {
      currentFilteredTours = currentFilteredTours.filter(tour => {
        if (!tour.duration_hours) return false;
        if (duration === 'short' && tour.duration_hours <= 4) return true; // Up to 4 hours
        if (duration === 'medium' && tour.duration_hours > 4 && tour.duration_hours <= 8) return true; // 4-8 hours
        if (duration === 'long' && tour.duration_hours > 8) return true; // Over 8 hours
        return false;
      });
    }
    
    currentFilteredTours = currentFilteredTours.filter(tour => {
      const price = tour.price ? Number(tour.price) : 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    setFilteredTours(currentFilteredTours);

    // Update URL query params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
    if (duration !== 'any') params.set('duration', duration);
    params.set('minPrice', String(priceRange[0]));
    params.set('maxPrice', String(priceRange[1]));
    router.replace(`/tours?${params.toString()}`, { scroll: false });

  }, [searchTerm, location, duration, priceRange, tours, router]);

  const resetFilters = () => {
    setSearchTerm('');
    setLocation('');
    setDuration('any');
    setPriceRange([0, 500]);
  };

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-headline text-center mb-10">Explore Our Tours</h1>
      
      {/* Filters Section */}
      <Card className="mb-8 p-4 md:p-6 shadow-lg bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="search" className="font-semibold">Search Tours</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text" 
                id="search" 
                placeholder="Keywords (e.g. Stone Town, Spice Farm)" 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location" className="font-semibold">Location</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text" 
                id="location" 
                placeholder="e.g. Nungwi, Stone Town" 
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="duration-filter" className="font-semibold">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration-filter" className="mt-1">
                <SelectValue placeholder="Any Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Duration</SelectItem>
                <SelectItem value="short">Short (Up to 4h)</SelectItem>
                <SelectItem value="medium">Medium (4-8h)</SelectItem>
                <SelectItem value="long">Long (8h+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Label htmlFor="price-range" className="font-semibold">Price Range: ${priceRange[0]} - ${priceRange[1] === 500 ? '500+' : priceRange[1]}</Label>
            <Slider
              id="price-range"
              min={0}
              max={500} // Assuming max price for slider, adjust as needed
              step={10}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mt-2"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={resetFilters}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
        </div>
      </Card>

      {/* Tours Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-lg flex flex-col">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="pt-6 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-t">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-10 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group">
              <CardHeader className="p-0">
                <div className="aspect-video relative overflow-hidden">
                  <Image 
                    src={tour.image_url || `https://placehold.co/600x400.png?text=${encodeURIComponent(tour.name)}`} 
                    alt={tour.name} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint="tour landscape"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <CardTitle className="text-xl font-headline mb-2 group-hover:text-primary transition-colors">{tour.name}</CardTitle>
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
        <div className="text-center py-12">
          <FilterX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-foreground">No Tours Found</p>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
          <Button variant="outline" onClick={resetFilters} className="mt-6">
            <RotateCcw className="mr-2 h-4 w-4" /> Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}


export default function ToursPage() {
  return (
    // Suspense boundary for client components that use useSearchParams
    <Suspense fallback={<div>Loading tours...</div>}>
      <TourFiltersAndList />
    </Suspense>
  );
}
