import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import JoyEventCard from "@/components/JoyEventCard";
import DiscountCouponCard from "@/components/DiscountCouponCard";
import UserEnergyBadge from "@/components/UserEnergyBadge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VIBE_TAGS } from "@/lib/vibes";

const categories = [
  { emoji: "😌", label: "悠闲" },
  { emoji: "🎈", label: "玩乐" },
  { emoji: "⚡", label: "活力" },
  { emoji: "🧠", label: "探索" },
  { emoji: "🕯️", label: "温馨" },
  { emoji: "🧗", label: "冒险" }
];

const mockEvents = [
  {
    id: "1",
    title: "墨西哥卷挑战赛",
    time: "晚上 7:30",
    area: "中环",
    price: "¥88",
    vibes: [
      { emoji: "⚡", label: "活力", gradient: "from-orange-400 to-red-500" },
      { emoji: "🎈", label: "玩乐", gradient: "from-pink-400 to-rose-400" },
      { emoji: "🤝", label: "社交", gradient: "from-violet-400 to-purple-400" }
    ],
    spotsLeft: 3,
    myFit: 92,
    groupSpark: "High" as const,
    vibeGradient: "from-orange-400 via-red-400 to-pink-500",
    iconName: "pizza",
    socialProof: "3位朋友的朋友已加入",
    discount: 15
  },
  {
    id: "2",
    title: "温馨桌游之夜",
    time: "晚上 8:00",
    area: "铜锣湾",
    price: "¥68",
    vibes: [
      { emoji: "🕯️", label: "温馨", gradient: "from-amber-400 to-yellow-400" },
      { emoji: "😌", label: "悠闲", gradient: "from-blue-400 to-cyan-400" },
      { emoji: "🎮", label: "游戏", gradient: "from-purple-400 to-indigo-400" }
    ],
    spotsLeft: 2,
    myFit: 88,
    groupSpark: "High" as const,
    vibeGradient: "from-amber-300 via-orange-300 to-yellow-400",
    iconName: "gamepad",
    socialProof: "主办热门"
  },
  {
    id: "3",
    title: "艺术漫步+咖啡",
    time: "下午 2:00",
    area: "尖沙咀",
    price: "¥58",
    vibes: [
      { emoji: "🧠", label: "探索", gradient: "from-purple-400 to-indigo-400" },
      { emoji: "🎨", label: "创意", gradient: "from-fuchsia-400 to-pink-400" },
      { emoji: "😌", label: "悠闲", gradient: "from-blue-400 to-cyan-400" }
    ],
    spotsLeft: 4,
    myFit: 86,
    groupSpark: "Medium" as const,
    vibeGradient: "from-purple-400 via-pink-400 to-rose-400",
    iconName: "palette",
    discount: 10
  },
  {
    id: "4",
    title: "饺子聚会",
    time: "晚上 6:30",
    area: "南山",
    price: "¥78",
    vibes: [
      { emoji: "🎈", label: "玩乐", gradient: "from-pink-400 to-rose-400" },
      { emoji: "🤝", label: "社交", gradient: "from-violet-400 to-purple-400" }
    ],
    spotsLeft: 5,
    myFit: 84,
    groupSpark: "Medium" as const,
    vibeGradient: "from-rose-400 via-pink-400 to-fuchsia-400",
    iconName: "utensils",
    socialProof: "2对情侣已报名"
  },
  {
    id: "5",
    title: "晨跑+早午餐",
    time: "早上 8:00",
    area: "深圳湾",
    price: "¥98",
    vibes: [
      { emoji: "🧗", label: "冒险", gradient: "from-emerald-400 to-teal-400" },
      { emoji: "⚡", label: "活力", gradient: "from-orange-400 to-red-500" }
    ],
    spotsLeft: 3,
    myFit: 79,
    groupSpark: "High" as const,
    vibeGradient: "from-emerald-400 via-teal-400 to-cyan-400",
    iconName: "mountain"
  }
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader showLogo={true} showNotification={true} />
      
      <div className="px-4 py-3 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">小局·好能量</p>
            <h2 className="text-lg font-display font-bold">今晚来聚</h2>
          </div>
          <UserEnergyBadge level={3} role="energizer" />
        </div>

        <DiscountCouponCard 
          discount={15}
          reason="上次活动带动全场氛围，获得能量奖励"
          expiresIn="7天"
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索氛围、地区、活动..." 
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
              data-testid={`badge-category-${cat.label}`}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          {mockEvents.map((event) => (
            <JoyEventCard key={event.id} {...event} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
