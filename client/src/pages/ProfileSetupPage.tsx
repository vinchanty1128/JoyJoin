import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function ProfileSetupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");

  const setupMutation = useMutation({
    mutationFn: async (data: { displayName: string }) => {
      return await apiRequest("POST", "/api/profile/setup", data);
    },
    onSuccess: async () => {
      // Refetch auth user to update onboarding state
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "资料已保存",
        description: "欢迎来到悦聚！",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!displayName.trim()) {
      toast({
        title: "请输入昵称",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate({
      displayName: displayName.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-display font-bold">完善资料</h1>
            <p className="text-sm text-muted-foreground">
              让大家更好地认识你
            </p>
          </div>

          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">昵称</Label>
                <Input
                  id="displayName"
                  placeholder="输入你的昵称"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  data-testid="input-display-name"
                />
                <p className="text-xs text-muted-foreground">
                  这是其他人看到的名字
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={setupMutation.isPending}
            data-testid="button-save-profile"
          >
            {setupMutation.isPending ? "保存中..." : "继续"}
          </Button>
        </div>
      </div>
    </div>
  );
}
