
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
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (error) {
          // Since 'id' is a PK, "multiple rows" is impossible.
          // This specific error message likely means "no rows returned" is being reported as an error.
          if (error.message === "JSON object requested, multiple (or no) rows returned") {
            console.warn(`UserNavWithRoleFetcher: No profile/role found in public.users for user ID ${authUser.id} (reported as: ${error.message}). Assuming default non-admin role.`);
            setRole(undefined);
          } else {
            // Handle other, unexpected errors
            console.error("UserNavWithRoleFetcher: Unexpected error fetching user role:", error.message);
            setRole(undefined); // Fallback to no specific role on other errors
          }
        } else if (!userProfile) {
          // Standard "no profile found" case where data is null and no error object from Supabase
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
