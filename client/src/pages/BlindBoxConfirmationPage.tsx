import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, Users, DollarSign, Calendar, Clock, ArrowRight, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { getCurrencySymbol } from "@/lib/currency";

export default function BlindBoxConfirmationPage() {
  const [, setLocation] = useLocation();
  const city = (localStorage.getItem("blindbox_city") || "深圳") as "香港" | "深圳";
  const currencySymbol = getCurrencySymbol(city);

  // 从localStorage读取用户偏好
  const userPreferences = JSON.parse(localStorage.getItem("blindbox_preferences") || "{}");

  // 模拟数据（实际应从状态管理或路由参数获取）
  const confirmationData = {
    date: "周三",
    time: "19:00",
    eventType: "饭局",
    area: city === "香港" ? "香港·中西区" : "深圳·南山区",
    budget: ["100-200", "200-300"],
    preferences: {
      acceptNearby: true,
      flexibleTime: true,
      typeSubstitute: false,
      noStrictRestrictions: true,
    },
    inviteFriends: false,
    serviceFee: `${currencySymbol}88`,
    userPreferences: {
      languages: userPreferences.languages || [],
      tasteIntensity: userPreferences.tasteIntensity || [],
      cuisines: userPreferences.cuisines || [],
    },
  };

  const handleViewProgress = () => {
    setLocation("/discover");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 成功状态卡 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0" data-testid="card-success-status">
            <div className="flex flex-col items-center text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="bg-white/20 rounded-full p-4">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold mb-2">报名成功！</h1>
                <p className="text-white/90 text-sm">
                  你的信息已提交，AI正在为你寻找最佳匹配
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 已确认信息 - 只读展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6" data-testid="card-confirmed-info">
            <h2 className="text-lg font-bold mb-4">已确认信息</h2>
            
            <div className="space-y-4">
              {/* 活动摘要 */}
              <div className="pb-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">{confirmationData.date} {confirmationData.time}</span>
                  </div>
                  <Badge variant="secondary">{confirmationData.eventType}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{confirmationData.area}</span>
                </div>
              </div>

              {/* 预算范围 */}
              <div className="pb-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">预算范围</h3>
                </div>
                <div className="flex gap-2">
                  {confirmationData.budget.map((range) => (
                    <Badge key={range} variant="outline" className="text-xs">
                      {currencySymbol}{range}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 提升成功率 */}
              <div className="pb-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">提升成功率</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">接受相邻商圈</span>
                    <Badge variant={confirmationData.preferences.acceptNearby ? "default" : "outline"} className="text-xs">
                      {confirmationData.preferences.acceptNearby ? "已开启" : "未开启"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">时间可 ±30 分钟</span>
                    <Badge variant={confirmationData.preferences.flexibleTime ? "default" : "outline"} className="text-xs">
                      {confirmationData.preferences.flexibleTime ? "已开启" : "未开启"}
                    </Badge>
                  </div>
                  {confirmationData.eventType === "饭局" && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">饭局可替代为酒局</span>
                      <Badge variant={confirmationData.preferences.typeSubstitute ? "default" : "outline"} className="text-xs">
                        {confirmationData.preferences.typeSubstitute ? "已开启" : "未开启"}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">不做性别/年龄硬性限制</span>
                    <Badge variant={confirmationData.preferences.noStrictRestrictions ? "default" : "outline"} className="text-xs">
                      {confirmationData.preferences.noStrictRestrictions ? "已开启" : "未开启"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 我的偏好 */}
              {(confirmationData.userPreferences.languages.length > 0 || 
                confirmationData.userPreferences.tasteIntensity.length > 0 || 
                confirmationData.userPreferences.cuisines.length > 0) && (
                <div className="pb-4 border-b">
                  <h3 className="text-sm font-semibold mb-2">我的偏好</h3>
                  <div className="space-y-2 text-sm">
                    {confirmationData.userPreferences.languages.length > 0 && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-muted-foreground">语言：</span>
                        <span className="font-medium text-right">{confirmationData.userPreferences.languages.join(' · ')}</span>
                      </div>
                    )}
                    {confirmationData.userPreferences.tasteIntensity.length > 0 && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-muted-foreground">口味强度：</span>
                        <span className="font-medium text-right">{confirmationData.userPreferences.tasteIntensity.join(' · ')}</span>
                      </div>
                    )}
                    {confirmationData.userPreferences.cuisines.length > 0 && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-muted-foreground">菜系：</span>
                        <span className="font-medium text-right">{confirmationData.userPreferences.cuisines.join(' · ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 费用信息 */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">已支付服务费</span>
                  <span className="text-lg font-bold text-primary">{confirmationData.serviceFee}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  活动现场费用AA · 成局前可退款
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 进度与下一步 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6" data-testid="card-next-steps">
            <h2 className="text-lg font-bold mb-4">下一步是什么？</h2>
            
            <div className="space-y-4">
              {/* 匹配进度 */}
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">AI正在匹配中</h3>
                  <p className="text-xs text-muted-foreground">
                    系统将根据你的偏好智能匹配4-6位同伴，满4人即可成局
                  </p>
                </div>
              </div>

              {/* 通知提醒 */}
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 rounded-full p-2 mt-0.5">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">等待成局通知</h3>
                  <p className="text-xs text-muted-foreground">
                    成局后将通过微信通知，请保持手机畅通
                  </p>
                </div>
              </div>

              {/* 活动详情 */}
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/10 rounded-full p-2 mt-0.5">
                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">活动前48小时</h3>
                  <p className="text-xs text-muted-foreground">
                    系统将推送活动详情（地点、成员信息、聊天群）
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleViewProgress}
            data-testid="button-view-progress"
          >
            查看匹配进度
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation("/discover")}
            data-testid="button-back-discover"
          >
            返回探索页
          </Button>
        </div>

        {/* 底部提示 */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>💡 你可以在「我的」页面查看所有报名活动</p>
          <p>📱 建议开启微信通知，第一时间接收匹配消息</p>
        </div>
      </div>
    </div>
  );
}
