import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import VibeProfileCard from "@/components/VibeProfileCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, LogOut, Shield, HelpCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="Profile" showSettings={true} />
      
      <div className="px-4 py-4 space-y-4">
        <VibeProfileCard
          name="Alex Rivera"
          initials="AR"
          vibes={["Coffee Lover", "Introvert", "Creative", "Book Worm", "Night Owl"]}
          eventsAttended={12}
          matchesMade={8}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" data-testid="button-edit-profile">
              <Edit className="h-4 w-4 mr-3" />
              Edit Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-safety">
              <Shield className="h-4 w-4 mr-3" />
              Safety & Privacy
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-help">
              <HelpCircle className="h-4 w-4 mr-3" />
              Help & Support
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-3" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
