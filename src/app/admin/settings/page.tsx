
import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-headline">Application Settings</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>Application settings will be configurable here soon.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This section will provide options to configure various aspects of the application, such as site branding, default behaviors, and integrations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
