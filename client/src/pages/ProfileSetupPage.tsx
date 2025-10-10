import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const VIBE_OPTIONS = [
  { id: "relaxed", label: "悠闲", color: "from-blue-400 to-cyan-400" },
  { id: "playful", label: "玩乐", color: "from-pink-400 to-rose-400" },
  { id: "energetic", label: "活力", color: "from-orange-400 to-amber-400" },
  { id: "exploratory", label: "探索", color: "from-purple-400 to-violet-400" },
  { id: "cozy", label: "温馨", color: "from-emerald-400 to-teal-400" },
  { id: "adventurous", label: "冒险", color: "from-red-400 to-orange-400" },
  { id: "social", label: "社交", color: "from-yellow-400 to-lime-400" },
  { id: "creative", label: "创意", color: "from-indigo-400 to-purple-400" },
];

export default function ProfileSetupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  const setupMutation = useMutation({
    mutationFn: async (data: { displayName: string; vibes: string[] }) => {
      return await apiRequest("POST", "/api/profile/setup", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "资料已保存",
        description: "现在让我们了解你的性格特质",
      });
      setLocation("/onboarding/quiz");
    },
    onError: (error) => {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVibe = (vibeId: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibeId)
        ? prev.filter(id => id !== vibeId)
        : [...prev, vibeId]
    );
  };

  const handleSubmit = () => {
    if (!displayName.trim()) {
      toast({
        title: "请输入昵称",
        variant: "destructive",
      });
      return;
    }

    if (selectedVibes.length === 0) {
      toast({
        title: "请至少选择一个标签",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate({
      displayName: displayName.trim(),
      vibes: selectedVibes,
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

              <div className="space-y-3">
                <Label>选择你的氛围标签</Label>
                <p className="text-xs text-muted-foreground">
                  选择至少一个你感兴趣的活动氛围
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {VIBE_OPTIONS.map((vibe) => {
                    const isSelected = selectedVibes.includes(vibe.id);
                    return (
                      <button
                        key={vibe.id}
                        onClick={() => toggleVibe(vibe.id)}
                        data-testid={`button-vibe-${vibe.id}`}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${vibe.color}`} />
                          {isSelected && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-left">
                          {vibe.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
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
