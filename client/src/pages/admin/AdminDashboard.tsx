import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Calendar, DollarSign, UserPlus, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "用户总数",
      value: "0",
      icon: Users,
      description: "注册用户",
    },
    {
      title: "订阅会员",
      value: "0",
      icon: CreditCard,
      description: "活跃会员数",
    },
    {
      title: "本月活动",
      value: "0",
      icon: Calendar,
      description: "已发布活动",
    },
    {
      title: "本月收入",
      value: "¥0",
      icon: DollarSign,
      description: "订阅 + 单次付费",
    },
    {
      title: "新增用户",
      value: "0",
      icon: UserPlus,
      description: "本周新用户",
    },
    {
      title: "用户增长",
      value: "0%",
      icon: TrendingUp,
      description: "相比上周",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">数据看板</h2>
        <p className="text-muted-foreground">核心业务指标概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`stat-card-${stat.title}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`stat-value-${stat.title}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>性格类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              数据图表开发中
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>用户增长趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              数据图表开发中
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
