
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
        setIsLoadingRole(true); // Ensure loading state is true at the start of fetch
        const supabase = createSupabaseClient();
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          // Log the error but don't crash. Assume non-admin if profile/role is missing.
          console.error("UserNavWithRoleFetcher: Error fetching user role:", error.message);
          // Specifically handle "multiple (or no) rows returned" by setting role to undefined or a default
          if (error.code === 'PGRST116') { // PGRST116 is the code for "0 rows" or "multiple rows" for .single()
            setRole(undefined); // Or 'user' if you want a default non-admin role
          }
        } else if (userProfile) {
          setRole(userProfile.role);
        } else {
          // Profile not found, but no explicit error (should be caught by error.code === 'PGRST116')
          setRole(undefined); 
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
