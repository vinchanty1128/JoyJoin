import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function RegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      displayName: "",
      birthdate: "",
      ageVisibility: "hide_all",
      gender: undefined,
      pronouns: undefined,
      relationshipStatus: undefined,
      children: undefined,
      educationLevel: undefined,
      studyLocale: undefined,
      overseasRegions: [],
      fieldOfStudy: "",
      educationVisibility: "hide_all",
      industry: "",
      roleTitleShort: "",
      seniority: undefined,
      workVisibility: "show_industry_only",
      hometownCountry: "",
      hometownRegionCity: "",
      hometownAffinityOptin: false,
      languagesComfort: [],
      accessibilityNeeds: "",
      safetyNoteHost: "",
      wechatId: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUser) => {
      return await apiRequest("POST", "/api/user/register", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "注册成功！",
        description: "现在让我们了解你的兴趣和话题偏好",
      });
      
      setLocation("/interests-topics");
    },
    onError: (error: Error) => {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      case 1: // Identity
        return ["displayName", "birthdate", "gender"];
      case 2: // Background & Education
        return ["relationshipStatus", "educationLevel"];
      case 3: // Work
        return ["industry", "seniority", "workVisibility"];
      case 4: // Culture & Language
        return ["languagesComfort"];
      case 5: // Access & Safety (all optional)
        return [];
      default:
        return [];
    }
  };

  const progress = (step / totalSteps) * 100;

  // Language options
  const languageOptions = [
    "普通话",
    "粤语",
    "英语",
    "日语",
    "韩语",
    "法语",
    "德语",
    "西班牙语",
  ];

  // Overseas regions
  const overseasRegionOptions = [
    "北美",
    "欧洲",
    "东亚",
    "东南亚",
    "南亚",
    "中东",
    "大洋洲",
    "拉美",
    "非洲",
  ];

  const industryOptions = [
    "大厂",
    "金融",
    "科技初创",
    "AI/ML",
    "跨境电商",
    "投资",
    "咨询",
    "消费品",
    "艺术/设计",
    "教育",
    "医疗",
    "政府/公共",
    "其他",
  ];

  const toggleLanguage = (lang: string) => {
    const current = form.watch("languagesComfort") || [];
    if (current.includes(lang)) {
      form.setValue("languagesComfort", current.filter(l => l !== lang));
    } else {
      form.setValue("languagesComfort", [...current, lang]);
    }
  };

  const toggleOverseasRegion = (region: string) => {
    const current = form.watch("overseasRegions") || [];
    if (current.includes(region)) {
      form.setValue("overseasRegions", current.filter(r => r !== region));
    } else {
      form.setValue("overseasRegions", [...current, region]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">完成注册</h1>
          <span className="text-sm text-muted-foreground">
            {step}/{totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" data-testid="progress-bar" />
      </div>

      {/* Form content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <form className="max-w-md mx-auto space-y-6 pb-20">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">基本身份</h2>
                <p className="text-sm text-muted-foreground">
                  让我们先从最基础的信息开始
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">昵称 *</Label>
                  <Input
                    id="displayName"
                    {...form.register("displayName")}
                    placeholder="在活动中显示的名字"
                    data-testid="input-display-name"
                  />
                  {form.formState.errors.displayName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.displayName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>出生日期 *</Label>
                  <Input
                    type="date"
                    value={form.watch("birthdate")}
                    onChange={(e) => form.setValue("birthdate", e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    data-testid="input-birthdate"
                    className="w-full"
                  />
                  {form.formState.errors.birthdate && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.birthdate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>年龄显示设置</Label>
                  <Select
                    value={form.watch("ageVisibility")}
                    onValueChange={(value: any) => form.setValue("ageVisibility", value)}
                  >
                    <SelectTrigger data-testid="select-age-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hide_all">完全隐藏</SelectItem>
                      <SelectItem value="show_exact_age">显示精确年龄</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    控制其他人能看到你的年龄信息
                  </p>
                </div>

                <div>
                  <Label>性别 *</Label>
                  <RadioGroup
                    value={form.watch("gender")}
                    onValueChange={(value) => form.setValue("gender", value as any)}
                    className="grid grid-cols-2 gap-3 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Woman" id="woman" data-testid="radio-woman" />
                      <Label htmlFor="woman" className="cursor-pointer">女性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Man" id="man" data-testid="radio-man" />
                      <Label htmlFor="man" className="cursor-pointer">男性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Nonbinary" id="nonbinary" data-testid="radio-nonbinary" />
                      <Label htmlFor="nonbinary" className="cursor-pointer">非二元性别</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Prefer not to say" id="prefer-not-gender" data-testid="radio-prefer-not-gender" />
                      <Label htmlFor="prefer-not-gender" className="cursor-pointer">不愿透露</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.gender && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gender.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>代词（可选）</Label>
                  <Select
                    value={form.watch("pronouns")}
                    onValueChange={(value: any) => form.setValue("pronouns", value)}
                  >
                    <SelectTrigger data-testid="select-pronouns">
                      <SelectValue placeholder="选择你的代词" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="She/Her">她 (She/Her)</SelectItem>
                      <SelectItem value="He/Him">他 (He/Him)</SelectItem>
                      <SelectItem value="They/Them">TA (They/Them)</SelectItem>
                      <SelectItem value="Self-describe">自定义</SelectItem>
                      <SelectItem value="Prefer not to say">不愿透露</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Background & Education */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">个人背景 & 教育</h2>
                <p className="text-sm text-muted-foreground">
                  帮助我们更好地了解你
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>关系状态 *</Label>
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
                      <RadioGroupItem value="In a relationship" id="in-relationship" data-testid="radio-in-relationship" />
                      <Label htmlFor="in-relationship" className="cursor-pointer">恋爱中</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Married/Partnered" id="married" data-testid="radio-married" />
                      <Label htmlFor="married" className="cursor-pointer">已婚/已结伴</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="It's complicated" id="complicated" data-testid="radio-complicated" />
                      <Label htmlFor="complicated" className="cursor-pointer">复杂</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Prefer not to say" id="prefer-not-rel" data-testid="radio-prefer-not-rel" />
                      <Label htmlFor="prefer-not-rel" className="cursor-pointer">不愿透露</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.relationshipStatus && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.relationshipStatus.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>孩子状况（可选）</Label>
                  <Select
                    value={form.watch("children")}
                    onValueChange={(value: any) => form.setValue("children", value)}
                  >
                    <SelectTrigger data-testid="select-children">
                      <SelectValue placeholder="选择你的孩子状况" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No kids">无孩子</SelectItem>
                      <SelectItem value="Expecting">期待中</SelectItem>
                      <SelectItem value="0-5">0-5岁</SelectItem>
                      <SelectItem value="6-12">6-12岁</SelectItem>
                      <SelectItem value="13-18">13-18岁</SelectItem>
                      <SelectItem value="Adult">成年</SelectItem>
                      <SelectItem value="Prefer not to say">不愿透露</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-6" />

                <div>
                  <Label>教育水平（可选）</Label>
                  <Select
                    value={form.watch("educationLevel")}
                    onValueChange={(value: any) => form.setValue("educationLevel", value)}
                  >
                    <SelectTrigger data-testid="select-education-level">
                      <SelectValue placeholder="选择你的教育水平" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High school/below">高中及以下</SelectItem>
                      <SelectItem value="Some college/Associate">大专/副学士</SelectItem>
                      <SelectItem value="Bachelor's">本科</SelectItem>
                      <SelectItem value="Master's">硕士</SelectItem>
                      <SelectItem value="Doctorate">博士</SelectItem>
                      <SelectItem value="Trade/Vocational">职业培训</SelectItem>
                      <SelectItem value="Prefer not to say">不愿透露</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>学习地点（可选）</Label>
                  <Select
                    value={form.watch("studyLocale")}
                    onValueChange={(value: any) => form.setValue("studyLocale", value)}
                  >
                    <SelectTrigger data-testid="select-study-locale">
                      <SelectValue placeholder="选择你的学习地点" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local">本地</SelectItem>
                      <SelectItem value="Overseas">海外</SelectItem>
                      <SelectItem value="Both">都有</SelectItem>
                      <SelectItem value="Prefer not to say">不愿透露</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(form.watch("studyLocale") === "Overseas" || form.watch("studyLocale") === "Both") && (
                  <div>
                    <Label>海外地区（可选）</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      选择你在海外学习的地区
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {overseasRegionOptions.map((region) => {
                        const isSelected = (form.watch("overseasRegions") || []).includes(region);
                        return (
                          <button
                            key={region}
                            type="button"
                            onClick={() => toggleOverseasRegion(region)}
                            data-testid={`button-region-${region}`}
                            className={`
                              px-3 py-2 text-sm rounded-md border transition-all text-left
                              ${isSelected 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-border hover-elevate active-elevate-2'
                              }
                            `}
                          >
                            {region}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="fieldOfStudy">专业领域（可选）</Label>
                  <Input
                    id="fieldOfStudy"
                    {...form.register("fieldOfStudy")}
                    placeholder="例如：计算机科学、商业管理"
                    data-testid="input-field-of-study"
                  />
                </div>

                <div>
                  <Label>教育信息可见性</Label>
                  <Select
                    value={form.watch("educationVisibility")}
                    onValueChange={(value: any) => form.setValue("educationVisibility", value)}
                  >
                    <SelectTrigger data-testid="select-education-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hide_all">完全隐藏</SelectItem>
                      <SelectItem value="show_level_only">仅显示学历</SelectItem>
                      <SelectItem value="show_level_and_field">显示学历和专业</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    控制其他人能看到你的多少教育信息
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Work */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">工作信息</h2>
                <p className="text-sm text-muted-foreground">
                  了解你的职业背景
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry">行业 *</Label>
                  <Select
                    value={form.watch("industry")}
                    onValueChange={(value) => form.setValue("industry", value)}
                  >
                    <SelectTrigger id="industry" data-testid="select-industry">
                      <SelectValue placeholder="选择你的行业" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
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

                <div>
                  <Label htmlFor="roleTitleShort">职位简称（可选）</Label>
                  <Input
                    id="roleTitleShort"
                    {...form.register("roleTitleShort")}
                    placeholder="例如：产品经理、工程师"
                    data-testid="input-role-title"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    简短的职位描述，不超过20个字
                  </p>
                </div>

                <div>
                  <Label>职级（可选）</Label>
                  <Select
                    value={form.watch("seniority")}
                    onValueChange={(value: any) => form.setValue("seniority", value)}
                  >
                    <SelectTrigger data-testid="select-seniority">
                      <SelectValue placeholder="选择你的职级" />
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

                <div>
                  <Label>工作信息可见性</Label>
                  <Select
                    value={form.watch("workVisibility")}
                    onValueChange={(value: any) => form.setValue("workVisibility", value)}
                  >
                    <SelectTrigger data-testid="select-work-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hide_all">完全隐藏</SelectItem>
                      <SelectItem value="show_industry_only">仅显示行业</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    控制其他人能看到你的多少工作信息
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Culture & Language */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">文化 & 语言</h2>
                <p className="text-sm text-muted-foreground">
                  让我们了解你的文化背景和语言偏好
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="hometownCountry">家乡国家/地区（可选）</Label>
                  <Input
                    id="hometownCountry"
                    {...form.register("hometownCountry")}
                    placeholder="例如：中国、美国、日本"
                    data-testid="input-hometown-country"
                  />
                </div>

                <div>
                  <Label htmlFor="hometownRegionCity">家乡城市（可选）</Label>
                  <Input
                    id="hometownRegionCity"
                    {...form.register("hometownRegionCity")}
                    placeholder="例如：深圳、北京、上海"
                    data-testid="input-hometown-city"
                  />
                </div>

                <div className="flex items-start space-x-2 py-2">
                  <Checkbox
                    id="hometownAffinityOptin"
                    checked={form.watch("hometownAffinityOptin")}
                    onCheckedChange={(checked) => form.setValue("hometownAffinityOptin", checked as boolean)}
                    data-testid="checkbox-hometown-affinity"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="hometownAffinityOptin" className="cursor-pointer font-normal">
                      优先匹配老乡
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      在活动匹配时，优先考虑来自相同家乡的人
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <Label>语言舒适度 *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    选择你可以舒适交流的语言
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {languageOptions.map((lang) => {
                      const isSelected = (form.watch("languagesComfort") || []).includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          data-testid={`button-lang-${lang}`}
                          className={`
                            px-3 py-2 text-sm rounded-md border transition-all text-left
                            ${isSelected 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-border hover-elevate active-elevate-2'
                            }
                          `}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.languagesComfort && (
                    <p className="text-sm text-destructive mt-2">
                      请至少选择一种语言
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Access & Safety */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">无障碍 & 安全</h2>
                <p className="text-sm text-muted-foreground">
                  最后一步！这些信息都是可选的
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2 bg-muted/30 p-3 rounded-md">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    以下信息将帮助活动主办方更好地照顾每位参与者，所有内容都是可选的且保密
                  </p>
                </div>

                <div>
                  <Label htmlFor="accessibilityNeeds">无障碍需求（可选）</Label>
                  <Textarea
                    id="accessibilityNeeds"
                    {...form.register("accessibilityNeeds")}
                    placeholder="例如：轮椅通道、助听设备、饮食限制等"
                    rows={3}
                    data-testid="textarea-accessibility"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    这些信息会私密地分享给活动主办方
                  </p>
                </div>

                <div>
                  <Label htmlFor="safetyNoteHost">安全备注给主办方（可选）</Label>
                  <Textarea
                    id="safetyNoteHost"
                    {...form.register("safetyNoteHost")}
                    placeholder="例如：药物过敏、紧急联系人信息等"
                    rows={3}
                    data-testid="textarea-safety-note"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    这些信息仅在紧急情况下可见
                  </p>
                </div>

                <Separator className="my-4" />

                <div>
                  <Label htmlFor="wechatId">微信号（可选）</Label>
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
      <div className="border-t p-4 bg-background sticky bottom-0">
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
