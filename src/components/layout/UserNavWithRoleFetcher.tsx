
'use client';

import * as React from 'react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { UserNav } from './UserNav';
import { Button } from '@/components/ui/button';
import { User as UserIconFallback } from 'lucide-react';

export default function UserNavWithRoleFetcher({ authUser }: { authUser: SupabaseAuthUser }) {
  const [role, setRole] = React.useState<string | undefined>(undefined);
  const [isLoadingRole, setIsLoadingRole] = React.useState(true);

  React.useEffect(() => {
    async function fetchRole() {
      if (authUser) {
        setIsLoadingRole(true);
        const supabase = createSupabaseClient();
        // Use .maybeSingle() to gracefully handle cases where no row is found
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (error) {
          // This error now primarily means multiple rows returned or a DB connection issue.
          console.error("UserNavWithRoleFetcher: Error fetching user role:", error.message);
          setRole(undefined); // Fallback to no specific role on error
        } else if (!userProfile) {
          // No profile found for the user in public.users table
          console.warn(`UserNavWithRoleFetcher: No profile/role found in public.users for user ID: ${authUser.id}. Assuming default non-admin role.`);
          setRole(undefined); // Fallback to no specific role
        } else {
          // Profile found, set the role
          setRole(userProfile.role);
        }
        setIsLoadingRole(false);
      } else {
        // No authenticated user, so no role to fetch
        setIsLoadingRole(false);
        setRole(undefined);
      }
    }
    fetchRole();
  }, [authUser]);

  if (isLoadingRole) {
    return <Button variant="ghost" size="icon" className="rounded-full"><UserIconFallback className="h-5 w-5"/></Button>;
  }

  const typedUser = authUser as SupabaseAuthUser & { user_metadata: { full_name?: string, avatar_url?: string }};

  return <UserNav user={typedUser} passedRole={role} />;
}

