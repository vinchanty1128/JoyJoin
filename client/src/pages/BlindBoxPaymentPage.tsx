import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, Sparkles, Zap, Gift } from "lucide-react";
import { motion } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function BlindBoxPaymentPage() {
  const [, setLocation] = useLocation();
  const [promoOpen, setPromoOpen] = useState(false);

  const handlePayment = () => {
    // 这里处理支付逻辑
    setLocation("/discover");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      {/* 背景装饰动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={() => setLocation("/discover")}
        className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm transition-colors"
        data-testid="button-close-payment"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 顶部动画标题 */}
        <div className="flex-1 flex items-center justify-center px-6 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block mb-4"
            >
              <Sparkles className="h-16 w-16 text-yellow-300" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              解锁神秘盲盒
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              AI匹配 · 惊喜体验 · 新朋友
            </p>
          </motion.div>
        </div>

        {/* 付费卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-background rounded-t-[32px] shadow-2xl p-6 space-y-6"
        >
          {/* 活动信息摘要 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">周三 19:00 · 饭局</h2>
              <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                盲盒模式
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📍 深圳·南山区</p>
              <p>👥 4-6人 · AI智能匹配</p>
            </div>
          </div>

          {/* 价格选项 - Gamified */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              选择参与方式
            </h3>
            
            <div className="grid gap-3">
              {/* 单次票 - 推荐 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-4 border-2 border-primary bg-primary/5 hover-elevate cursor-pointer relative overflow-hidden" data-testid="card-single-ticket">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0">
                      <Gift className="h-3 w-3 mr-1" />
                      推荐
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">单次盲盒票</h4>
                      <p className="text-xs text-muted-foreground">本次活动专享</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">¥88</div>
                      <div className="text-xs text-muted-foreground">服务费</div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 月度订阅 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-4 border hover-elevate cursor-pointer" data-testid="card-monthly-sub">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">月度畅玩卡</h4>
                      <p className="text-xs text-muted-foreground">无限参与所有活动</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg line-through text-muted-foreground">¥299</span>
                        <span className="text-2xl font-bold">¥199</span>
                      </div>
                      <div className="text-xs text-green-600 font-medium">省33%</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Promo Code */}
          <Collapsible open={promoOpen} onOpenChange={setPromoOpen}>
            <CollapsibleTrigger className="w-full" data-testid="button-promo-toggle">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium">优惠码</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${promoOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-3 pt-0">
                <input
                  type="text"
                  placeholder="输入优惠码"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                  data-testid="input-promo-code"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Total */}
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">总计</span>
              <span className="text-3xl font-bold text-primary">¥88</span>
            </div>

            {/* 支付按钮 - 超级Gamified */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="w-full text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                onClick={handlePayment}
                data-testid="button-pay"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                立即支付解锁盲盒
                <Sparkles className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>

            {/* 说明文字 */}
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>✨ 支付后立即进入匹配队列</p>
              <p>🎁 成局前可退款，成局后24小时前不可退</p>
              <p>🔒 资金安全由平台保障</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
