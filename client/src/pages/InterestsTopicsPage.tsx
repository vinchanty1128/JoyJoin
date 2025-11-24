import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { interestsTopicsSchema, type InterestsTopics } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronUp, ChevronDown, Info, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import RegistrationProgress from "@/components/RegistrationProgress";

// Interest categories with emojis
const INTERESTS_OPTIONS = [
  { id: "outdoor_adventure", label: "户外冒险", emoji: "🏔️" },
  { id: "sports_fitness", label: "运动健身", emoji: "⚽" },
  { id: "food_dining", label: "美食探店", emoji: "🍜" },
  { id: "arts_culture", label: "艺术文化", emoji: "🎨" },
  { id: "music_concerts", label: "音乐现场", emoji: "🎵" },
  { id: "reading_books", label: "阅读书籍", emoji: "📚" },
  { id: "tech_gadgets", label: "科技数码", emoji: "💻" },
  { id: "games_board", label: "桌游卡牌", emoji: "🎲" },
  { id: "games_video", label: "电子游戏", emoji: "🎮" },
  { id: "photography", label: "摄影拍照", emoji: "📷" },
  { id: "travel", label: "旅行探索", emoji: "✈️" },
  { id: "diy_crafts", label: "手工DIY", emoji: "✂️" },
  { id: "pets_animals", label: "宠物动物", emoji: "🐶" },
  { id: "volunteering", label: "志愿公益", emoji: "🤝" },
  { id: "entrepreneurship", label: "创业商业", emoji: "💡" },
  { id: "investing", label: "投资理财", emoji: "💰" },
  { id: "meditation", label: "冥想正念", emoji: "🧘" },
  { id: "languages", label: "语言学习", emoji: "🗣️" },
];

// Conversation topics
const TOPICS_OPTIONS = [
  { id: "career_growth", label: "职业发展", category: "work" },
  { id: "startup_ideas", label: "创业想法", category: "work" },
  { id: "tech_trends", label: "科技趋势", category: "tech" },
  { id: "ai_future", label: "AI与未来", category: "tech" },
  { id: "relationships", label: "人际关系", category: "personal" },
  { id: "dating_love", label: "恋爱情感", category: "personal" },
  { id: "mental_health", label: "心理健康", category: "personal" },
  { id: "life_philosophy", label: "人生哲学", category: "personal" },
  { id: "movies_shows", label: "影视剧集", category: "entertainment" },
  { id: "music_taste", label: "音乐品味", category: "entertainment" },
  { id: "travel_stories", label: "旅行故事", category: "lifestyle" },
  { id: "food_culture", label: "美食文化", category: "lifestyle" },
  { id: "fashion_style", label: "时尚穿搭", category: "lifestyle" },
  { id: "current_events", label: "时事新闻", category: "society" },
  { id: "politics", label: "政治话题", category: "society" },
  { id: "social_issues", label: "社会议题", category: "society" },
  { id: "parenting", label: "育儿经验", category: "family" },
  { id: "hobbies_deep", label: "小众爱好", category: "other" },
];

