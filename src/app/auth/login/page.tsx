
import Link from "next/link";
import { Suspense } from "react"; // Import Suspense
import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/icons/Logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react"; // Added Loader2 for fallback
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

function LoginForm() {
  "use client"; // This component must be a client component

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to");
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error"); // Corrected typo here
  const [state, formAction] = useFormState(signInAction, null);
  const { toast } = useToast();

  useEffect(() => {
    if (message && !errorParam) {
      toast({
        title: "Notification",
        description: message,
      });
    }
    // If errorParam is present, it might be the actual error message or a flag
    // The middleware sends error messages directly in the 'message' param when an error occurs,
    // or sometimes 'error' param can hold the message.
    // Let's adjust to prioritize 'message' if errorParam indicates an error context.
    if (errorParam) { // errorParam could be 'true' or an error string itself
        toast({
            variant: "destructive",
            title: "Error",
            description: message || errorParam, // Use message if available, otherwise errorParam
        });
    }
  }, [message, errorParam, toast]);

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing In..." : "Sign In"}
      </Button>
    );
  }

  return (
    <>
      {state?.error && !state.errors && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Login Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      {/* The useEffect hook now handles toasts for messages/errors from query params */}
      <form action={formAction} className="space-y-4">
        {redirectTo && <input type="hidden" name="redirect_to" value={redirectTo} />}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          {state?.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
          {state?.errors?.password && <p className="text-sm text-destructive mt-1">{state.errors.password[0]}</p>}
        </div>
        <SubmitButton />
      </form>
    </>
  );
}

export default function LoginPage() {
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
             <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                Forgot your password?
             </Button>
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
