import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MiniRadarChart from "@/components/MiniRadarChart";

interface QuestionOption {
  value: string;
  text: string;
  roleMapping: string;
}

interface Question {
  id: number;
  category: string;
  questionText: string;
  scenarioText?: string;
  questionType: "single" | "dual";
  options: QuestionOption[];
}

const questions: Question[] = [
  {
    id: 1,
    category: "基础行为模式",
    scenarioText: "🎉 想象一下：周五晚上，你走进了一个温馨的私房菜餐厅，参加一场小型聚会...",
    questionText: "聚会伊始…你通常会？",
    questionType: "single",
    options: [
      { value: "A", text: "率先自我介绍，并抛出开放问题。", roleMapping: "火花塞" },
      { value: "B", text: "先安静观察，判断性格与共同点。", roleMapping: "连接者" },
      { value: "C", text: "与邻座小声交谈，从一对一开始。", roleMapping: "连接者" },
      { value: "D", text: "等待别人开启话题，随后积极回应。", roleMapping: "氛围组" },
    ],
  },
  {
    id: 2,
    category: "基础行为模式",
    scenarioText: "💬 话题转向你并不熟悉的领域，例如区块链技术或古典音乐...",
    questionText: "当讨论到你知之甚少的话题时更倾向于？",
    questionType: "single",
    options: [
      { value: "A", text: "提出一系列问题，强烈好奇心。", roleMapping: "探索者" },
      { value: "B", text: "关联熟悉领域进行类比。", roleMapping: "挑战者" },
      { value: "C", text: "认真聆听，捕捉观点或故事。", roleMapping: "故事家" },
      { value: "D", text: "开个玩笑，承认不懂，把发言权交给专家。", roleMapping: "肯定者" },
    ],
  },
  {
    id: 3,
    category: "基础行为模式",
    scenarioText: "😢 气氛突然变得安静，有人刚分享了一段动人的个人经历...",
    questionText: "当有人分享私人感人故事后沉默，你会？",
    questionType: "single",
    options: [
      { value: "A", text: "分享类似经历以示共鸣。", roleMapping: "故事家" },
      { value: "B", text: "提出深刻问题促进探讨。", roleMapping: "探索者" },
      { value: "C", text: "真诚肯定对方（如\"谢谢你愿意分享\"）。", roleMapping: "连接者" },
      { value: "D", text: "巧妙引入更轻松的话题调节情绪。", roleMapping: "氛围组" },
    ],
  },
  {
    id: 4,
    category: "基础行为模式",
    scenarioText: "🤔 两位朋友开始就某个话题展开辩论，观点针锋相对...",
    questionText: "你如何看待社交中的\"争论\"？",
    questionType: "single",
    options: [
      { value: "A", text: "有趣，获取新视角的机会。", roleMapping: "挑战者" },
      { value: "B", text: "必要但需礼貌与逻辑，最好达成共识。", roleMapping: "协调者" },
      { value: "C", text: "尽量避免，更喜欢和谐氛围。", roleMapping: "连接者" },
      { value: "D", text: "若过于激烈，我会插科打诨平息。", roleMapping: "氛围组" },
    ],
  },
  {
    id: 5,
    category: "反应偏好",
    scenarioText: "💭 有人说出一个你并不认同的观点...",
    questionText: "听到不同意的观点时更可能：",
    questionType: "dual",
    options: [
      { value: "A", text: "直接但礼貌地指出逻辑漏洞/事实错误。", roleMapping: "挑战者" },
      { value: "B", text: "以提问方式引导思考前提。", roleMapping: "协调者" },
      { value: "C", text: "先表理解，再给另一角度。", roleMapping: "故事家" },
      { value: "D", text: "保留意见，除非被询问不主动反驳。", roleMapping: "肯定者" },
    ],
  },
  {
    id: 6,
    category: "反应偏好",
    scenarioText: "🎯 在团队讨论中，你发现你可以贡献价值...",
    questionText: "更擅长/享受的贡献方式：",
    questionType: "dual",
    options: [
      { value: "A", text: "提供信息：数据与细节。", roleMapping: "探索者" },
      { value: "B", text: "提供视角：新角度或框架。", roleMapping: "挑战者" },
      { value: "C", text: "提供情感：故事与共情。", roleMapping: "故事家" },
      { value: "D", text: "提供动力：赞美与鼓励。", roleMapping: "肯定者" },
    ],
  },
  {
    id: 7,
    category: "反应偏好",
    scenarioText: "🌟 有人提出了一个既有趣又复杂的话题...",
    questionText: "有趣但复杂的话题被提起时你更推动：",
    questionType: "dual",
    options: [
      { value: "A", text: "向下挖掘：为什么与本质，追求深度。", roleMapping: "探索者" },
      { value: "B", text: "向外发散：还有什么相关，追求广度。", roleMapping: "火花塞" },
      { value: "C", text: "向内连接：我们如何感受，联系体验。", roleMapping: "故事家" },
      { value: "D", text: "向前推进：所以呢？能做什么？导向行动。", roleMapping: "协调者" },
    ],
  },
  {
    id: 8,
    category: "自我认知",
    scenarioText: "😰 回想你在社交场合中最不舒服的时刻...",
    questionText: "社交中你最大的焦虑来自于？",
    questionType: "single",
    options: [
      { value: "A", text: "话题无聊肤浅。", roleMapping: "探索者" },
      { value: "B", text: "场面失控或无休止争吵。", roleMapping: "协调者" },
      { value: "C", text: "自己或他人被忽视。", roleMapping: "连接者" },
      { value: "D", text: "气氛冷清压抑。", roleMapping: "火花塞" },
    ],
  },
  {
    id: 9,
    category: "自我认知",
    scenarioText: "🙅 思考一下，在聚会中有些角色你就是做不来...",
    questionText: "你最不可能扮演的角色是？",
    questionType: "single",
    options: [
      { value: "A", text: "主动制止跑题的人。", roleMapping: "协调者" },
      { value: "B", text: "为大家定规则或主题的人。", roleMapping: "协调者" },
      { value: "C", text: "在争论中坚决维护某一方的人。", roleMapping: "连接者" },
      { value: "D", text: "记下联系方式并事后组织聚会的人。", roleMapping: "连接者" },
    ],
  },
  {
    id: 10,
    category: "自我认知",
    scenarioText: "👥 如果你的朋友要向别人介绍你...",
    questionText: "朋友形容你：",
    questionType: "single",
    options: [
      { value: "A", text: "博学/深刻", roleMapping: "探索者" },
      { value: "B", text: "有趣/好玩", roleMapping: "氛围组" },
      { value: "C", text: "温暖/贴心", roleMapping: "连接者" },
      { value: "D", text: "犀利/敏锐", roleMapping: "挑战者" },
    ],
  },
];

