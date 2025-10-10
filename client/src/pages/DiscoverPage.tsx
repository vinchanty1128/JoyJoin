import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import JoyEventCard from "@/components/JoyEventCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

//todo: remove mock functionality
const categories = [
  { emoji: "😌", label: "Chill" },
  { emoji: "🎈", label: "Playful" },
  { emoji: "⚡", label: "High-Energy" },
  { emoji: "🧠", label: "Curious" },
  { emoji: "🕯️", label: "Cozy" },
  { emoji: "🧗", label: "Adventurous" }
];

const mockEvents = [
  {
    title: "Taco Run & Mini Games",
    time: "7:30 PM",
    area: "Sanlitun",
    price: "¥88",
    vibes: [
      { emoji: "⚡", label: "High-Energy", gradient: "from-orange-400 to-coral-500" },
      { emoji: "🎈", label: "Playful", gradient: "from-pink-400 to-rose-400" },
      { emoji: "🤝", label: "Social", gradient: "from-violet-400 to-purple-400" }
    ],
    spotsLeft: 3,
    myFit: 92,
    groupSpark: "High" as const,
    imageGradient: "from-orange-400 via-red-400 to-pink-500",
    socialProof: "3 friends-of-friends joined"
  },
  {
    title: "Cozy Game Night",
    time: "8:00 PM",
    area: "Chaoyang",
    price: "¥68",
    vibes: [
      { emoji: "🕯️", label: "Cozy", gradient: "from-amber-400 to-yellow-400" },
      { emoji: "😌", label: "Chill", gradient: "from-blue-400 to-cyan-400" },
      { emoji: "🎮", label: "Games", gradient: "from-purple-400 to-indigo-400" }
    ],
    spotsLeft: 2,
    myFit: 88,
    groupSpark: "High" as const,
    imageGradient: "from-amber-300 via-orange-300 to-yellow-400",
    socialProof: "Host favorite"
  },
  {
    title: "Art Walk & Coffee",
    time: "2:00 PM",
    area: "798 District",
    price: "¥58",
    vibes: [
      { emoji: "🧠", label: "Curious", gradient: "from-purple-400 to-indigo-400" },
      { emoji: "🎨", label: "Creative", gradient: "from-fuchsia-400 to-pink-400" },
      { emoji: "😌", label: "Chill", gradient: "from-blue-400 to-cyan-400" }
    ],
    spotsLeft: 4,
    myFit: 86,
    groupSpark: "Medium" as const,
    imageGradient: "from-purple-400 via-pink-400 to-rose-400"
  },
  {
    title: "Dumpling Mixer",
    time: "6:30 PM",
    area: "Dongcheng",
    price: "¥78",
    vibes: [
      { emoji: "🎈", label: "Playful", gradient: "from-pink-400 to-rose-400" },
      { emoji: "🤝", label: "Social", gradient: "from-violet-400 to-purple-400" }
    ],
    spotsLeft: 5,
    myFit: 84,
    groupSpark: "Medium" as const,
    imageGradient: "from-rose-400 via-pink-400 to-fuchsia-400",
    socialProof: "2 couples signed up"
  },
  {
    title: "Morning Hike & Brunch",
    time: "8:00 AM",
    area: "Fragrant Hills",
    price: "¥98",
    vibes: [
      { emoji: "🧗", label: "Adventurous", gradient: "from-emerald-400 to-teal-400" },
      { emoji: "⚡", label: "High-Energy", gradient: "from-orange-400 to-coral-500" }
    ],
    spotsLeft: 3,
    myFit: 79,
    groupSpark: "High" as const,
    imageGradient: "from-emerald-400 via-teal-400 to-cyan-400"
  }
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader showLogo={true} showNotification={true} />
      
      <div className="px-4 py-3 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">小局·好能量</p>
          <h2 className="text-lg font-display font-bold">Jump in tonight</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search vibes, areas, activities..." 
            className="pl-9"
            data-testid="input-search-events"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <Badge
              key={cat.label}
              variant="outline"
              className="cursor-pointer whitespace-nowrap hover-elevate active-elevate-2 px-3 py-1"
              data-testid={`badge-category-${cat.label.toLowerCase()}`}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          {mockEvents.map((event, i) => (
            <JoyEventCard key={i} {...event} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
