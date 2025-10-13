import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import JoyEventCard from "@/components/JoyEventCard";
import BlindBoxEventCard from "@/components/BlindBoxEventCard";
import DiscountCouponCard from "@/components/DiscountCouponCard";
import UserEnergyBadge from "@/components/UserEnergyBadge";
import HeroWelcome from "@/components/HeroWelcome";
import LocationPickerSheet from "@/components/LocationPickerSheet";
import { Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VIBE_TAGS } from "@/lib/vibes";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

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
    discount: 15,
    participants: [
      { id: "p1", displayName: "小美", vibes: ["活力", "社交"] },
      { id: "p2", displayName: "阿强", vibes: ["玩乐", "冒险"] },
      { id: "p3", displayName: "莉莉", vibes: ["活力", "玩乐"] },
      { id: "p4", displayName: "大明", vibes: ["社交", "活力"] },
      { id: "p5", displayName: "小红", vibes: ["玩乐", "社交"] }
    ],
    attendeeCount: 5
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
    socialProof: "主办热门",
    participants: [
      { id: "p6", displayName: "安安", vibes: ["温馨", "悠闲"] },
      { id: "p7", displayName: "小白", vibes: ["悠闲", "温馨"] },
      { id: "p8", displayName: "阿文", vibes: ["探索", "创意"] }
    ],
    attendeeCount: 3
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
    discount: 10,
    participants: [
      { id: "p9", displayName: "艺琳", vibes: ["创意", "探索"] },
      { id: "p10", displayName: "小杰", vibes: ["探索", "悠闲"] }
    ],
    attendeeCount: 2
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
    socialProof: "2对情侣已报名",
    participants: [
      { id: "p11", displayName: "晓晓", vibes: ["玩乐", "社交"] },
      { id: "p12", displayName: "阿宝", vibes: ["社交", "玩乐"] },
      { id: "p13", displayName: "小芳", vibes: ["玩乐", "活力"] }
    ],
    attendeeCount: 3
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
    iconName: "mountain",
    participants: [
      { id: "p14", displayName: "阿峰", vibes: ["冒险", "活力"] },
      { id: "p15", displayName: "小龙", vibes: ["活力", "冒险"] },
      { id: "p16", displayName: "静怡", vibes: ["探索", "冒险"] },
      { id: "p17", displayName: "大伟", vibes: ["活力", "社交"] }
    ],
    attendeeCount: 4
  }
];

const blindBoxEvents = [
  {
    id: "bb1",
    date: "周三",
    time: "19:00",
    eventType: "饭局" as const,
    area: "深圳•南山区",
    city: "深圳" as const,
    mysteryTitle: "神秘饭局｜等你揭晓",
    priceTier: "100元以下" as const,
    isAA: true
  },
  {
    id: "bb2",
    date: "周四",
    time: "19:00",
    eventType: "饭局" as const,
    area: "深圳•福田区",
    city: "深圳" as const,
    mysteryTitle: "盲盒聚会｜未知相遇",
    priceTier: "300-500" as const,
    isAA: true
  },
  {
    id: "bb3",
    date: "周五",
    time: "19:00",
    eventType: "饭局" as const,
    area: "深圳•华侨城",
    city: "深圳" as const,
    mysteryTitle: "周末饭局｜神秘嘉宾",
    priceTier: "200-300" as const,
    isAA: true
  },
  {
    id: "bb4",
    date: "周六",
    time: "19:00",
    eventType: "饭局" as const,
    area: "深圳•罗湖区",
    city: "深圳" as const,
    mysteryTitle: "周末聚餐｜盲盒体验",
    priceTier: "100-200" as const,
    isAA: true
  },
  {
    id: "bb5",
    date: "周五",
    time: "21:00",
    eventType: "酒局" as const,
    area: "香港•中西区",
    city: "香港" as const,
    mysteryTitle: "神秘酒局｜夜间聚会",
    priceTier: "100元以下" as const
  },
  {
    id: "bb6",
    date: "周六",
    time: "21:00",
    eventType: "酒局" as const,
    area: "香港•湾仔区",
    city: "香港" as const,
    mysteryTitle: "盲盒酒局｜等你加入",
    priceTier: "500+" as const
  },
  {
    id: "bb7",
    date: "周五",
    time: "21:00",
    eventType: "酒局" as const,
    area: "深圳•福田区",
    city: "深圳" as const,
    mysteryTitle: "Girls Night｜闺蜜之夜",
    priceTier: "200-300" as const,
    isAA: true,
    isGirlsNight: true
  }
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"blindbox" | "featured">("blindbox");
  const [selectedCity, setSelectedCity] = useState<"香港" | "深圳">("深圳");
  const [selectedArea, setSelectedArea] = useState<string>("南山区");
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const handleLocationSave = (city: "香港" | "深圳", area: string) => {
    setSelectedCity(city);
    setSelectedArea(area);
  };

  // 盲盒活动筛选：先按城市筛选，再按区域筛选
  const filteredBlindBoxEvents = blindBoxEvents.filter(event => {
    if (event.city !== selectedCity) return false;
    // 如果选择了具体区域，只显示该区域的活动
    if (selectedArea) {
      return event.area.includes(selectedArea);
    }
    return true;
  });
  const filteredFeaturedEvents = mockEvents.filter(event => {
    if (selectedCity === "深圳") {
      return event.area.includes("深圳") || event.area === "南山" || event.area === "深圳湾";
    } else {
      return event.area === "中环" || event.area === "铜锣湾" || event.area === "尖沙咀";
    }
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader showLogo={true} showNotification={true} />
      
      <div className="space-y-4">
        {/* Hero 欢迎区 */}
        <div className="flex items-start justify-between pr-4">
          <HeroWelcome 
            userName={user?.displayName || "朋友"}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
            onLocationClick={() => setLocationPickerOpen(true)}
          />
          <div className="pt-6">
            <UserEnergyBadge level={3} role="energizer" />
          </div>
        </div>

        {/* 分割线 */}
        <div className="h-px bg-border/50 mx-4" />

        <div className="px-4 space-y-4">
          <DiscountCouponCard 
            discount={15}
            reason="上次活动带动全场氛围，获得能量奖励"
            expiresIn="7天"
          />

          <div className="inline-flex rounded-lg p-1 bg-muted">
            <button
              onClick={() => setActiveTab("blindbox")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "blindbox"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover-elevate"
              }`}
              data-testid="button-tab-blindbox"
            >
              <Sparkles className="h-3.5 w-3.5" />
              盲盒模式
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "featured"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover-elevate"
              }`}
              data-testid="button-tab-featured"
            >
              <Star className="h-3.5 w-3.5" />
              活动精选
            </button>
          </div>

          <div className="space-y-5">
            {activeTab === "blindbox" ? (
              filteredBlindBoxEvents.length > 0 ? (
                filteredBlindBoxEvents.map((event) => (
                  <BlindBoxEventCard key={event.id} {...event} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无{selectedCity}的盲盒活动</p>
                </div>
              )
            ) : (
              filteredFeaturedEvents.length > 0 ? (
                filteredFeaturedEvents.map((event) => (
                  <JoyEventCard key={event.id} {...event} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无{selectedCity}的精选活动</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <BottomNav />
      
      {/* 地点选择器 */}
      <LocationPickerSheet
        open={locationPickerOpen}
        onOpenChange={setLocationPickerOpen}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onSave={handleLocationSave}
      />
    </div>
  );
}
