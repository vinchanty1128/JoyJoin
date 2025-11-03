import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const workSchema = z.object({
  industry: z.string().optional(),
  roleTitleShort: z.string().optional(),
  seniority: z.enum(["Intern", "Junior", "Mid", "Senior", "Founder", "Executive"]).optional(),
});

type WorkForm = z.infer<typeof workSchema>;

const industryOptions = [
  "大厂", "金融", "科技初创", "AI/ML", "跨境电商", "投资",
  "咨询", "消费品", "艺术/设计", "教育", "医疗", "政府/公共", "其他"
];

export default function EditWorkPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery<any>({ queryKey: ["/api/auth/user"] });

  const form = useForm<WorkForm>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      industry: user?.industry || "",
      roleTitleShort: user?.roleTitleShort || "",
      seniority: user?.seniority || undefined,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: WorkForm) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "保存成功",
        description: "工作信息已更新",
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

  const onSubmit = (data: WorkForm) => {
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
          <h1 className="ml-2 text-lg font-semibold">工作信息</h1>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">行业</Label>
          <Select
            value={form.watch("industry") || ""}
            onValueChange={(value) => form.setValue("industry", value)}
          >
            <SelectTrigger data-testid="select-industry">
              <SelectValue placeholder="选择行业" />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Title */}
        <div className="space-y-2">
          <Label htmlFor="roleTitleShort">职位</Label>
          <Input
            id="roleTitleShort"
            placeholder="例如：产品经理、软件工程师等"
            {...form.register("roleTitleShort")}
            data-testid="input-roleTitleShort"
          />
        </div>

        {/* Seniority */}
        <div className="space-y-2">
          <Label htmlFor="seniority">资历</Label>
          <Select
            value={form.watch("seniority") || ""}
            onValueChange={(value) => form.setValue("seniority", value as any)}
          >
            <SelectTrigger data-testid="select-seniority">
              <SelectValue placeholder="选择资历" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Intern">实习生</SelectItem>
              <SelectItem value="Junior">初级</SelectItem>
              <SelectItem value="Mid">中级</SelectItem>
              <SelectItem value="Senior">高级</SelectItem>
              <SelectItem value="Founder">创始人</SelectItem>
              <SelectItem value="Executive">高管</SelectItem>
            </SelectContent>
          </Select>
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
