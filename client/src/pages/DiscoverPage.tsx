import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import BlindBoxEventCard from "@/components/BlindBoxEventCard";
import DiscountCouponCard from "@/components/DiscountCouponCard";
import HeroWelcome from "@/components/HeroWelcome";
import LocationPickerSheet from "@/components/LocationPickerSheet";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMarkNotificationsAsRead } from "@/hooks/useNotificationCounts";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

interface EventPool {
  id: string;
  title: string;
  description: string | null;
  eventType: "饭局" | "酒局" | "其他";
  city: "香港" | "深圳";
  district: string;
  dateTime: string;
  registrationDeadline: string;
  status: string;
  registrationCount: number;
  spotsLeft: number;
  genderRestriction?: string | null;
}

// 后端 Seed 活动池标题列表：用于在非测试模式下前端隐藏这些 Demo 池子
const DEMO_POOL_TITLES = new Set([
  "深圳周末酒社",
  "周五港式美食盲盒",
  "湾仔下午茶聚会",
  "福田创意工作坊晚宴",
  "中环上班族酒局",
  "南山科技新贵晚宴",
  "深圳·深圳•南山区 饭局常驻池",
]);

// 本地 Seed 盲盒数据：仅在没有后端可用活动时展示，方便本地开发
const seedBlindBoxEvents = [
  {
    id: "seed-demo-1",
    date: "周五",
    time: "19:00",
    eventType: "饭局" as const,
    area: "深圳•南山区",
    city: "深圳" as const,
    mysteryTitle: "【Seed Demo】测试盲盒饭局",
    isAA: true,
  },
];

// 测试开关：通过环境变量控制是否展示本地 Seed 盲盒卡片
const TESTING_MODE =
  typeof import.meta !== "undefined" &&
  (import.meta as any).env &&
  (import.meta as any).env.VITE_SHOW_SEED_BLIND_BOX === "true";

console.log("[Discover] VITE_SHOW_SEED_BLIND_BOX =", (import.meta as any).env?.VITE_SHOW_SEED_BLIND_BOX);
console.log("[Discover] TESTING_MODE =", TESTING_MODE);

export default function DiscoverPage() {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<"香港" | "深圳">("深圳");
  const [selectedArea, setSelectedArea] = useState<string>("南山区");
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const markAsRead = useMarkNotificationsAsRead();

  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  // 进入发现页时清空 discover 通知（只执行一次）
  useEffect(() => {
    if (hasMarkedRead) return;
    console.log("[Discover] marking discover notifications as read");
    markAsRead.mutate("discover");
    setHasMarkedRead(true);
  }, [hasMarkedRead, markAsRead]);

  // 从后端获取所有可用的活动池
  const {
    data: eventPools = [],
    isLoading,
    isError,
  } = useQuery<EventPool[]>({
    queryKey: ["/api/event-pools"],
    enabled: true,
  });

  console.log("[Discover] loaded eventPools:", eventPools);

  const handleLocationSave = (city: "香港" | "深圳", area: string) => {
    setSelectedCity(city);
    setSelectedArea(area);
  };

  // 将后端的活动池数据转换成 BlindBoxEventCard 所需要的结构
  const transformEventPool = (pool: EventPool) => {
    try {
      const dateTime = parseISO(pool.dateTime);
      const dayOfWeek = format(dateTime, "EEEE", { locale: zhCN }); // e.g. 星期三
      const time = format(dateTime, "HH:mm");
      const area = `${pool.city}•${pool.district}`;

      const mysteryTitle = pool.title || `神秘${pool.eventType}｜等你揭晓`;

      const isGirlsNight =
        pool.genderRestriction === "仅限女性" ||
        pool.title?.toLowerCase().includes("girls") ||
        pool.title?.includes("女性") ||
        pool.title?.includes("闺蜜") ||
        false;

      return {
        // 唯一 ID，同步用作前端 key
        id: pool.id,
        // 关联的活动池 ID，供 JoinBlindBoxSheet / 支付页写入正确的池子
        poolId: pool.id,
        date: dayOfWeek,
        time,
        eventType:
          (pool.eventType === "其他" ? "饭局" : pool.eventType) as
            | "饭局"
            | "酒局",
        area,
        city: pool.city,
        mysteryTitle,
        isAA: true,
        // priceTier 由用户在 JoinBlindBoxSheet 中选择，这里不预填
        isGirlsNight,
      };
    } catch (error) {
      console.error("[Discover] Error transforming event pool:", pool, error);
      return null;
    }
  };

  const now = new Date();

  const filteredBlindBoxEvents = eventPools
    .filter((pool) => {
      // 城市必须匹配
      if (pool.city !== selectedCity) return false;

      // 如果不是测试模式，则隐藏后端的 Demo Seed 池子
      if (!TESTING_MODE && DEMO_POOL_TITLES.has(pool.title)) {
        console.log("[Discover] hiding demo seed pool because TESTING_MODE=false:", pool.title);
        return false;
      }

      // 区域（商圈）包含选中的区域
      if (selectedArea && !pool.district?.includes(selectedArea)) return false;

      // 只展示招募中的池子
      if (pool.status !== "active") return false;

      // 报名截止时间必须在当前时间之后（还可以报名）
      try {
        const deadline = new Date(pool.registrationDeadline);
        if (Number.isNaN(deadline.getTime())) {
          console.warn("[Discover] invalid registrationDeadline on pool:", pool);
          return false;
        }
        if (deadline < now) return false;
      } catch (e) {
        console.error("[Discover] error parsing registrationDeadline:", pool, e);
        return false;
      }

      return true;
    })
    .map(transformEventPool)
    .filter(
      (event): event is NonNullable<ReturnType<typeof transformEventPool>> =>
        event !== null,
    );

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
              // 加载中
              <div className="text-center py-8">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-4">加载中...</p>
              </div>
            ) : filteredBlindBoxEvents.length > 0 ? (
              // 有真实活动池数据，正常渲染
              filteredBlindBoxEvents.map((event) => (
                <BlindBoxEventCard key={event.id} {...event} />
              ))
            ) : (
              // 没有真实活动池数据时：提示 + Seed Demo 卡片
              <>
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    暂无{selectedCity}
                    {selectedArea ? `·${selectedArea}` : ""}的盲盒活动
                  </p>
                  <p className="text-sm mt-2">
                    Admin 还没创建活动池，或当前筛选条件下没有可用活动。
                  </p>
                  {isError && (
                    <p className="text-xs mt-2 text-red-500">
                      （注意：请求 /api/event-pools 时出现错误，当前为 Demo 数据）
                    </p>
                  )}
                  {/* <p className="text-xs mt-2 text-amber-500">
                    当前展示的是本地 Seed Demo 盲盒活动卡片，方便你测试 UI，
                    一旦后端有真实活动池数据，这个 Seed 会自动消失。
                  </p> */}
                </div>

                {TESTING_MODE &&
                  seedBlindBoxEvents.map((event) => (
                    <BlindBoxEventCard key={event.id} {...event} />
                  ))}
              </>
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