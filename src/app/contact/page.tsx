
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

// Placeholder for server action
async function submitContactForm(prevState: any, formData: FormData) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  if (!name || !email || !message) {
    return { success: false, message: "Please fill in all fields.", errors: null };
  }
  // In a real app, you would send this data to your backend or an email service
  console.log({ name, email, message });
  
  // For demonstration, always return success
  return { success: true, message: "Your message has been sent successfully! We'll get back to you soon.", errors: null };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={pending}>
      {pending ? (
        <>
          <Send className="mr-2 h-4 w-4 animate-pulse" /> Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Send Message
        </>
      )}
    </Button>
  );
}


export default function ContactPage() {
  const [state, formAction] = useActionState(submitContactForm, null);

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-primary/10">
         <div className="absolute inset-0 opacity-20">
          <Image 
            src="https://placehold.co/1600x600.png?text=Zanzibar+Contact" 
            alt="Zanzibar Contact Background" 
            fill
            objectFit="cover"
            data-ai-hint="tropical island contact"
          />
        </div>
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-headline text-primary mb-4">Get In Touch</h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto font-body">
            We&apos;d love to hear from you! Whether you have questions, feedback, or want to book a special tour, our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form Card */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl md:text-3xl">Send Us a Message</CardTitle>
                <CardDescription>Fill out the form below and we&apos;ll get back to you as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                {state?.message && (
                  <Alert variant={state.success ? "default" : "destructive"} className="mb-4">
                    {state.success ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4" />}
                    <AlertTitle>{state.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
                )}
                <form action={formAction} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" type="text" placeholder="Your Name" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input id="subject" name="subject" type="text" placeholder="Tour Inquiry" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" placeholder="Your message here..." required rows={5} className="mt-1" />
                  </div>
                  <SubmitButton />
                </form>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="shadow-xl bg-muted/30">
              <CardHeader>
                <CardTitle className="font-headline text-2xl md:text-3xl">Contact Information</CardTitle>
                <CardDescription>Reach out to us directly through these channels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-primary/20 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Our Office</h4>
                    <p className="text-foreground/80">123 Beach Road, Stone Town, Zanzibar</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-primary/20 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Email Us</h4>
                    <a href="mailto:info@zanzibarfreetours.com" className="text-primary hover:underline">info@zanzibarfreetours.com</a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-primary/20 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Call Us</h4>
                    <a href="tel:+255777123456" className="text-primary hover:underline">+255 777 123 456</a>
                  </div>
                </div>
                <div>
                    <h4 className="font-semibold text-lg text-foreground mb-2">Business Hours</h4>
                    <p className="text-foreground/80">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="text-foreground/80">Saturday: 10:00 AM - 3:00 PM</p>
                    <p className="text-foreground/80">Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Map Section - Placeholder */}
      <section className="h-[400px] bg-gray-300">
        <div className="container h-full flex items-center justify-center">
           {/* Replace with an actual map embed (e.g., Google Maps iframe) */}
           <Image 
            src="https://placehold.co/1200x400.png?text=Map+to+Our+Office" 
            alt="Map to Zanzibar Free Tours office" 
            width={1200} 
            height={400} 
            className="object-cover w-full h-full rounded-lg shadow-md"
            data-ai-hint="map zanzibar"
          />
        </div>
      </section>
    </div>
  );
}
