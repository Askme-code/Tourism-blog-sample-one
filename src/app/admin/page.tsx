import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Users, MessageSquare, BarChart3, DollarSign, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getAdminDashboardData() {
  const supabase = createClient();

  const { count: totalBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  const { count: activeTours, error: toursError } = await supabase
    .from('tours')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available');
  
  const { count: totalTours, error: totalToursError } = await supabase
    .from('tours')
    .select('*', { count: 'exact', head: true });

  const { count: recentFeedback, error: feedbackError } = await supabase
    .from('user_reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days
  
  const { count: totalUsers, error: usersTotalError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (bookingsError || toursError || feedbackError || totalToursError || usersTotalError) {
    console.error("Error fetching dashboard data:", bookingsError, toursError, feedbackError, totalToursError, usersTotalError);
  }

  return {
    totalBookings: totalBookings ?? 0,
    activeTours: activeTours ?? 0,
    totalTours: totalTours ?? 0,
    recentFeedback: recentFeedback ?? 0,
    totalUsers: totalUsers ?? 0,
  };
}


export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  const metrics = [
    { title: "Total Bookings", value: data.totalBookings, icon: Briefcase, color: "text-primary", description: "All time bookings", href: "/admin/bookings" },
    { title: "Active Tours", value: data.activeTours, icon: BarChart3, color: "text-green-500", description: `Out of ${data.totalTours} total tours`, href: "/admin/tours" },
    { title: "Recent Feedback", value: data.recentFeedback, icon: MessageSquare, color: "text-accent", description: "Reviews in last 7 days", href: "/admin/reviews" },
    { title: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-500", description: "Registered users", href: "/admin/users" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/tours/new">
            <Edit className="mr-2 h-4 w-4" /> Create New Tour
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={metric.href}>View Details</Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Overview of recent bookings and reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent activity feed */}
            <ul className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex items-center p-3 bg-muted/50 rounded-md">
                  <div className="p-2 bg-primary/20 rounded-full mr-3">
                    {i % 2 === 0 ? <Briefcase className="h-5 w-5 text-primary" /> : <MessageSquare className="h-5 w-5 text-accent" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {i % 2 === 0 ? `New Booking for "Sunset Dhow Cruise"` : `New Review for "Stone Town Walking Tour"`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Date.now() - i * 3600000).toLocaleString()} {/* Mock recent times */}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
             <div className="mt-4 text-center">
                <Button variant="ghost" asChild>
                    <Link href="/admin/activity-log">View All Activity &rarr;</Link>
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/tours/new">Create Tour</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/news/new">Post Update</Link>
            </Button>
             <Button variant="outline" asChild>
              <Link href="/admin/users">Manage Users</Link>
            </Button>
             <Button variant="outline" asChild>
              <Link href="/admin/settings">App Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
