import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Palmtree, Sun, Waves } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-primary/10">
        <div className="absolute inset-0 opacity-30">
          <Image 
            src="https://placehold.co/1600x800.png?text=Zanzibar+Team" 
            alt="Zanzibar Free Tours Team" 
            layout="fill" 
            objectFit="cover" 
            className="animate-pulse-slow"
            data-ai-hint="team Zanzibar"
          />
        </div>
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-headline text-primary mb-4">About Zanzibar Free Tours</h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto font-body">
            Your gateway to authentic Zanzibar experiences. We are passionate about sharing the beauty, culture, and history of our island paradise.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-headline text-foreground mb-6">Our Mission</h2>
              <p className="text-foreground/80 mb-4 font-body">
                At Zanzibar Free Tours, our mission is to provide an unparalleled window into the soul of Zanzibar. We believe that travel should be enriching, accessible, and sustainable. We strive to connect visitors with the local culture, traditions, and natural wonders in a way that benefits both our guests and the community.
              </p>
              <p className="text-foreground/80 font-body">
                We are committed to offering high-quality, informative, and engaging tours led by knowledgeable local guides. Our "free tour" concept is based on a pay-what-you-feel model for select introductory tours, ensuring everyone has the opportunity to experience Zanzibar, while also offering a range of specialized and private tours for deeper exploration.
              </p>
              <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/tours">Explore Our Tours</Link>
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image 
                src="https://placehold.co/600x450.png?text=Local+Guide" 
                alt="Local guide smiling" 
                width={600} 
                height={450} 
                className="transition-transform duration-500 hover:scale-105"
                data-ai-hint="local guide"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl font-headline text-foreground mb-10">Why Choose Us?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: 'Expert Local Guides', description: 'Passionate guides who share authentic insights.' },
              { icon: Palmtree, title: 'Authentic Experiences', description: 'Connect with Zanzibar\'s true culture and nature.' },
              { icon: Sun, title: 'Flexible Options', description: 'From free tours to private adventures, we have you covered.' },
              { icon: Waves, title: 'Sustainable Tourism', description: 'We support local communities and eco-friendly practices.' },
            ].map((item, index) => (
              <Card key={index} className="text-center p-6 shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/20 rounded-full inline-block mb-4">
                    <item.icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 text-sm font-body">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-center bg-primary text-primary-foreground">
        <div className="container">
          <h2 className="text-3xl font-headline mb-4">Ready to Explore Zanzibar?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto font-body opacity-90">
            Let us show you the wonders of our island. Book your tour today and create memories that will last a lifetime.
          </p>
          <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold" asChild>
            <Link href="/book-tour">Book a Tour Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
