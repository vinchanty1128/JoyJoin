import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import JoyEventCard from "@/components/JoyEventCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VibeType } from "@/lib/vibes";

//todo: remove mock functionality
const categories = [
  { label: "全部", value: "all" },
  { label: "😌 Chill", value: "chill" },
  { label: "🎈 Playful", value: "playful" },
  { label: "⚡ High-Energy", value: "highEnergy" },
  { label: "🧠 Curious", value: "curious" },
  { label: "🕯️ Cozy", value: "cozy" },
];

const mockEvents = [
  {
    title: "High-Energy Taco Run",
    time: "今晚 7:00 PM",
    area: "三里屯",
    price: "¥88",
    vibes: ["highEnergy", "playful", "social"] as VibeType[],
    spotsLeft: 2,
    myFit: 92,
    groupSpark: "High" as const,
    imageGradient: "from-orange-400 via-red-500 to-pink-500",
    socialProof: "3个共同好友已加入"
  },
  {
    title: "Cozy Game Night",
    time: "周六 8:00 PM",
    area: "朝阳公园",
    price: "¥68",
    vibes: ["cozy", "playful", "chill"] as VibeType[],
    spotsLeft: 4,
    myFit: 88,
    groupSpark: "High" as const,
    imageGradient: "from-amber-400 via-yellow-500 to-orange-400",
    socialProof: "Host favorite"
  },
  {
    title: "Coffee & Deep Talks",
    time: "周日 10:00 AM",
    area: "望京",
    price: "¥48",
    vibes: ["chill", "curious", "cozy"] as VibeType[],
    spotsLeft: 3,
    myFit: 90,
    groupSpark: "Medium" as const,
    imageGradient: "from-blue-400 via-cyan-500 to-teal-400"
  },
  {
    title: "Art Gallery Walk",
    time: "周六 2:00 PM",
    area: "798艺术区",
    price: "¥78",
    vibes: ["curious", "creative", "chill"] as VibeType[],
    spotsLeft: 3,
    myFit: 85,
    groupSpark: "High" as const,
    imageGradient: "from-purple-400 via-indigo-500 to-pink-400",
    socialProof: "2个共同好友已加入"
  },
  {
    title: "Hiking Adventure",
    time: "周日 7:00 AM",
    area: "香山",
    price: "¥58",
    vibes: ["adventurous", "highEnergy", "social"] as VibeType[],
    spotsLeft: 2,
    myFit: 83,
    groupSpark: "High" as const,
    imageGradient: "from-emerald-400 via-teal-500 to-green-500"
  }
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="发现" showNotification={true} showLogo={true} />
      
      <div className="px-4 py-3 space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">小局·好能量</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索活动..." 
            className="pl-9"
            data-testid="input-search-events"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <Badge
              key={cat.value}
              variant={i === 0 ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap hover-elevate active-elevate-2"
              data-testid={`badge-category-${cat.value}`}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            为你推荐
          </h2>
          <div className="space-y-3">
            {mockEvents.map((event, i) => (
              <JoyEventCard key={i} {...event} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
