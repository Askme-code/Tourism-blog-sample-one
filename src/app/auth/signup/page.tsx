
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/icons/Logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating Account..." : "Create Account"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signUpAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
             <Logo />
          </Link>
          <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join Zanzibar Free Tours today!</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.message && (
            <Alert variant={state.error ? "destructive" : "default"} className="mb-4 bg-opacity-80">
              {state.error ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
              <AlertTitle>{state.error ? "Signup Failed" : "Success"}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          {!state?.message || state?.error ? (
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required />
                {state?.errors?.fullName && <p className="text-sm text-destructive mt-1">{state.errors.fullName[0]}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                {state?.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="•••••••• (min. 8 characters)" required />
                {state?.errors?.password && <p className="text-sm text-destructive mt-1">{state.errors.password[0]}</p>}
              </div>
              <SubmitButton />
            </form>
          ) : null}
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