export default function PersonalityTestPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showMilestone, setShowMilestone] = useState(false);
  const [showBlindBox, setShowBlindBox] = useState(false);

  const submitTestMutation = useMutation({
    mutationFn: async (responses: Record<number, any>) => {
      return await apiRequest("POST", "/api/personality-test/submit", {
        responses,
      });
    },
    onSuccess: (data) => {
      // Show blind box animation for 3 seconds
      setTimeout(() => {
        setLocation(`/personality-test/results`);
      }, 3000);
    },
    onError: (error: Error) => {
      setShowBlindBox(false);
      toast({
        title: "提交失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleSingleChoice = (value: string) => {
    setAnswers({ ...answers, [currentQ.id]: { type: "single", value } });
  };

  const handleDualChoice = (type: "most" | "second", value: string) => {
    const current = answers[currentQ.id] || {};
    const updated = {
      type: "dual",
      mostLike: type === "most" ? value : current.mostLike,
      secondLike: type === "second" ? value : current.secondLike,
    };
    setAnswers({ ...answers, [currentQ.id]: updated });
  };

  const canProceed = () => {
    const answer = answers[currentQ.id];
    if (!answer) return false;
    
    if (currentQ.questionType === "single") {
      return !!answer.value;
    } else {
      return !!answer.mostLike && !!answer.secondLike && answer.mostLike !== answer.secondLike;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    if (isLastQuestion) {
      setShowBlindBox(true);
      submitTestMutation.mutate(answers);
    } else {
      // Show milestone after question 5 (index 4)
      if (currentQuestion === 4 && !showMilestone) {
        setShowMilestone(true);
        setTimeout(() => {
          setShowMilestone(false);
          setCurrentQuestion(currentQuestion + 1);
        }, 2500);
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Blind Box Animation Component
  const BlindBoxReveal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, rotateY: 0 }}
          animate={{ 
            scale: [0.5, 1.1, 1],
            rotateY: [0, 180, 360],
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.5, 1],
            ease: "easeInOut"
          }}
          className="text-8xl"
        >
          🎁
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold">正在揭晓你的社交角色...</h2>
          <p className="text-muted-foreground">✨ 即将发现真实的你</p>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 2, duration: 0.5 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  // Milestone Card Component
  const MilestoneCard = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
    >
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.6 }}
            className="text-6xl"
          >
            ✨
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">有意思！</h3>
            <p className="text-muted-foreground">
              我们已经发现了你的一个隐藏特质...
            </p>
            <p className="text-sm text-primary font-medium">
              继续答题揭晓完整的社交画像 🎁
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Blind Box Reveal Overlay */}
      <AnimatePresence>
        {showBlindBox && <BlindBoxReveal />}
      </AnimatePresence>

      {/* Milestone Overlay */}
      <AnimatePresence>
        {showMilestone && <MilestoneCard />}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">性格测评</h1>
            {Object.keys(answers).length > 0 && (
              <MiniRadarChart 
                progress={progress}
                answeredQuestions={Object.keys(answers).length}
                totalQuestions={questions.length}
              />
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm text-muted-foreground mb-2">{currentQ.category}</div>
            {currentQ.scenarioText && (
              <p className="text-sm text-muted-foreground mb-3 italic leading-relaxed">
                {currentQ.scenarioText}
              </p>
            )}
            <h2 className="text-xl font-bold mb-6">{currentQ.questionText}</h2>
          </motion.div>

          {currentQ.questionType === "single" ? (
            <RadioGroup
              key={`single-${currentQ.id}`}
              value={answers[currentQ.id]?.value || ""}
              onValueChange={handleSingleChoice}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => {
                const isSelected = answers[currentQ.id]?.value === option.value;
                return (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      animate={isSelected ? {
                        scale: [1, 1.02, 1],
                        borderColor: ["hsl(var(--primary))", "hsl(var(--primary))"]
                      } : {}}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 hover-elevate transition-all ${
                        isSelected ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`q${currentQ.id}-${option.value}`}
                        data-testid={`radio-q${currentQ.id}-${option.value}`}
                      />
                      <Label
                        htmlFor={`q${currentQ.id}-${option.value}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <span className="font-semibold mr-2">{option.value}.</span>
                        {option.text}
                      </Label>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-primary"
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </RadioGroup>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium mb-3">最像我的（2分）</div>
                <RadioGroup
                  key={`most-${currentQ.id}`}
                  value={answers[currentQ.id]?.mostLike || ""}
                  onValueChange={(value) => handleDualChoice("most", value)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, index) => {
                    const isSelected = answers[currentQ.id]?.mostLike === option.value;
                    const isDisabled = answers[currentQ.id]?.secondLike === option.value;
                    return (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <motion.div
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          animate={isSelected ? {
                            scale: [1, 1.02, 1],
                            borderColor: ["hsl(var(--primary))", "hsl(var(--primary))"]
                          } : {}}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 hover-elevate transition-all ${
                            isDisabled ? "opacity-50" : ""
                          } ${isSelected ? "border-primary bg-primary/5" : ""}`}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`q${currentQ.id}-most-${option.value}`}
                            disabled={isDisabled}
                            data-testid={`radio-q${currentQ.id}-most-${option.value}`}
                          />
                          <Label
                            htmlFor={`q${currentQ.id}-most-${option.value}`}
                            className="flex-1 cursor-pointer font-normal"
                          >
                            <span className="font-semibold mr-2">{option.value}.</span>
                            {option.text}
                          </Label>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-primary"
                            >
                              ✓
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </RadioGroup>
              </div>

              <div>
                <div className="text-sm font-medium mb-3">其次像我的（1分）</div>
                <RadioGroup
                  key={`second-${currentQ.id}`}
                  value={answers[currentQ.id]?.secondLike || ""}
                  onValueChange={(value) => handleDualChoice("second", value)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, index) => {
                    const isSelected = answers[currentQ.id]?.secondLike === option.value;
                    const isDisabled = answers[currentQ.id]?.mostLike === option.value;
                    return (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <motion.div
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          animate={isSelected ? {
                            scale: [1, 1.02, 1],
                            borderColor: ["hsl(var(--primary))", "hsl(var(--primary))"]
                          } : {}}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 hover-elevate transition-all ${
                            isDisabled ? "opacity-50" : ""
                          } ${isSelected ? "border-primary bg-primary/5" : ""}`}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`q${currentQ.id}-second-${option.value}`}
                            disabled={isDisabled}
                            data-testid={`radio-q${currentQ.id}-second-${option.value}`}
                          />
                          <Label
                            htmlFor={`q${currentQ.id}-second-${option.value}`}
                            className="flex-1 cursor-pointer font-normal"
                          >
                            <span className="font-semibold mr-2">{option.value}.</span>
                            {option.text}
                          </Label>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-primary"
                            >
                              ✓
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="flex-1"
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            上一题
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || submitTestMutation.isPending}
            className="flex-1"
            data-testid="button-next"
          >
            {isLastQuestion ? (
              submitTestMutation.isPending ? "提交中..." : "完成测试"
            ) : (
              <>
                下一题
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
