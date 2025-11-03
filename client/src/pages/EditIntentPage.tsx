import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

const intentSchema = z.object({
  intent: z.enum(["networking", "friends", "discussion", "fun", "romance"], {
    errorMap: () => ({ message: "请选择活动意图" }),
  }),
});

type IntentForm = z.infer<typeof intentSchema>;

export default function EditIntentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<any>({ queryKey: ["/api/auth/user"] });

  const form = useForm<IntentForm>({
    resolver: zodResolver(intentSchema),
    defaultValues: {
      intent: user?.intent || undefined,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: IntentForm) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "保存成功",
        description: "活动意图已更新",
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

  const onSubmit = (data: IntentForm) => {
    updateMutation.mutate(data);
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
          <h1 className="ml-2 text-lg font-semibold">活动意图</h1>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
        <div className="space-y-2">
          <Label>默认活动意图 *</Label>
          <p className="text-xs text-muted-foreground mb-2">
            你参加活动的主要目的是什么？这是默认设置，加入活动时可以调整
          </p>
          <div className="space-y-3 mt-2">
            {[
              { value: "networking", label: "拓展人脉", desc: "结识专业人士，扩大社交圈" },
              { value: "friends", label: "交朋友", desc: "寻找志同道合的朋友" },
              { value: "discussion", label: "深度讨论", desc: "交流想法，深入探讨话题" },
              { value: "fun", label: "娱乐放松", desc: "轻松愉快，享受社交时光" },
              { value: "romance", label: "浪漫社交", desc: "认识潜在的恋爱对象" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => form.setValue("intent", option.value as any)}
                className={`
                  w-full px-4 py-3 text-left rounded-md border transition-all
                  ${form.watch("intent") === option.value
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border hover-elevate active-elevate-2'
                  }
                `}
                data-testid={`button-intent-${option.value}`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
          {form.formState.errors.intent && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.intent.message}
            </p>
          )}
        </div>
      </form>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          className="w-full"
          disabled={updateMutation.isPending}
          data-testid="button-save"
        >
          {updateMutation.isPending ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}
