import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import CompactEventCard from "@/components/CompactEventCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

//todo: remove mock functionality
const categories = ["All", "Coffee", "Games", "Art", "Music", "Fitness", "Food"];

const mockEvents = [
  {
    title: "Sunday Coffee & Conversations",
    date: "Oct 15",
    time: "10:00 AM",
    location: "Bean & Brew Cafe, Downtown",
    attendees: [
      { name: "Sarah J", initials: "SJ" },
      { name: "Mike C", initials: "MC" },
      { name: "Emma D", initials: "ED" },
      { name: "Alex R", initials: "AR" }
    ],
    spotsLeft: 3,
    matchScore: 92,
    imageGradient: "from-amber-400 via-orange-500 to-pink-500"
  },
  {
    title: "Indie Music Night",
    date: "Oct 18",
    time: "7:30 PM",
    location: "The Velvet Room",
    attendees: [
      { name: "Jordan K", initials: "JK" },
      { name: "Sam P", initials: "SP" },
      { name: "Casey L", initials: "CL" }
    ],
    spotsLeft: 2,
    matchScore: 88,
    imageGradient: "from-violet-500 via-purple-500 to-fuchsia-500"
  },
  {
    title: "Board Game Brunch",
    date: "Oct 20",
    time: "11:00 AM",
    location: "Game Haven Cafe",
    attendees: [
      { name: "Taylor W", initials: "TW" },
      { name: "Jamie H", initials: "JH" }
    ],
    spotsLeft: 4,
    matchScore: 85,
    imageGradient: "from-emerald-400 via-teal-500 to-cyan-500"
  },
  {
    title: "Art Gallery Tour",
    date: "Oct 22",
    time: "2:00 PM",
    location: "Downtown Arts District",
    attendees: [
      { name: "Avery B", initials: "AB" },
      { name: "Blake N", initials: "BN" },
      { name: "Drew S", initials: "DS" }
    ],
    spotsLeft: 3,
    matchScore: 90,
    imageGradient: "from-rose-400 via-pink-500 to-purple-500"
  },
  {
    title: "Morning Yoga & Smoothies",
    date: "Oct 25",
    time: "8:00 AM",
    location: "Sunrise Wellness Studio",
    attendees: [
      { name: "Phoenix K", initials: "PK" },
      { name: "Skylar J", initials: "SJ" }
    ],
    spotsLeft: 2,
    matchScore: 83,
    imageGradient: "from-lime-400 via-green-500 to-emerald-500"
  }
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="Discover" showNotification={true} />
      
      <div className="px-4 py-3 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9"
            data-testid="input-search-events"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <Badge
              key={cat}
              variant={i === 0 ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap hover-elevate active-elevate-2"
              data-testid={`badge-category-${cat.toLowerCase()}`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            RECOMMENDED FOR YOU
          </h2>
          <div className="space-y-3">
            {mockEvents.map((event, i) => (
              <CompactEventCard key={i} {...event} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
