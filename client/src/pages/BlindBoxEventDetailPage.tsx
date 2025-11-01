import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, DollarSign, Users, Phone, Navigation, AlertCircle } from "lucide-react";
import type { BlindBoxEvent } from "@shared/schema";
import { getCurrencySymbol } from "@/lib/currency";
import { calculateAge } from "@shared/utils";
import IcebreakerTool from "@/components/IcebreakerTool";
import PostMatchEventCard from "@/components/PostMatchEventCard";
import { useAuth } from "@/hooks/useAuth";

export default function BlindBoxEventDetailPage() {
  const { eventId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: event, isLoading } = useQuery<BlindBoxEvent>({
    queryKey: ["/api/blind-box-events", eventId],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <p className="text-muted-foreground">活动不存在</p>
        </div>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(event.city as "香港" | "深圳");

  const formatDateTime = (dateTime: Date) => {
    const date = new Date(dateTime);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${weekday} ${hours}:${minutes}`;
  };

  const getCountdown = (dateTime: Date) => {
    const now = new Date();
    const eventDate = new Date(dateTime);
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff <= 0) return "活动进行中";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `还剩 ${days}天 ${hours}小时`;
    } else {
      return `还剩 ${hours}小时`;
    }
  };

  const getParticipantInfo = () => {
    if (event.isGirlsNight) {
      return `${event.totalParticipants}人 Girls Night`;
    }
    if (event.maleCount && event.femaleCount) {
      return `${event.totalParticipants}人（${event.maleCount}男${event.femaleCount}女）`;
    }
    return `${event.totalParticipants}人`;
  };

  const handleNavigation = () => {
    if (event.restaurantLat && event.restaurantLng) {
      const restaurantName = encodeURIComponent(event.restaurantName || '目的地');
      
      // 深圳使用高德地图，香港使用Google Maps
      if (event.city === '深圳') {
        window.open(`https://uri.amap.com/navigation?to=${event.restaurantLng},${event.restaurantLat},${restaurantName}&mode=car&coordinate=gaode`, '_blank');
      } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.restaurantLat},${event.restaurantLng}`, '_blank');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center h-14 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/events")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 font-semibold">活动详情</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 顶部摘要 */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold flex-1">{event.eventType}</h2>
                {event.isGirlsNight && (
                  <Badge className="bg-pink-500 hover:bg-pink-600">
                    👭 Girls Night
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{formatDateTime(event.dateTime)}</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">{getCountdown(event.dateTime)}</span>
              </div>
            </div>

            {(event.status === "matched" || event.status === "completed") && event.totalParticipants && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{getParticipantInfo()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 地点信息 (仅已匹配或已完成显示) */}
        {(event.status === "matched" || event.status === "completed") && event.restaurantName && (<>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">地点信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{event.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">{event.restaurantAddress}</p>
                    <p className="text-xs text-muted-foreground">{event.city}•{event.district}</p>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleNavigation}
                data-testid="button-navigate"
              >
                <Navigation className="h-4 w-4 mr-2" />
                到这去
              </Button>
            </CardContent>
          </Card>
        </>)}

        {/* 预算与菜式 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">预算与菜式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{currencySymbol}{event.budgetTier}（人均AA）</span>
            </div>

            {event.cuisineTags && event.cuisineTags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">菜式/酒类</p>
                <div className="flex flex-wrap gap-1.5">
                  {event.cuisineTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post-Match Event Card: Attendee Insights & Match Explanation */}
        {(event.status === "matched" || event.status === "completed") && event.matchedAttendees && Array.isArray(event.matchedAttendees) && (
          <PostMatchEventCard 
            matchedAttendees={event.matchedAttendees as Array<{
              userId: string;
              displayName: string;
              archetype?: string;
              topInterests?: string[];
              industry?: string;
              ageVisible?: boolean;
              industryVisible?: boolean;
            }>}
            matchExplanation={event.matchExplanation || undefined}
            userInterests={(user?.interestsRankedTop3 as string[] | undefined) || ["film_entertainment", "travel_exploration"]}
            userEducationLevel={user?.educationLevel || "Master's"}
            userIndustry={user?.industry || "科技"}
            userAge={user?.birthdate ? calculateAge(user.birthdate) : undefined}
            userGender={user?.gender || undefined}
            userRelationshipStatus={user?.relationshipStatus || "Single"}
            userChildren={user?.children || undefined}
            userStudyLocale={user?.studyLocale || "Overseas"}
            userOverseasRegions={user?.overseasRegions as string[] | undefined}
            userSeniority={user?.seniority || "Mid"}
            userFieldOfStudy={user?.fieldOfStudy || undefined}
            userLanguages={user?.languagesComfort as string[] | undefined}
            userHometownCountry={user?.hometownCountry || undefined}
            userHometownRegionCity={user?.hometownRegionCity || undefined}
            userHometownAffinityOptin={user?.hometownAffinityOptin ?? undefined}
          />
        )}

        {/* 破冰工具 (仅已匹配或已完成显示) */}
        {(event.status === "matched" || event.status === "completed") && (
          <IcebreakerTool />
        )}

        {/* 规则与到场指南 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">规则与到场指南</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p>请提前10分钟到场</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p>开局前24小时内不可退</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p>迟到/缺席将影响信用分</p>
            </div>
          </CardContent>
        </Card>

        {/* 帮助与支持 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">帮助与支持</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" data-testid="button-contact-support">
              <Phone className="h-4 w-4 mr-2" />
              联系支持
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
