import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Calendar, Heart } from "lucide-react";

interface InsightsData {
  userGrowth: { date: string; count: number }[];
  eventTrends: { date: string; count: number }[];
  personalityDistribution: { archetype: string; count: number }[];
  engagementMetrics: {
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    avgEventsPerUser: number;
  };
}

export default function AdminDataInsightsPage() {
  const { data: insights, isLoading } = useQuery<InsightsData>({
    queryKey: ["/api/admin/insights"],
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">数据洞察</h1>
        <p className="text-muted-foreground mt-1">平台用户和活动数据分析</p>
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-metric-total-users">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {insights?.engagementMetrics.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">累计注册用户</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-active-users">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-users">
              {insights?.engagementMetrics.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">本月活跃用户</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-total-events">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总活动数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-events">
              {insights?.engagementMetrics.totalEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">累计创建活动</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-avg-events">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">人均活动</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-events">
              {insights?.engagementMetrics.avgEventsPerUser?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">平均每人参与活动数</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="personality" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personality" data-testid="tab-personality">性格分布</TabsTrigger>
          <TabsTrigger value="growth" data-testid="tab-growth">用户增长</TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">活动趋势</TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>社交角色分布</CardTitle>
              <CardDescription>各社交角色在用户中的分布情况</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : (
                <div className="space-y-2">
                  {insights?.personalityDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <span className="font-medium" data-testid={`personality-${idx}-name`}>{item.archetype}</span>
                      <span className="text-muted-foreground" data-testid={`personality-${idx}-count`}>
                        {item.count} 人
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>用户增长趋势</CardTitle>
              <CardDescription>按日期统计的用户注册数量</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : (
                <div className="space-y-2">
                  {insights?.userGrowth.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <span className="font-medium" data-testid={`growth-${idx}-date`}>{item.date}</span>
                      <span className="text-muted-foreground" data-testid={`growth-${idx}-count`}>
                        +{item.count} 人
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>活动创建趋势</CardTitle>
              <CardDescription>按日期统计的活动创建数量</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : (
                <div className="space-y-2">
                  {insights?.eventTrends.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <span className="font-medium" data-testid={`event-${idx}-date`}>{item.date}</span>
                      <span className="text-muted-foreground" data-testid={`event-${idx}-count`}>
                        {item.count} 场活动
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
