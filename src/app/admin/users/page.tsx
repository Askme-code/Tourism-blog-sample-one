
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users as UsersIcon, Edit, ShieldAlert } from 'lucide-react';
import type { Tables } from '@/types/supabase';
import QueryParamToast from '@/components/utility/QueryParamToast';
import { Suspense } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getUsers() {
  const supabase = createClient();
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users for admin:', error);
    return [];
  }
  return users;
}

export const metadata = {
  title: 'Manage Users | Admin Panel',
};

export default async function ManageUsersPage() {
  const users: Tables<'users'>[] = await getUsers();

  const getRoleVariant = (role: string | null): "default" | "secondary" | "outline" => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'default'; // Primary color for admin
      case 'user': return 'secondary'; // Secondary for regular user
      default: return 'outline'; // Outline for other/null roles
    }
  };

  return (
    <div className="space-y-6">
      <Suspense fallback={null}><QueryParamToast /></Suspense>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-headline">Manage Users</h1>
        </div>
        {/* Placeholder for future "Add User" button if needed, typically users sign up themselves */}
        {/* <Button asChild disabled> 
          <Link href="/admin/users/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Link>
        </Button> */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Registered Users</CardTitle>
          <CardDescription>View and manage user accounts and roles.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleVariant(user.role)} className="capitalize">
                          {user.role || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {user.created_at ? format(new Date(user.created_at), 'PP') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" disabled> {/* Disabled for now */}
                          <Edit className="mr-2 h-3 w-3" /> Edit Role
                        </Button>
                         {/* Example for future actions like "View Bookings" or "Suspend" */}
                        {/* <Button variant="ghost" size="sm" disabled>
                           <ShieldAlert className="mr-2 h-3 w-3" /> More Actions
                        </Button> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
