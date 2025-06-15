
'use client';

import * as React from 'react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { UserNav } from './UserNav';
import { Button } from '@/components/ui/button';
import { User as UserIconFallback } from 'lucide-react'; // Renamed User to UserIconFallback for clarity

export default function UserNavWithRoleFetcher({ authUser }: { authUser: SupabaseAuthUser }) {
  const [role, setRole] = React.useState<string | undefined>(undefined);
  const [isLoadingRole, setIsLoadingRole] = React.useState(true);

  React.useEffect(() => {
    async function fetchRole() {
      if (authUser) {
        const supabase = createSupabaseClient();
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single();
        if (!error && userProfile) {
          setRole(userProfile.role);
        } else if (error) {
          console.error("UserNavWithRoleFetcher: Error fetching user role:", error.message);
        }
        setIsLoadingRole(false);
      } else {
        setIsLoadingRole(false); // Should not happen if authUser is passed, but good for safety
      }
    }
    fetchRole();
  }, [authUser]);

  if (isLoadingRole) {
    // Basic fallback while role is loading
    return <Button variant="ghost" size="icon" className="rounded-full"><UserIconFallback className="h-5 w-5"/></Button>;
  }

  // Type assertion for user_metadata if needed by UserNav structure
  const typedUser = authUser as SupabaseAuthUser & { user_metadata: { full_name?: string, avatar_url?: string }};

  return <UserNav user={typedUser} passedRole={role} />;
}