export default function InterestsTopicsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const [showCelebration, setShowCelebration] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [rankedTop3, setRankedTop3] = useState<string[]>([]);
  const [selectedTopicsHappy, setSelectedTopicsHappy] = useState<string[]>([]);
  const [selectedTopicsAvoid, setSelectedTopicsAvoid] = useState<string[]>([]);

  // Celebration effect when step 1 completes
  useEffect(() => {
    if (step === 2 && showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [step, showCelebration]);

  const form = useForm<InterestsTopics>({
    resolver: zodResolver(interestsTopicsSchema),
    defaultValues: {
      interestsTop: [],
      interestsRankedTop3: [],
      topicsHappy: [],
      topicsAvoid: [],
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InterestsTopics) => {
      return await apiRequest("POST", "/api/user/interests-topics", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "保存成功！",
        description: "现在让我们了解你的社交风格",
      });
      
      setLocation("/personality-test");
    },
    onError: (error: Error) => {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        // Remove from selected
        const newSelected = prev.filter(id => id !== interestId);
        // Also remove from ranked if it was there
        setRankedTop3(ranked => ranked.filter(id => id !== interestId));
        return newSelected;
      } else {
        // Add to selected (max 7)
        if (prev.length >= 7) {
          toast({
            title: "最多选择7个兴趣",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, interestId];
      }
    });
  };

  const toggleTopicHappy = (topicId: string) => {
    setSelectedTopicsHappy(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        // Remove from avoid list if it was there
        setSelectedTopicsAvoid(avoid => avoid.filter(id => id !== topicId));
        return [...prev, topicId];
      }
    });
  };

  const toggleTopicAvoid = (topicId: string) => {
    setSelectedTopicsAvoid(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        // Remove from happy list if it was there
        setSelectedTopicsHappy(happy => happy.filter(id => id !== topicId));
        return [...prev, topicId];
      }
    });
  };

  const addToRanking = (interestId: string) => {
    if (rankedTop3.length >= 3) {
      toast({
        title: "最多排序3个兴趣",
        variant: "destructive",
      });
      return;
    }
    if (!rankedTop3.includes(interestId)) {
      setRankedTop3([...rankedTop3, interestId]);
    }
  };

  const removeFromRanking = (interestId: string) => {
    setRankedTop3(rankedTop3.filter(id => id !== interestId));
  };

  const moveUpInRanking = (index: number) => {
    if (index === 0) return;
    const newRanked = [...rankedTop3];
    [newRanked[index - 1], newRanked[index]] = [newRanked[index], newRanked[index - 1]];
    setRankedTop3(newRanked);
  };

  const moveDownInRanking = (index: number) => {
    if (index === rankedTop3.length - 1) return;
    const newRanked = [...rankedTop3];
    [newRanked[index], newRanked[index + 1]] = [newRanked[index + 1], newRanked[index]];
    setRankedTop3(newRanked);
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate interests step
      if (selectedInterests.length < 3) {
        toast({
          title: "请至少选择3个兴趣",
          variant: "destructive",
        });
        return;
      }
      if (rankedTop3.length < 3) {
        toast({
          title: "请从你选择的兴趣中排序出最喜欢的3个",
          variant: "destructive",
        });
        return;
      }
      setShowCelebration(true);
      setTimeout(() => setStep(2), 400);
    } else {
      // Validate topics step
      if (selectedTopicsHappy.length < 1) {
        toast({
          title: "请至少选择1个你喜欢讨论的话题",
          variant: "destructive",
        });
        return;
      }
      
      // Submit the form
      saveMutation.mutate({
        interestsTop: selectedInterests,
        interestsRankedTop3: rankedTop3,
        topicsHappy: selectedTopicsHappy,
        topicsAvoid: selectedTopicsAvoid,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (step / totalSteps) * 100;

  const getInterestLabel = (id: string) => {
    const interest = INTERESTS_OPTIONS.find(i => i.id === id);
    return interest ? `${interest.emoji} ${interest.label}` : id;
  };

  const getTopicLabel = (id: string) => {
    const topic = TOPICS_OPTIONS.find(t => t.id === id);
    return topic ? topic.label : id;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RegistrationProgress 
        currentStage="interests" 
        currentStep={step}
        totalSteps={totalSteps}
      />
      
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute text-xl font-bold text-purple-600 dark:text-purple-400"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: -40, opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              完美
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
          {/* Step 1: Interests Selection & Ranking */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">你的兴趣</h2>
                <p className="text-sm text-muted-foreground">
                  选择3-7个你感兴趣的活动类型，然后排序出最喜欢的3个
                </p>
              </div>

              {/* Interest Selection */}
              <div>
                <Label>选择兴趣（3-7个）</Label>
                <motion.p 
                  className="text-xs text-muted-foreground mb-3"
                  animate={{ scale: selectedInterests.length > 0 ? [1, 1.05, 1] : 1 }}
                >
                  已选择 <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedInterests.length}</span>/7 个
                </motion.p>
                <div className="grid grid-cols-2 gap-3">
                  {INTERESTS_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        data-testid={`button-interest-${interest.id}`}
                        className={`
                          px-4 py-2.5 rounded-lg border-2 transition-all text-left
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{interest.emoji}</span>
                            <span className="text-base font-medium">{interest.label}</span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ranking Section */}
              {selectedInterests.length >= 3 && (
                <>
                  <Separator />
                  <div>
                    <Label>排序最喜欢的3个</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      从上面选择的兴趣中，点击添加并排序你最喜欢的3个
                    </p>

                    {/* Ranked list */}
                    {rankedTop3.length > 0 && (
                      <Card className="mb-3">
                        <CardContent className="p-3 space-y-2">
                          {rankedTop3.map((interestId, index) => (
                            <div
                              key={interestId}
                              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                              data-testid={`ranked-interest-${index}`}
                            >
                              <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                                {index + 1}
                              </Badge>
                              <span className="flex-1 text-sm">
                                {getInterestLabel(interestId)}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveUpInRanking(index)}
                                  disabled={index === 0}
                                  className="h-7 w-7"
                                  data-testid={`button-move-up-${index}`}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveDownInRanking(index)}
                                  disabled={index === rankedTop3.length - 1}
                                  className="h-7 w-7"
                                  data-testid={`button-move-down-${index}`}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromRanking(interestId)}
                                  className="h-7 px-2 text-xs"
                                  data-testid={`button-remove-${index}`}
                                >
                                  移除
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Available to rank */}
                    {rankedTop3.length < 3 && (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedInterests
                          .filter(id => !rankedTop3.includes(id))
                          .map((interestId) => (
                            <button
                              key={interestId}
                              type="button"
                              onClick={() => addToRanking(interestId)}
                              data-testid={`button-add-to-rank-${interestId}`}
                              className="px-4 py-2.5 text-base rounded-md border border-border hover-elevate active-elevate-2 text-left"
                            >
                              {getInterestLabel(interestId)}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Topics Preferences */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-2">对话话题</h2>
                <p className="text-sm text-muted-foreground">
                  告诉我们你喜欢和回避的话题，帮助我们更好地匹配活动
                </p>
              </div>

              <div className="flex items-start space-x-2 bg-primary/5 p-3 rounded-md border border-primary/20">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  选择话题时，绿色按钮表示喜欢讨论，红色表示想要回避。同一个话题不能同时选择两种状态。
                </p>
              </div>

              {/* Topics Happy */}
              <div>
                <Label>喜欢讨论的话题 *</Label>
                <motion.p 
                  className="text-xs text-muted-foreground mb-3"
                  animate={{ scale: selectedTopicsHappy.length > 0 ? [1, 1.05, 1] : 1 }}
                >
                  已选择 <span className="font-semibold text-green-600 dark:text-green-400">{selectedTopicsHappy.length}</span> 个（至少选1个）
                </motion.p>
                <div className="grid grid-cols-2 gap-3">
                  {TOPICS_OPTIONS.map((topic) => {
                    const isHappy = selectedTopicsHappy.includes(topic.id);
                    const isAvoid = selectedTopicsAvoid.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopicHappy(topic.id)}
                        data-testid={`button-topic-happy-${topic.id}`}
                        className={`
                          px-4 py-2.5 text-base rounded-md border-2 transition-all text-left
                          ${isHappy 
                            ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400' 
                            : isAvoid
                            ? 'border-border/50 opacity-50'
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Topics Avoid */}
              <div>
                <Label>想要回避的话题（可选）</Label>
                <motion.p 
                  className="text-xs text-muted-foreground mb-3"
                  animate={{ scale: selectedTopicsAvoid.length > 0 ? [1, 1.05, 1] : 1 }}
                >
                  已选择 <span className="font-semibold text-red-600 dark:text-red-400">{selectedTopicsAvoid.length}</span> 个
                </motion.p>
                <div className="grid grid-cols-2 gap-3">
                  {TOPICS_OPTIONS.map((topic) => {
                    const isHappy = selectedTopicsHappy.includes(topic.id);
                    const isAvoid = selectedTopicsAvoid.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopicAvoid(topic.id)}
                        data-testid={`button-topic-avoid-${topic.id}`}
                        className={`
                          px-4 py-2.5 text-base rounded-md border-2 transition-all text-left
                          ${isAvoid 
                            ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400' 
                            : isHappy
                            ? 'border-border/50 opacity-50'
                            : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          </motion.div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="border-t p-4 bg-background sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
              data-testid="button-back"
            >
              上一步
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={saveMutation.isPending}
            data-testid="button-next"
          >
            {step === totalSteps ? (
              saveMutation.isPending ? "保存中..." : "完成"
            ) : (
              "下一步"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
