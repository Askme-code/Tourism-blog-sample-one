
'use client';

import { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { updateUserPasswordAction } from "@/lib/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, Phone, ShieldCheck, Edit3, Save, Loader2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useSearchParams, useRouter } from "next/navigation";

// Defines the expected structure of user_metadata if it exists.
// SupabaseUser['user_metadata'] is Record<string, any>, so it's always an object (possibly empty).
interface UserProfile extends SupabaseUser {
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: string; // Note: This 'role' is illustrative; auth role comes from public.users
    phone?: string;
  };
}

function UpdatePasswordButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Save className="mr-2 h-4 w-4 animate-spin" /> Updating...
        </>
      ) : (
        <>
          <ShieldCheck className="mr-2 h-4 w-4" /> Update Password
        </>
      )}
    </Button>
  );
}

export default function ProfileClientContent() {
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [passwordState, passwordFormAction] = useActionState(updateUserPasswordAction, null);
  
  const [fullName, setFullName] = useState(''); // For editable full name
  const [phoneState, setPhoneState] = useState(''); // For editable phone
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setInternalLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "Could not fetch user data. Redirecting to login." });
        setInternalLoading(false);
        router.push('/auth/login?message=Please log in to view your profile.');
        return;
      }
      // Cast to UserProfile. SupabaseUser user_metadata is Record<string, any>.
      // UserProfile expects user_metadata to be an object (which it is, possibly empty).
      const typedUser = data.user as UserProfile; 
      setUser(typedUser);
      // Initialize editable fields from metadata, or fallback to empty string / user.phone
      setFullName(typedUser.user_metadata.full_name || '');
      setPhoneState(typedUser.user_metadata.phone || typedUser.phone || '');
      setInternalLoading(false);
    };
    fetchUser();

    const message = searchParams.get('message');
    if (message) {
      toast({ title: "Notification", description: message });
      const currentPath = window.location.pathname;
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('message');
      router.replace(currentPath + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''), { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, toast, router]); // searchParams deliberately omitted to avoid re-runs if only it changes for toast

  useEffect(() => {
    if (passwordState?.message) {
      toast({
        title: passwordState.error ? "Error" : "Success",
        description: passwordState.message,
        variant: passwordState.error ? "destructive" : "default",
      });
      if (!passwordState.error && document.getElementById('newPassword')) {
        (document.getElementById('newPassword') as HTMLInputElement).value = '';
      }
    }
  }, [passwordState, toast]);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setInternalLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone: phoneState } // These go into user_metadata
    });
    setInternalLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } else {
      toast({ title: "Success", description: "Profile updated successfully." });
      if (data.user) {
        const updatedUser = data.user as UserProfile;
        setUser(updatedUser); 
        setFullName(updatedUser.user_metadata.full_name || '');
        setPhoneState(updatedUser.user_metadata.phone || updatedUser.phone || '');
      }
      setIsEditing(false);
    }
  };

  if (internalLoading && !user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Verifying your session...</p>
        </div>
      );
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      );
  }

  // Derive display values safely after user is confirmed non-null
  const currentFullNameFromMetadata = user.user_metadata.full_name;
  const nameForDisplay = fullName || currentFullNameFromMetadata || user.email || "User";

  const nameSourceForInitials = currentFullNameFromMetadata || user.email;
  const initials = nameSourceForInitials
    ? nameSourceForInitials
        .split(" ")
        .filter(Boolean) // Remove empty strings if name has multiple spaces
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "P"; // Default to 'P' for Profile if no name/email

  return (
    <div className="container py-8 md:py-12">
      {/* This H1 is now rendered by the parent page component */}
      {/* <h1 className="text-3xl md:text-4xl font-headline mb-8 text-center">Your Profile</h1> */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary ring-offset-2">
                <AvatarImage src={user.user_metadata.avatar_url ?? undefined} alt={nameForDisplay} />
                <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-headline">{nameForDisplay}</CardTitle>
              <CardDescription className="text-sm text-primary">{user.user_metadata.role || 'User'}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {isEditing ? (
                <Input
                  id="profilePhoneEditCard"
                  value={phoneState}
                  onChange={(e) => setPhoneState(e.target.value)}
                  placeholder="Your phone number"
                  className="mt-1"
                  disabled={internalLoading}
                />
              ) : (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{phoneState || 'Not provided'}</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full" disabled={internalLoading}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          {isEditing && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Edit Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="profileFullNameEditForm">Full Name</Label>
                    <Input
                      id="profileFullNameEditForm"
                      name="fullName"
                      value={fullName} // Bound to editable state
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="mt-1"
                      disabled={internalLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profilePhoneEditForm">Phone Number</Label>
                    <Input
                      id="profilePhoneEditForm"
                      name="phone"
                      type="tel"
                      value={phoneState} // Bound to editable state
                      onChange={(e) => setPhoneState(e.target.value)}
                      placeholder="Your phone number"
                      className="mt-1"
                      disabled={internalLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={internalLoading}>
                      <Save className="mr-2 h-4 w-4" /> {internalLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={internalLoading}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Update Password</CardTitle>
              <CardDescription>Ensure your account is secure with a strong password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={passwordFormAction} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="password"
                    type="password"
                    placeholder="•••••••• (min. 8 characters)"
                    required
                    className="mt-1"
                  />
                  {passwordState?.errors?.password && (
                    <p className="text-sm text-destructive mt-1">{passwordState.errors.password[0]}</p>
                  )}
                </div>
                <UpdatePasswordButton />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

