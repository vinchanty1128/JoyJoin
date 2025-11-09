import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [accessDenied, setAccessDenied] = useState(false);

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
      
      const userData = await apiRequest("GET", "/api/auth/user") as { isAdmin?: boolean };
      
      if (!userData.isAdmin) {
        setAccessDenied(true);
        toast({
          title: "无权访问",
          description: "该账号没有管理员权限",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "登录成功",
        description: "欢迎访问管理后台",
      });
      setLocation("/admin");
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
    setAccessDenied(false);
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
    setAccessDenied(false);
    loginMutation.mutate({ phoneNumber, code: verificationCode });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow-md">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold">管理后台</CardTitle>
            <CardDescription className="mt-2">
              悦聚·Joy Admin Portal
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {accessDenied && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                该账号没有管理员权限，请使用管理员账号登录
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-phone" className="text-sm font-medium">
                管理员手机号
              </Label>
              <Input
                id="admin-phone"
                type="tel"
                placeholder="请输入11位手机号"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                maxLength={11}
                className="h-11"
                data-testid="input-admin-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-code" className="text-sm font-medium">
                验证码
              </Label>
              <div className="flex gap-2">
                <Input
                  id="admin-code"
                  type="text"
                  placeholder="请输入验证码"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="h-11"
                  data-testid="input-admin-code"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sendCodeMutation.isPending}
                  className="min-w-[100px] h-11"
                  data-testid="button-send-admin-code"
                >
                  {countdown > 0 ? `${countdown}秒` : codeSent ? "重新发送" : "发送验证码"}
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-11"
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? "验证中..." : "登录管理后台"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              仅限授权管理员访问 · 所有操作将被记录
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
