import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Zap, Heart } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-6 py-12">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">悦聚·Joy</h1>
            <p className="text-lg text-muted-foreground">小局·好能量</p>
          </div>

          <p className="text-base text-muted-foreground max-w-md mx-auto">
            在香港和深圳，发现你的小圈子。5-10人的微型聚会，AI智能匹配，透明评分，找到真正合拍的朋友。
          </p>

          <Button 
            size="lg" 
            className="mt-8"
            onClick={handleLogin}
            data-testid="button-login"
          >
            开始使用
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-12">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">5-10人微型局</h3>
                  <p className="text-sm text-muted-foreground">
                    小而美的聚会，让每个人都能参与对话，建立真实连接
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">AI智能匹配</h3>
                  <p className="text-sm text-muted-foreground">
                    语音性格测评，透明匹配评分，找到真正合拍的朋友
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">氛围标签发现</h3>
                  <p className="text-sm text-muted-foreground">
                    8种氛围标签，快速找到适合你心情的活动
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>专注香港和深圳本地社交</p>
        </div>
      </div>
    </div>
  );
}
