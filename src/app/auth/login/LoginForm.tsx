
"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { signInAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to");
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");
  const [state, formAction] = useActionState(signInAction, null);
  const { toast } = useToast();

  useEffect(() => {
    if (message && !errorParam) {
      toast({
        title: "Notification",
        description: message,
      });
    }
    if (errorParam) {
        toast({
            variant: "destructive",
            title: "Error",
            description: message || errorParam,
        });
    }
  }, [message, errorParam, toast]);

  return (
    <>
      {state?.error && !state.errors && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Login Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
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
