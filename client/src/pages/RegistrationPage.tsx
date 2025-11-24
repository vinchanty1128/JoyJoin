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
import { intentOptions } from "@/lib/userFieldMappings";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { motion, AnimatePresence } from "framer-motion";
import RegistrationProgress from "@/components/RegistrationProgress";
import FieldInfoTooltip from "@/components/FieldInfoTooltip";

export default function RegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

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
      intent: [],
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
      console.log("[Frontend] Sending registration data:", data);
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
      case 4: // Intent
        return ["intent"];
      case 5: // Culture & Language
        return ["languagesComfort"];
      case 6: // Access & Safety (all optional)
        return [];
      default:
        return [];
    }
  };

  const progress = (step / totalSteps) * 100;

  // Field info configurations for tooltips
  const fieldInfos: Record<string, { title: string; description: string; visibility?: string }> = {
    educationLevel: {
      title: "为什么需要教育背景",
      description: "帮助我们了解你的学习经历和专业背景，用于更好地匹配志同道合的朋友",
      visibility: "👥 其他用户可见你的教育水平（除非你选择隐藏）"
    },
    industry: {
      title: "为什么需要工作信息",
      description: "了解你的职业方向，帮助寻找行业相关的有趣话题和志趣相投的人",
      visibility: "👥 默认只显示行业，职位可隐藏"
    },
    seniority: {
      title: "职级信息用途",
      description: "帮助配对时考虑职业发展阶段的匹配度",
      visibility: "🔒 仅用于匹配算法，不显示给其他用户"
    },
    languagesComfort: {
      title: "语言偏好",
      description: "确保你能舒适地与朋友沟通。支持多种语言选择",
      visibility: "👥 用于匹配和活动沟通"
    }
  };

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

  // Overseas regions - Popular study destinations
  const overseasRegionOptions = [
    "美国",
    "英国",
    "加拿大",
    "澳大利亚",
    "新西兰",
    "新加坡",
    "香港",
    "日本",
    "韩国",
    "德国",
    "法国",
    "其他",
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

  // 跳过注册功能（仅开发环境）
  const handleSkipRegistration = () => {
    // 计算一个合理的出生日期（28岁）
    const birthdate = new Date();
    birthdate.setFullYear(birthdate.getFullYear() - 28);
    const birthdateStr = birthdate.toISOString().split('T')[0];

    // 填充所有必填字段
    form.setValue("displayName", "测试用户");
    form.setValue("birthdate", birthdateStr);
    form.setValue("gender", "Woman");
    form.setValue("relationshipStatus", "Single");
    form.setValue("educationLevel", "Master's");
    form.setValue("studyLocale", "Overseas");
    form.setValue("overseasRegions", ["美国"]);
    form.setValue("industry", "科技初创");
    form.setValue("seniority", "Mid");
    form.setValue("workVisibility", "show_industry_only");
    form.setValue("intent", ["friends"]);
    form.setValue("languagesComfort", ["普通话", "英语"]);
    
    // 提交表单
    registerMutation.mutate(form.getValues());
  };

  // Toggle intent selection with flexible exclusivity logic
  const toggleIntent = (intentValue: "networking" | "friends" | "discussion" | "fun" | "romance" | "flexible") => {
    const current = form.watch("intent") || [];
    
    if (intentValue === "flexible") {
      // If selecting "flexible", clear all other intents
      if (current.includes("flexible")) {
        form.setValue("intent", []);
      } else {
        form.setValue("intent", ["flexible"]);
      }
    } else {
      // If selecting a specific intent
      if (current.includes(intentValue)) {
        // Deselect this intent
        form.setValue("intent", current.filter(i => i !== intentValue) as typeof current);
      } else {
        // Select this intent and remove "flexible" if present
        const newIntents = current.filter(i => i !== "flexible");
        form.setValue("intent", [...newIntents, intentValue] as typeof current);
      }
    }
  };

  const isDevelopment = import.meta.env.DEV;

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
                  <DatePicker
                    value={form.watch("birthdate") ? new Date(form.watch("birthdate")) : undefined}
                    onChange={(date) => {
                      if (date) {
                        form.setValue("birthdate", date.toISOString().split('T')[0]);
                      } else {
                        form.setValue("birthdate", "");
                      }
                    }}
                    maxDate={new Date()}
                    placeholder="选择出生日期"
                    data-testid="input-birthdate"
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
                  <div className="space-y-3 mt-2">
                    {[
                      { value: "Woman", label: "女性" },
                      { value: "Man", label: "男性" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue("gender", option.value as any)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("gender") === option.value
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-gender-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.gender && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gender.message}
                    </p>
                  )}
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
                  <div className="space-y-3 mt-2">
                    {[
                      { value: "Single", label: "单身" },
                      { value: "In a relationship", label: "恋爱中" },
                      { value: "Married/Partnered", label: "已婚/已结伴" },
                      { value: "It's complicated", label: "复杂" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue("relationshipStatus", option.value as any)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("relationshipStatus") === option.value
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
                  {form.formState.errors.relationshipStatus && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.relationshipStatus.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>孩子状况（可选）</Label>
                  <div className="space-y-3 mt-2">
                    {[
                      { value: "No kids", label: "无孩子" },
                      { value: "Expecting", label: "期待中" },
                      { value: "0-5", label: "0-5岁" },
                      { value: "6-12", label: "6-12岁" },
                      { value: "13-18", label: "13-18岁" },
                      { value: "Adult", label: "成年" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue("children", option.value as any)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("children") === option.value
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

                <Separator className="my-6" />

                <div>
                  <Label>教育水平（可选）</Label>
                  <div className="space-y-3 mt-2">
                    {[
                      { value: "High school/below", label: "高中及以下" },
                      { value: "Some college/Associate", label: "大专/副学士" },
                      { value: "Bachelor's", label: "本科" },
                      { value: "Master's", label: "硕士" },
                      { value: "Doctorate", label: "博士" },
                      { value: "Trade/Vocational", label: "职业培训" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue("educationLevel", option.value as any)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("educationLevel") === option.value
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-education-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>学习地点（可选）</Label>
                  <div className="space-y-3 mt-2">
                    {[
                      { value: "Local", label: "本地" },
                      { value: "Overseas", label: "海外" },
                      { value: "Both", label: "都有" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue("studyLocale", option.value as any)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("studyLocale") === option.value
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-study-locale-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
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
                              px-5 py-4 rounded-lg border transition-all text-left text-base
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
                  <Label>行业 *</Label>
                  <div className="space-y-3 mt-2">
                    {industryOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => form.setValue("industry", option)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("industry") === option
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-industry-${option}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
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
                  <div className="space-y-3 mt-2">
                    {[
                      { value: "Intern", label: "实习生" },
                      { value: "Junior", label: "初级" },
                      { value: "Mid", label: "中级" },
                      { value: "Senior", label: "高级" },
                      { value: "Founder", label: "创始人" },
                      { value: "Executive", label: "高管" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue("seniority", option.value as any)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("seniority") === option.value
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-seniority-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>工作信息可见性</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    控制其他人能看到你的多少工作信息
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: "hide_all", label: "完全隐藏" },
                      { value: "show_industry_only", label: "仅显示行业" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue("workVisibility", option.value as any)}
                        className={`
                          w-full px-5 py-4 text-left rounded-lg border transition-all text-base
                          ${form.watch("workVisibility") === option.value
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-work-visibility-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Intent */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">活动意图</h2>
                <p className="text-sm text-muted-foreground">
                  你参加活动的主要目的是什么？可以多选
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>默认活动意图 *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    这是你的默认偏好，加入活动时可以调整
                  </p>
                  <div className="space-y-3 mt-2">
                    {intentOptions.map((option) => {
                      const currentIntents = form.watch("intent") || [];
                      const isSelected = currentIntents.includes(option.value);
                      const isFlexible = option.value === "flexible";
                      const hasFlexible = currentIntents.includes("flexible");
                      const isDisabled = !isFlexible && hasFlexible;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleIntent(option.value)}
                          disabled={isDisabled}
                          className={`
                            w-full px-5 py-4 text-left rounded-lg border transition-all
                            ${isSelected
                              ? 'border-primary bg-primary/5 text-primary' 
                              : isDisabled
                              ? 'border-border bg-muted/30 text-muted-foreground cursor-not-allowed'
                              : 'border-border hover-elevate active-elevate-2'
                            }
                          `}
                          data-testid={`button-intent-${option.value}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
                              ${isSelected 
                                ? 'bg-primary border-primary' 
                                : 'border-border'
                              }
                            `}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-base">{option.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.intent && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.intent.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Culture & Language */}
          {step === 5 && (
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
                            px-5 py-4 rounded-lg border transition-all text-left text-base
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

          {/* Step 6: Access & Safety */}
          {step === 6 && (
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
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex gap-3">
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
          
          {/* 开发环境跳过注册按钮 */}
          {isDevelopment && (
            <Button
              variant="ghost"
              onClick={handleSkipRegistration}
              className="w-full text-xs"
              disabled={registerMutation.isPending}
              data-testid="button-skip-registration"
            >
              跳过注册（测试）
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
