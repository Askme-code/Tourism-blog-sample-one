
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ManageReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-headline">Manage Reviews</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>Review management functionality will be available soon.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This section will allow administrators to view, approve, or delete user-submitted reviews for tours.</p>
        </CardContent>
      </Card>
    </div>
  );
}
