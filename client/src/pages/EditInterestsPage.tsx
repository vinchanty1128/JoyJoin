import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const interestsSchema = z.object({
  interestsTop: z.array(z.string()).optional(),
  budgetPreference: z.array(z.string()).optional(),
});

type InterestsForm = z.infer<typeof interestsSchema>;

const interestOptions = [
  "美食探店", "咖啡", "运动健身", "户外徒步", "艺术展览",
  "音乐会", "读书会", "摄影", "旅行", "电影",
  "游戏", "科技", "创业", "投资理财", "志愿服务"
];

const budgetOptions = ["经济实惠", "适中消费", "品质优先", "不设上限"];

export default function EditInterestsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery<any>({ queryKey: ["/api/auth/user"] });

  const form = useForm<InterestsForm>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      interestsTop: user?.interestsTop || [],
      budgetPreference: user?.budgetPreference || [],
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InterestsForm) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "保存成功",
        description: "兴趣偏好已更新",
      });
      setLocation("/profile/edit");
    },
    onError: (error: Error) => {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InterestsForm) => {
    updateMutation.mutate(data);
  };

  const toggleInterest = (interest: string) => {
    const current = form.watch("interestsTop") || [];
    if (current.includes(interest)) {
      form.setValue("interestsTop", current.filter(i => i !== interest));
    } else {
      form.setValue("interestsTop", [...current, interest]);
    }
  };

  const toggleBudget = (budget: string) => {
    const current = form.watch("budgetPreference") || [];
    if (current.includes(budget)) {
      form.setValue("budgetPreference", current.filter(b => b !== budget));
    } else {
      form.setValue("budgetPreference", [...current, budget]);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const selectedInterests = form.watch("interestsTop") || [];
  const selectedBudgets = form.watch("budgetPreference") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center h-14 px-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/profile/edit")}
            data-testid="button-back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-lg font-semibold">兴趣偏好</h1>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-8 max-w-2xl mx-auto pb-24">
        {/* Interests */}
        <div className="space-y-3">
          <Label className="text-base">兴趣爱好</Label>
          <p className="text-sm text-muted-foreground">选择你感兴趣的活动类型</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <Badge
                key={interest}
                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer text-sm py-2 px-4"
                onClick={() => toggleInterest(interest)}
                data-testid={`badge-interest-${interest}`}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Budget Preference */}
        <div className="space-y-3">
          <Label className="text-base">预算偏好</Label>
          <p className="text-sm text-muted-foreground">选择你的活动预算偏好</p>
          <div className="flex flex-wrap gap-2">
            {budgetOptions.map((budget) => (
              <Badge
                key={budget}
                variant={selectedBudgets.includes(budget) ? "default" : "outline"}
                className="cursor-pointer text-sm py-2 px-4"
                onClick={() => toggleBudget(budget)}
                data-testid={`badge-budget-${budget}`}
              >
                {budget}
              </Badge>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button 
            type="submit" 
            className="w-full"
            disabled={updateMutation.isPending}
            data-testid="button-save"
          >
            {updateMutation.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
