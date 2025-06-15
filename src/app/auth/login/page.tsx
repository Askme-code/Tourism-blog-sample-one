
import { Suspense } from 'react';
import LoginForm from './LoginForm'; // The new client component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/icons/Logo";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPageWrapper() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <Logo />
          </Link>
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your tours and bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center space-y-3 p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading form...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Link href="/auth/forgot-password" passHref>
             <button className="text-sm text-muted-foreground hover:text-primary hover:underline focus:outline-none">
                Forgot your password?
             </button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
