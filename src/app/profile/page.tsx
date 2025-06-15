// app/profile/page.tsx
import { Suspense } from 'react';
import ProfileClientContent from './ProfileClientContent';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-headline mb-8 text-center">Your Profile</h1>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading your profile...</p>
        </div>
      }>
        <ProfileClientContent />
      </Suspense>
    </div>
  );
}
