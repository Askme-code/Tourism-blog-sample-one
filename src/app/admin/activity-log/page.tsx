
import { ListChecks } from "lucide-react"; // Or another suitable icon
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ActivityLogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-headline">Activity Log</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>The activity log will be available soon.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This page will display a log of important actions and events within the application, such as new bookings, user registrations, and administrative changes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
