import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import CompactEventCard from "@/components/CompactEventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//todo: remove mock functionality
const upcomingEvents = [
  {
    title: "Sunday Coffee & Conversations",
    date: "Oct 15",
    time: "10:00 AM",
    location: "Bean & Brew Cafe",
    attendees: [
      { name: "Sarah J", initials: "SJ" },
      { name: "Mike C", initials: "MC" }
    ],
    spotsLeft: 3,
    matchScore: 92,
    imageGradient: "from-amber-400 via-orange-500 to-pink-500"
  }
];

const pastEvents = [
  {
    title: "Board Game Night",
    date: "Oct 8",
    time: "7:00 PM",
    location: "Game Haven Cafe",
    attendees: [
      { name: "Taylor W", initials: "TW" },
      { name: "Jamie H", initials: "JH" }
    ],
    spotsLeft: 0,
    matchScore: 88,
    imageGradient: "from-emerald-400 via-teal-500 to-cyan-500"
  }
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="My Events" />
      
      <div className="px-4 py-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, i) => (
                <CompactEventCard key={i} {...event} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No upcoming events</p>
                <p className="text-sm mt-1">Browse the Discover tab to find events</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-4 space-y-3">
            {pastEvents.map((event, i) => (
              <CompactEventCard key={i} {...event} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
