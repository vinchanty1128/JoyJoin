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
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

interface EventPool {
  id: string;
  title: string;
  description: string;
  eventType: "饭局" | "酒局" | "其他";
  city: "香港" | "深圳";
  district: string;
  dateTime: string;
  registrationDeadline: string;
  status: string;
  registrationCount: number;
  spotsLeft: number;
  genderRestriction?: string;
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<"香港" | "深圳">("深圳");
  const [selectedArea, setSelectedArea] = useState<string>("南山区");
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const markAsRead = useMarkNotificationsAsRead();

  // Fetch event pools from API
  const { data: eventPools = [], isLoading } = useQuery<EventPool[]>({
    queryKey: ["/api/event-pools", selectedCity],
    enabled: true,
  });

  // Auto-clear discover notifications when entering the page
  useEffect(() => {
    markAsRead.mutate('discover');
  }, []);

  const handleLocationSave = (city: "香港" | "深圳", area: string) => {
    setSelectedCity(city);
    setSelectedArea(area);
  };

  // Transform event pools to blind box event card props
  const transformEventPool = (pool: EventPool) => {
    try {
      const dateTime = parseISO(pool.dateTime);
      const dayOfWeek = format(dateTime, 'EEEE', { locale: zhCN });
      const time = format(dateTime, 'HH:mm');
      const area = `${pool.city}•${pool.district}`;
      
      // Use pool title as mystery title, or generate one
      const mysteryTitle = pool.title || `神秘${pool.eventType}｜等你揭晓`;
      
      // Check if it's girls night based on gender restriction or title
      const isGirlsNight = pool.genderRestriction === '仅限女性' || 
                          pool.title?.toLowerCase().includes('girls') ||
                          pool.title?.includes('女性') ||
                          pool.title?.includes('闺蜜');

      return {
        id: pool.id,
        date: dayOfWeek,
        time,
        eventType: (pool.eventType === "其他" ? "饭局" : pool.eventType) as "饭局" | "酒局",
        area,
        city: pool.city,
        mysteryTitle,
        isAA: true, // Event pools default to AA
        isGirlsNight,
      };
    } catch (error) {
      console.error("Error transforming event pool:", pool, error);
      return null;
    }
  };

  // Filter and transform event pools
  const filteredBlindBoxEvents = eventPools
    .filter(pool => {
      if (pool.city !== selectedCity) return false;
      if (selectedArea && !pool.district.includes(selectedArea)) return false;
      return true;
    })
    .map(transformEventPool)
    .filter((event): event is NonNullable<typeof event> => event !== null);

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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-4">加载中...</p>
              </div>
            ) : filteredBlindBoxEvents.length > 0 ? (
              filteredBlindBoxEvents.map((event) => (
                <BlindBoxEventCard key={event.id} {...event} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无{selectedCity}{selectedArea ? `·${selectedArea}` : ''}的盲盒活动</p>
                <p className="text-sm mt-2">Admin还没创建活动池，或当前筛选条件下没有可用活动</p>
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
