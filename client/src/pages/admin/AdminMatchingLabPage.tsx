import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sliders, TestTube2, Zap, BarChart3 } from "lucide-react";

export default function AdminMatchingLabPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">匹配实验室</h1>
        <p className="text-muted-foreground mt-1">调整AI匹配算法参数和测试场景</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover-elevate cursor-pointer" data-testid="card-algorithm-weights">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sliders className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>算法权重</CardTitle>
                <CardDescription>调整匹配因子的权重配置</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持调整话题、性格、年龄、地域等匹配因子权重
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-test-scenarios">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TestTube2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>测试场景</CardTitle>
                <CardDescription>模拟用户匹配场景测试</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持创建虚拟用户、运行匹配测试、查看匹配结果
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-ab-testing">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>A/B测试</CardTitle>
                <CardDescription>算法版本灰度测试</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持多版本算法对比、用户分流、效果统计
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-performance">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>性能监控</CardTitle>
                <CardDescription>匹配算法性能指标</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持匹配成功率、用户满意度、响应时间等监控
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
