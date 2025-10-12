import React, { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Copy, 
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  DollarSign
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface JoinBlindBoxSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventData: {
    date: string;
    time: string;
    eventType: "饭局" | "酒局";
    area: string;
    priceTier?: string;
    isAA?: boolean;
    isGirlsNight?: boolean;
  };
}

export default function JoinBlindBoxSheet({ 
  open, 
  onOpenChange, 
  eventData 
}: JoinBlindBoxSheetProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [inviteFriends, setInviteFriends] = useState(false);
  const [friendsCount, setFriendsCount] = useState<1 | 2>(1);
  const [mustMatchTogether, setMustMatchTogether] = useState(true);
  
  // 预算偏好 - 可多选
  const [budgetPreference, setBudgetPreference] = useState<string[]>([]);
  
  // 确认弹窗状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // 提升成功率选项
  const [acceptNearby, setAcceptNearby] = useState(false);
  const [flexibleTime, setFlexibleTime] = useState(false);
  const [typeSubstitute, setTypeSubstitute] = useState(false);
  const [noStrictRestrictions, setNoStrictRestrictions] = useState(false);
  const [prioritizeFast, setPrioritizeFast] = useState(false);

  const budgetOptions = [
    { value: "100以下", label: "¥100以下" },
    { value: "100-200", label: "¥100-200" },
    { value: "300-500", label: "¥300-500" },
    { value: "500+", label: "¥500+" },
  ];

  const toggleBudget = (value: string) => {
    setBudgetPreference(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const saveBudgetMutation = useMutation({
    mutationFn: async (budgetPreference: string[]) => {
      return await apiRequest("POST", "/api/profile/budget", {
        budgetPreference,
      });
    },
    onError: (error) => {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyInviteLink = () => {
    const link = `https://joyjoin.app/invite/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(link);
    toast({
      description: "已复制邀请链接",
      duration: 2000,
    });
  };

  const handleConfirm = () => {
    if (budgetPreference.length === 0) {
      toast({
        title: "请选择预算范围",
        description: "至少选择一个预算档位",
        variant: "destructive",
      });
      return;
    }

    // 打开确认弹窗
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = async () => {
    // 保存预算偏好到用户profile
    try {
      await saveBudgetMutation.mutateAsync(budgetPreference);
      
      setShowConfirmDialog(false);
      onOpenChange(false);
      // 导航到付费页面
      setTimeout(() => {
        setLocation("/blindbox/payment");
      }, 300);
    } catch (error) {
      // Error already handled by mutation's onError
    }
  };

  const getConfirmButtonText = () => {
    if (inviteFriends) {
      return "确认参与（我和朋友）";
    }
    return "确认参与";
  };

  return (
    <React.Fragment>
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content 
          className="bg-background flex flex-col rounded-t-[10px] h-[70vh] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none"
          data-testid="drawer-join-blindbox"
        >
          {/* 拖拽指示器 */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4 mb-4" />
          
          {/* 可滚动内容 */}
          <div className="overflow-y-auto flex-1 px-4 pb-6">
            {/* 标题 */}
            <Drawer.Title className="text-xl font-bold mb-4" data-testid="text-join-title">
              确认参与信息
            </Drawer.Title>

            {/* A. 报名摘要 */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">{eventData.date} {eventData.time}</span>
                  <Badge variant="secondary" className="text-xs">
                    {eventData.eventType}
                  </Badge>
                  {eventData.isGirlsNight && (
                    <Badge className="text-xs bg-pink-500 hover:bg-pink-600">
                      👭 Girls Night
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-primary"
                  data-testid="button-modify-time"
                >
                  修改
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{eventData.area}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>最少4人，最多6人</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>当天现场AA</span>
              </div>
            </div>

            {/* === USER PREFERENCES SECTION === */}
            <div className="mb-6 space-y-6">
              {/* 预算选择 */}
              <div>
                <div className="mb-3">
                  <h3 className="text-base font-semibold mb-1">你的预算范围？</h3>
                  <p className="text-xs text-muted-foreground">(必填)</p>
                </div>
                <div className="space-y-3">
                  {budgetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleBudget(option.value)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-border bg-background transition-all hover-elevate"
                      data-testid={`button-budget-${option.value}`}
                    >
                      <span className="font-medium text-base">{option.label}</span>
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        budgetPreference.includes(option.value)
                          ? 'bg-foreground border-foreground'
                          : 'border-foreground/30'
                      }`}>
                        {budgetPreference.includes(option.value) && (
                          <CheckCircle2 className="h-4 w-4 text-background" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 带朋友一起 */}
              <Collapsible open={inviteFriends} onOpenChange={setInviteFriends}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="invite-friends" className="text-base font-semibold cursor-pointer">
                      邀请朋友
                    </Label>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Switch 
                    id="invite-friends" 
                    checked={inviteFriends} 
                    onCheckedChange={setInviteFriends}
                    data-testid="switch-invite-friends"
                  />
                </div>
                
                <CollapsibleContent className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    与朋友一起报名更有安全感与话题感，同组将优先同局匹配
                  </p>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm mb-2 block">选择人数</Label>
                      <div className="inline-flex rounded-lg p-1 bg-muted">
                        <button
                          onClick={() => setFriendsCount(1)}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            friendsCount === 1
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground"
                          }`}
                          data-testid="button-friends-1"
                        >
                          1位朋友
                        </button>
                        <button
                          onClick={() => setFriendsCount(2)}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            friendsCount === 2
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground"
                          }`}
                          data-testid="button-friends-2"
                        >
                          2位朋友
                        </button>
                      </div>
                    </div>

                    {friendsCount === 2 && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          本局上限6人，系统将优先匹配3–4位陌生同伴
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm mb-2 block">邀请方式</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="输入手机号或用户名" 
                          className="flex-1"
                          data-testid="input-friend-contact"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleCopyInviteLink}
                          data-testid="button-copy-invite-link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="match-together" 
                        checked={mustMatchTogether}
                        onCheckedChange={setMustMatchTogether}
                        data-testid="switch-match-together"
                      />
                      <Label htmlFor="match-together" className="text-sm cursor-pointer">
                        同组必同局匹配
                        <span className="text-xs text-muted-foreground ml-1">（可能延长匹配时长）</span>
                      </Label>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 提升成功率 */}
              <div>
                <h3 className="text-base font-semibold mb-3">提升成功率</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="accept-nearby" 
                      checked={acceptNearby}
                      onCheckedChange={setAcceptNearby}
                      data-testid="switch-accept-nearby"
                    />
                    <Label htmlFor="accept-nearby" className="text-sm cursor-pointer flex-1">
                      接受相邻商圈
                      <span className="text-xs text-muted-foreground ml-1">（扩大半径至3–5km）</span>
                      <span className="text-xs text-primary ml-1">成功率↑</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flexible-time" 
                      checked={flexibleTime}
                      onCheckedChange={setFlexibleTime}
                      data-testid="switch-flexible-time"
                    />
                    <Label htmlFor="flexible-time" className="text-sm cursor-pointer flex-1">
                      时间可前后 ±30 分钟
                      <span className="text-xs text-primary ml-1">成功率↑</span>
                    </Label>
                  </div>

                  {eventData.eventType === "饭局" && (
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="type-substitute" 
                        checked={typeSubstitute}
                        onCheckedChange={setTypeSubstitute}
                        data-testid="switch-type-substitute"
                      />
                      <Label htmlFor="type-substitute" className="text-sm cursor-pointer flex-1">
                        饭局可替代为酒局
                        <span className="text-xs text-primary ml-1">灵活度↑</span>
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="no-restrictions" 
                      checked={noStrictRestrictions}
                      onCheckedChange={setNoStrictRestrictions}
                      data-testid="switch-no-restrictions"
                    />
                    <Label htmlFor="no-restrictions" className="text-sm cursor-pointer flex-1">
                      不做性别/年龄硬性限制
                      <span className="text-xs text-primary ml-1">速度↑</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="prioritize-fast" 
                      checked={prioritizeFast}
                      onCheckedChange={setPrioritizeFast}
                      data-testid="switch-prioritize-fast"
                    />
                    <Label htmlFor="prioritize-fast" className="text-sm cursor-pointer flex-1">
                      优先快成局
                      <span className="text-xs text-muted-foreground ml-1">（可能牺牲部分兴趣匹配度）</span>
                      <span className="text-xs text-primary ml-1">更快↑</span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* D. 偏好快捷查看 */}
            <div className="mb-6 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">我的偏好</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-primary"
                  data-testid="button-edit-preferences"
                >
                  编辑偏好
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>口味/忌口：</span>
                  <span className="text-foreground">无</span>
                </div>
                <div className="flex justify-between">
                  <span>语言：</span>
                  <span className="text-foreground">中文 · 粤语</span>
                </div>
                <div className="flex justify-between">
                  <span>社交偏好：</span>
                  <span className="text-foreground">都可</span>
                </div>
              </div>
            </div>

            {/* E. 规则与保障 */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <p className="font-medium mb-1">规则与保障</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>AI智能匹配 · 满4人成局 · 最多6人</li>
                    <li>成局前可退；成局后至开局前24小时内不可退</li>
                    <li>报名收取平台服务费；当天现场点单AA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* F. 底部操作区 */}
          <div className="border-t p-4 space-y-2 flex-shrink-0 bg-background">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleConfirm}
              disabled={budgetPreference.length === 0}
              data-testid="button-confirm-join"
            >
              {getConfirmButtonText()}
            </Button>
            {budgetPreference.length === 0 && (
              <p className="text-xs text-center text-muted-foreground">
                请先选择预算范围
              </p>
            )}
            <Button 
              variant="ghost" 
              className="w-full" 
              size="sm"
              data-testid="button-save-only"
            >
              仅保存设置（不报名）
            </Button>
            <button 
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-view-rules"
            >
              查看完整规则
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>

    {/* 确认弹窗 */}
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogContent className="max-w-md" data-testid="dialog-confirm-join">
        <DialogHeader>
          <DialogTitle>确认参与信息</DialogTitle>
          <DialogDescription>
            请确认你的预算范围和偏好选项
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 你的预算范围 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">你的预算范围</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "¥100以下", value: "100以下" },
                { label: "¥100-200", value: "100-200" },
                { label: "¥300-500", value: "300-500" },
                { label: "¥500+", value: "500+" },
              ].map((option) => {
                const isSelected = budgetPreference.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-muted/30"
                    }`}
                    data-testid={`dialog-budget-${option.value}`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-background" />
                      )}
                    </div>
                    <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 偏好选项 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">偏好选项</h3>
            <div className="space-y-2">
              {[
                { label: "接受相邻商圈", detail: "扩大半径至3-5km", selected: acceptNearby },
                { label: "时间可前后±30分钟", detail: null, selected: flexibleTime },
                { label: eventData.eventType === "饭局" ? "饭局可替代为酒局" : "酒局可替代为饭局", detail: null, selected: typeSubstitute },
                { label: "不做性别/年龄硬性限制", detail: null, selected: noStrictRestrictions },
                { label: "优先快成局", detail: "可能牺牲部分兴趣匹配度", selected: prioritizeFast },
              ].map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all ${
                    option.selected
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-muted/30"
                  }`}
                  data-testid={`dialog-preference-${idx}`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    option.selected ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {option.selected && (
                      <CheckCircle2 className="h-4 w-4 text-background" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${option.selected ? "font-medium" : ""}`}>
                      {option.label}
                    </span>
                    {option.detail && (
                      <span className="text-xs text-muted-foreground ml-1">（{option.detail}）</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConfirmDialog(false)}
            data-testid="button-dialog-cancel"
          >
            返回修改
          </Button>
          <Button
            onClick={handleFinalConfirm}
            disabled={saveBudgetMutation.isPending}
            data-testid="button-dialog-confirm"
          >
            {saveBudgetMutation.isPending ? "处理中..." : "确认并支付"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </React.Fragment>
  );
}
