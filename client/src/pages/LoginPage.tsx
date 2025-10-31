import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Wand2, Gift, Zap } from "lucide-react";
import { SiWechat } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function LoginPage() {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendCodeMutation = useMutation({
    mutationFn: async (phone: string) => {
      return await apiRequest("POST", "/api/auth/send-code", { phoneNumber: phone });
    },
    onSuccess: () => {
      setCodeSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({
        title: "验证码已发送",
        description: "请查收短信验证码",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; code: string }) => {
      return await apiRequest("POST", "/api/auth/phone-login", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // 🎯 DEMO: 自动生成演示活动数据
      try {
        await apiRequest("POST", "/api/demo/seed-events", {});
        console.log("✅ Demo events seeded");
      } catch (error) {
        console.log("Demo events may already exist:", error);
      }
      
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length !== 11) {
      toast({
        title: "手机号格式错误",
        description: "请输入11位手机号",
        variant: "destructive",
      });
      return;
    }
    sendCodeMutation.mutate(phoneNumber);
  };

  const handleLogin = () => {
    if (!phoneNumber || !verificationCode) {
      toast({
        title: "信息不完整",
        description: "请输入手机号和验证码",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ phoneNumber, code: verificationCode });
  };

  const handleWeChatLogin = () => {
    toast({
      title: "微信登录",
      description: "微信授权登录功能开发中，敬请期待",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">悦聚·Joy</h1>
            <p className="text-lg text-muted-foreground">小局·好能量</p>
          </div>

          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            在香港和深圳，发现你的小圈子
          </p>
        </div>

        {/* Login Card */}
        <Card className="border shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* WeChat Login */}
            <Button
              size="lg"
              className="w-full bg-[#07C160] hover:bg-[#06AD56] text-white border-0"
              onClick={handleWeChatLogin}
              data-testid="button-wechat-login"
            >
              <SiWechat className="h-5 w-5 mr-2" />
              微信登录
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">或使用手机号登录</span>
              </div>
            </div>

            {/* Phone Number Login */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入11位手机号"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">验证码</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入验证码"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    data-testid="input-code"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || sendCodeMutation.isPending}
                    className="min-w-[100px]"
                    data-testid="button-send-code"
                  >
                    {countdown > 0 ? `${countdown}秒` : codeSent ? "重新发送" : "发送验证码"}
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleLogin}
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "登录中..." : "登录"}
              </Button>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-muted-foreground">
              登录即表示同意
              <a href="#" className="text-primary hover:underline">《用户协议》</a>
              和
              <a href="#" className="text-primary hover:underline">《隐私政策》</a>
            </p>
          </CardContent>
        </Card>

        {/* Product Features */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* 4-6人小局 */}
            <Card className="border hover-elevate">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">4-6人精品小局</h3>
                  <p className="text-xs text-muted-foreground">神秘饭局·深度社交</p>
                </div>
              </CardContent>
            </Card>

            {/* AI智能匹配 */}
            <Card className="border hover-elevate">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wand2 className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">AI智能匹配</h3>
                  <p className="text-xs text-muted-foreground">8维画像·精准连接</p>
                </div>
              </CardContent>
            </Card>

            {/* 神秘盲盒 */}
            <Card className="border hover-elevate">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">神秘盲盒体验</h3>
                  <p className="text-xs text-muted-foreground">翻卡解锁·惊喜相遇</p>
                </div>
              </CardContent>
            </Card>

            {/* 能量场发现 */}
            <Card className="border hover-elevate">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">能量场发现</h3>
                  <p className="text-xs text-muted-foreground">三级稀有度·游戏化</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          专注香港和深圳本地社交
        </p>
      </div>
    </div>
  );
}
