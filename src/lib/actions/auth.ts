"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const emailSchema = z.string().email({ message: "Invalid email address." });
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." });

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, { message: "Full name is required." }),
});

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export async function signUpAction(prevState: any, formData: FormData) {
  const supabase = createClient();
  const origin = headers().get("origin");

  const result = signUpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return {
      error: true,
      message: "Invalid form data.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password, fullName } = result.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        // Role is 'user' by default as per DB schema
      },
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    return {
      error: true,
      message: error.message || "Could not authenticate user.",
    };
  }

  return {
    error: false,
    message: "Check your email for a confirmation link.",
  };
}

export async function signInAction(prevState: any, formData: FormData) {
  const supabase = createClient();
  const redirectTo = formData.get("redirect_to") as string || "/";

  const result = signInSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return {
      error: true,
      message: "Invalid form data.",
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  const { email, password } = result.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    return {
      error: true,
      message: error.message || "Could not authenticate user.",
    };
  }

  return redirect(redirectTo);
}

export async function signOutAction() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    return {
      error: true,
      message: "Could not sign out user.",
    };
  }
  
  return redirect("/auth/login?message=Successfully logged out.");
}

export async function sendPasswordResetEmailAction(prevState: any, formData: FormData) {
  const supabase = createClient();
  const origin = headers().get("origin");
  const email = formData.get("email") as string;

  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return {
      error: true,
      message: "Invalid email address.",
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    console.error("Password reset error:", error);
    return {
      error: true,
      message: error.message || "Could not send password reset email.",
    };
  }

  return {
    error: false,
    message: "Password reset email sent. Please check your inbox.",
  };
}

export async function updateUserPasswordAction(prevState: any, formData: FormData) {
  const supabase = createClient();
  const password = formData.get("password") as string;

  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return {
      error: true,
      message: "Invalid password.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Update password error:", error);
    return {
      error: true,
      message: error.message || "Could not update password.",
    };
  }
  return redirect("/profile?message=Password updated successfully.");
}
