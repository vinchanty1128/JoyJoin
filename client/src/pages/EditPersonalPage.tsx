import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type PersonalData = {
  relationshipStatus?: string;
  children?: string;
};

const relationshipOptions = [
  { value: "Single", label: "单身" },
  { value: "In a relationship", label: "恋爱中" },
  { value: "Married/Partnered", label: "已婚/已结伴" },
];

const childrenOptions = [
  { value: "No kids", label: "无孩子" },
  { value: "Expecting", label: "期待中" },
  { value: "Has kids", label: "有孩子" },
];

export default function EditPersonalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery<any>({ queryKey: ["/api/auth/user"] });
  
  const [relationshipStatus, setRelationshipStatus] = useState<string | undefined>(user?.relationshipStatus);
  const [children, setChildren] = useState<string | undefined>(user?.children);

  const updateMutation = useMutation({
    mutationFn: async (data: PersonalData) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "保存成功",
        description: "个人背景已更新",
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

  const handleSave = () => {
    updateMutation.mutate({
      relationshipStatus,
      children,
    });
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
          <h1 className="ml-2 text-lg font-semibold">个人背景</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-8 max-w-2xl mx-auto pb-24">
        {/* Relationship Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">关系状态</h2>
          <div className="space-y-3">
            {relationshipOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRelationshipStatus(option.value)}
                className={`
                  w-full px-4 py-3 text-left rounded-md border transition-all
                  ${relationshipStatus === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover-elevate active-elevate-2'
                  }
                `}
                data-testid={`button-relationship-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Children Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">孩子状况</h2>
          <div className="space-y-3">
            {childrenOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setChildren(option.value)}
                className={`
                  w-full px-4 py-3 text-left rounded-md border transition-all
                  ${children === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover-elevate active-elevate-2'
                  }
                `}
                data-testid={`button-children-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-center text-sm text-muted-foreground">
          💡 提示：此信息仅自己可见
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button 
            onClick={handleSave}
            className="w-full"
            disabled={updateMutation.isPending}
            data-testid="button-save"
          >
            {updateMutation.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
