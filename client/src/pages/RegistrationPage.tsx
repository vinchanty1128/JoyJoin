import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      firstName: "",
      age: undefined,
      gender: undefined,
      relationshipStatus: undefined,
      hasKids: false,
      industry: "",
      placeOfOrigin: "",
      longTermBase: "",
      wechatId: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUser) => {
      return await apiRequest("POST", "/api/user/register", data);
    },
    onSuccess: () => {
      toast({
        title: "注册成功！",
        description: "现在让我们来了解你的社交风格",
      });
      // Redirect to personality test
      setLocation("/personality-test");
    },
    onError: (error: Error) => {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const industryOptions = [
    { value: "大厂", label: "大厂" },
    { value: "金融", label: "金融" },
    { value: "科技", label: "科技" },
    { value: "AI", label: "AI" },
    { value: "跨境电商", label: "跨境电商" },
    { value: "投资人", label: "投资人" },
    { value: "消费", label: "消费" },
    { value: "艺术", label: "艺术" },
    { value: "政府", label: "政府" },
    { value: "其他", label: "其他" },
  ];

  const cities = [
    { value: "深圳", label: "深圳" },
    { value: "香港", label: "香港" },
    { value: "广州", label: "广州" },
    { value: "北京", label: "北京" },
    { value: "上海", label: "上海" },
  ];

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        form.handleSubmit((data) => registerMutation.mutate(data))();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getFieldsForStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return ["firstName", "age", "gender"];
      case 2:
        return ["relationshipStatus", "hasKids", "industry"];
      case 3:
        return ["placeOfOrigin", "longTermBase"];
      default:
        return [];
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">完成注册</h1>
          <span className="text-sm text-muted-foreground">
            {step}/{totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <form className="max-w-md mx-auto space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">基本信息</h2>
                <p className="text-sm text-muted-foreground">
                  让我们先从基础信息开始
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">名字</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="请输入你的名字"
                    data-testid="input-first-name"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="age">年龄</Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register("age", { valueAsNumber: true })}
                    placeholder="16-80"
                    data-testid="input-age"
                  />
                  {form.formState.errors.age && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.age.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>性别</Label>
                  <RadioGroup
                    value={form.watch("gender")}
                    onValueChange={(value) => form.setValue("gender", value as any)}
                    className="grid grid-cols-2 gap-3 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" data-testid="radio-male" />
                      <Label htmlFor="male" className="cursor-pointer">男性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" data-testid="radio-female" />
                      <Label htmlFor="female" className="cursor-pointer">女性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Non-binary" id="non-binary" data-testid="radio-non-binary" />
                      <Label htmlFor="non-binary" className="cursor-pointer">非二元性别</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Prefer not to say" id="prefer-not" data-testid="radio-prefer-not" />
                      <Label htmlFor="prefer-not" className="cursor-pointer">不愿透露</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.gender && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Background */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">个人背景</h2>
                <p className="text-sm text-muted-foreground">
                  帮助我们更好地了解你
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>关系状态</Label>
                  <RadioGroup
                    value={form.watch("relationshipStatus")}
                    onValueChange={(value) => form.setValue("relationshipStatus", value as any)}
                    className="grid grid-cols-2 gap-3 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Single" id="single" data-testid="radio-single" />
                      <Label htmlFor="single" className="cursor-pointer">单身</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="In a relationship" id="relationship" data-testid="radio-relationship" />
                      <Label htmlFor="relationship" className="cursor-pointer">恋爱中</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Married" id="married" data-testid="radio-married" />
                      <Label htmlFor="married" className="cursor-pointer">已婚</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Prefer not to say" id="rel-prefer-not" data-testid="radio-rel-prefer-not" />
                      <Label htmlFor="rel-prefer-not" className="cursor-pointer">不愿透露</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.relationshipStatus && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.relationshipStatus.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>是否有孩子？</Label>
                  <RadioGroup
                    value={form.watch("hasKids") ? "yes" : "no"}
                    onValueChange={(value) => form.setValue("hasKids", value === "yes")}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="has-kids-yes" data-testid="radio-has-kids-yes" />
                      <Label htmlFor="has-kids-yes" className="cursor-pointer">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="has-kids-no" data-testid="radio-has-kids-no" />
                      <Label htmlFor="has-kids-no" className="cursor-pointer">否</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="industry">行业</Label>
                  <Select
                    value={form.watch("industry")}
                    onValueChange={(value) => form.setValue("industry", value)}
                  >
                    <SelectTrigger id="industry" data-testid="select-industry">
                      <SelectValue placeholder="选择你的行业" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.industry && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.industry.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location Info */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">地域信息</h2>
                <p className="text-sm text-muted-foreground">
                  最后一步了！
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="placeOfOrigin">籍贯</Label>
                  <Input
                    id="placeOfOrigin"
                    {...form.register("placeOfOrigin")}
                    placeholder="例如：广东深圳"
                    data-testid="input-place-of-origin"
                  />
                  {form.formState.errors.placeOfOrigin && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.placeOfOrigin.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="longTermBase">长期base</Label>
                  <Select
                    value={form.watch("longTermBase")}
                    onValueChange={(value) => form.setValue("longTermBase", value)}
                  >
                    <SelectTrigger id="longTermBase" data-testid="select-long-term-base">
                      <SelectValue placeholder="选择你的常驻城市" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.longTermBase && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.longTermBase.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="wechatId">微信号（选填）</Label>
                  <Input
                    id="wechatId"
                    {...form.register("wechatId")}
                    placeholder="你的微信号"
                    data-testid="input-wechat-id"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    用于活动通知和社交连接
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Navigation buttons */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
              data-testid="button-back"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              上一步
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={registerMutation.isPending}
            data-testid="button-next"
          >
            {step === totalSteps ? (
              registerMutation.isPending ? "提交中..." : "完成注册"
            ) : (
              <>
                下一步
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
