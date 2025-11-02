import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import BlindBoxEventCard from "@/components/BlindBoxEventCard";
import DiscountCouponCard from "@/components/DiscountCouponCard";
import HeroWelcome from "@/components/HeroWelcome";
import LocationPickerSheet from "@/components/LocationPickerSheet";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMarkNotificationsAsRead } from "@/hooks/useNotificationCounts";

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
  const [selectedCity, setSelectedCity] = useState<"香港" | "深圳">("深圳");
  const [selectedArea, setSelectedArea] = useState<string>("南山区");
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const markAsRead = useMarkNotificationsAsRead();

  // Auto-clear discover notifications when entering the page
  useEffect(() => {
    markAsRead.mutate('discover');
  }, []);

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

  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader showLogo={true} />
      
      <div className="space-y-4">
        {/* Hero 欢迎区 */}
        <HeroWelcome 
          userName={user?.displayName || "朋友"}
          selectedCity={selectedCity}
          selectedArea={selectedArea}
          onLocationClick={() => setLocationPickerOpen(true)}
        />

        {/* 分割线 */}
        <div className="h-px bg-border/50 mx-4" />

        <div className="px-4 space-y-4">
          <DiscountCouponCard 
            discount={15}
            reason="上次活动带动全场氛围，获得能量奖励"
            expiresIn="7天"
          />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">盲盒模式</span>
          </div>

          <div className="space-y-5">
            {filteredBlindBoxEvents.length > 0 ? (
              filteredBlindBoxEvents.map((event) => (
                <BlindBoxEventCard key={event.id} {...event} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无{selectedCity}的盲盒活动</p>
              </div>
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
