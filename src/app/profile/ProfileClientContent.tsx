
"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { updateUserPasswordAction } from "@/lib/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, Phone, ShieldCheck, Edit3, Save } from "lucide-react"; // Renamed User to UserIcon to avoid conflict
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useSearchParams, useRouter } from "next/navigation";

// This tells Next.js to always render this page dynamically at request time
export const dynamic = "force-dynamic";

interface UserProfile extends SupabaseUser {
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
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
  const [internalLoading, setInternalLoading] = useState(true); // Renamed to avoid confusion with Suspense
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [passwordState, passwordFormAction] = useFormState(updateUserPasswordAction, null);
  
  const [fullName, setFullName] = useState('');
  const [phoneState, setPhoneState] = useState(''); // Renamed to avoid conflict with phone prop if any
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("Error fetching user:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch user data." });
        setInternalLoading(false);
        router.push('/auth/login?message=Please log in to view your profile.');
        return;
      }
      const typedUser = data.user as UserProfile;
      setUser(typedUser);
      setFullName(typedUser.user_metadata.full_name || '');
      setPhoneState(typedUser.user_metadata.phone || typedUser.phone || '');
      setInternalLoading(false);
    };
    fetchUser();

    const message = searchParams.get('message');
    if (message) {
      toast({ title: "Notification", description: message });
      // Clean up URL
      const currentPath = window.location.pathname;
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('message');
      router.replace(currentPath + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''), { scroll: false });
    }
  }, [supabase, toast, searchParams, router]);

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
      data: { full_name: fullName, phone: phoneState } 
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
    return <div className="text-center py-10">Verifying your session...</div>;
  }

  if (!user) {
    return <div className="text-center py-10">Redirecting to login...</div>;
  }
  
  const initials = (user.user_metadata.full_name || fullName)
    ? (user.user_metadata.full_name || fullName).split(" ").map((n) => n[0]).join("").toUpperCase()
    : user.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary ring-offset-2">
              <AvatarImage src={user.user_metadata.avatar_url ?? undefined} alt={fullName} />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-headline">{fullName || user.user_metadata.full_name}</CardTitle>
            <CardDescription className="text-sm text-primary">{user.user_metadata.role || 'User'}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
             <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            {isEditing ? (
               <Input 
                  id="profilePhoneEdit"
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
                  <Label htmlFor="profileFullNameEdit">Full Name</Label>
                  <Input 
                    id="profileFullNameEdit" 
                    name="fullName" 
                    value={fullName}
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
                    value={phoneState}
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
                 {passwordState?.errors?.password && <p className="text-sm text-destructive mt-1">{passwordState.errors.password[0]}</p>}
              </div>
              <UpdatePasswordButton />
            </form>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
