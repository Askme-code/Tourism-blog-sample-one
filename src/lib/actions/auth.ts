
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

  // Sign up the user in auth.users
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { // This goes into auth.users.user_metadata and raw_user_meta_data
        full_name: fullName,
      },
    },
  });

  if (signUpError) {
    console.error("Sign up error:", signUpError);
    return {
      error: true,
      message: signUpError.message || "Could not authenticate user.",
    };
  }

  // If signup is successful and user object is available, create entry in public.users
  if (authData.user) {
    const { error: publicUserError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Link to auth.users.id
        email: email,
        full_name: fullName,
        password_hash: "managed_by_supabase_auth", // Placeholder for NOT NULL constraint
        // phone can be added later or via profile update
        // role will default to 'user' as per table definition
      });

    if (publicUserError) {
      console.error("Error creating public user profile:", publicUserError);
      // Potentially delete the auth.user if public.user creation fails to keep things consistent?
      // For now, just log error and inform user. This state is problematic.
      // await supabase.auth.admin.deleteUser(authData.user.id) // Requires admin privileges for supabase client
      return {
        error: true,
        message: `Account created but profile setup failed: ${publicUserError.message}. Please contact support.`,
      };
    }
  } else {
    // This case should ideally not happen if signUpError is null, but as a safeguard.
     return {
        error: true,
        message: "Account created but user data is unavailable for profile setup. Please try logging in or contact support.",
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

  const { error, data: signInData } = await supabase.auth.signInWithPassword({
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

  if (signInData?.user) {
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', signInData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching user role after sign in:", profileError.message);
      // Don't block login, proceed with default redirect if role check fails
    } else if (userProfile?.role === 'admin') {
      return redirect('/admin'); // Redirect to admin panel if user is admin
    }
  }

  return redirect(redirectTo); // Default redirect for non-admins or if role check fails
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
