import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MiniRadarChart from "@/components/MiniRadarChart";
import { personalityQuestions as baseQuestions, getSupplementaryQuestions } from "@/data/personalityQuestions";

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

export default function PersonalityTestPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showMilestone, setShowMilestone] = useState(false);
  const [showBlindBox, setShowBlindBox] = useState(false);
  
  // Supplementary test states
  const [isSupplementaryMode, setIsSupplementaryMode] = useState(false);
  const [supplementaryQuestions, setSupplementaryQuestions] = useState<Question[]>([]);
  const [candidateArchetypes, setCandidateArchetypes] = useState<Array<{ name: string; score: number }>>([]);
  const [showSupplementaryTransition, setShowSupplementaryTransition] = useState(false);
  
  // Combined questions: base + supplementary (if any)
  const questions = isSupplementaryMode 
    ? [...baseQuestions, ...supplementaryQuestions]
    : baseQuestions;

  // Removed redirect logic - users can now retake the test anytime

  // Preliminary scoring mutation (after base 10 questions)
  const preliminaryScoreMutation = useMutation({
    mutationFn: async (responses: Record<number, any>) => {
      return await apiRequest("POST", "/api/personality-test/preliminary-score", {
        responses,
      });
    },
    onSuccess: (data: any) => {
      if (data.needsSupplementary) {
        // Need supplementary questions
        setCandidateArchetypes(data.candidateArchetypes);
        
        // Get supplementary questions for these two archetypes
        const suppQuestions = getSupplementaryQuestions(
          data.candidateArchetypes[0].name,
          data.candidateArchetypes[1].name,
          3
        );
        
        setSupplementaryQuestions(suppQuestions);
        
        // Show transition animation
        setShowSupplementaryTransition(true);
        setTimeout(() => {
          setShowSupplementaryTransition(false);
          setIsSupplementaryMode(true);
          setCurrentQuestion(10); // Move to first supplementary question
        }, 3000);
      } else {
        // Direct result - no supplementary needed
        setShowBlindBox(true);
        submitTestMutation.mutate(answers);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "评分失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      // If we're on the last question
      if (!isSupplementaryMode && currentQuestion === 9) {
        // Just finished base 10 questions - call preliminary score
        preliminaryScoreMutation.mutate(answers);
      } else {
        // Finished all questions (including supplementary if any)
        setShowBlindBox(true);
        submitTestMutation.mutate(answers);
      }
    } else {
      // Show milestone after question 5 (index 4)
      if (currentQuestion === 4 && !showMilestone && !isSupplementaryMode) {
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

  // Supplementary Test Transition Animation
  const SupplementaryTransition = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-500/10 via-background to-amber-500/10 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="text-center space-y-6 max-w-md">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="text-6xl mx-auto w-20 h-20 flex items-center justify-center"
        >
          🎯
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
            检测到双重人格特质！
          </h2>
          <p className="text-muted-foreground">正在分析你的社交氛围...</p>
        </motion.div>
        
        {candidateArchetypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-card/50 border border-primary/20 rounded-lg p-4 space-y-3"
          >
            <div className="text-sm font-medium text-muted-foreground">候选原型</div>
            <div className="flex justify-center gap-4">
              {candidateArchetypes.map((archetype, index) => (
                <motion.div
                  key={archetype.name}
                  initial={{ x: index === 0 ? -50 : 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.2 }}
                  className="text-center"
                >
                  <div className="text-3xl mb-1">
                    {index === 0 ? "🏆" : "🥈"}
                  </div>
                  <div className="font-bold text-lg">{archetype.name}</div>
                  <div className="text-sm text-muted-foreground">{archetype.score}分</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-sm text-muted-foreground"
        >
          进入精准模式，深入探索你的社交DNA...
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

      {/* Supplementary Test Transition */}
      <AnimatePresence>
        {showSupplementaryTransition && <SupplementaryTransition />}
      </AnimatePresence>

      {/* Milestone Overlay */}
      <AnimatePresence>
        {showMilestone && <MilestoneCard />}
      </AnimatePresence>

      {/* Header */}
      <div className={`p-4 border-b ${isSupplementaryMode ? 'bg-gradient-to-r from-purple-500/10 to-amber-500/10' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">
              {isSupplementaryMode ? (
                <span className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                    精准模式
                  </span>
                  <span className="text-xl">🎯</span>
                </span>
              ) : (
                "性格测评"
              )}
            </h1>
            {Object.keys(answers).length > 0 && !isSupplementaryMode && (
              <MiniRadarChart 
                progress={progress}
                answeredQuestions={Object.keys(answers).length}
                totalQuestions={questions.length}
              />
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {isSupplementaryMode ? (
              <span className="font-medium bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                深入探索 {currentQuestion - 9}/{supplementaryQuestions.length}
              </span>
            ) : (
              `${currentQuestion + 1}/${questions.length}`
            )}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        {isSupplementaryMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-center text-muted-foreground"
          >
            正在精准区分：{candidateArchetypes[0]?.name} vs {candidateArchetypes[1]?.name}
          </motion.div>
        )}
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
            <div className="space-y-3">
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.id]?.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSingleChoice(option.value)}
                    className={`
                      w-full px-4 py-4 text-left rounded-lg border-2 transition-all text-base flex items-center gap-3
                      ${isSelected
                        ? 'border-primary bg-primary/5 text-foreground' 
                        : 'border-border hover-elevate active-elevate-2'
                      }
                    `}
                    data-testid={`button-q${currentQ.id}-${option.value}`}
                  >
                    <span className="font-semibold">{option.value}.</span>
                    <span className="flex-1">{option.text}</span>
                    {isSelected && (
                      <span className="text-primary font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium mb-3">最像我的（2分）</div>
                <div className="space-y-3">
                  {currentQ.options.map((option) => {
                    const isSelected = answers[currentQ.id]?.mostLike === option.value;
                    const isDisabled = answers[currentQ.id]?.secondLike === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !isDisabled && handleDualChoice("most", option.value)}
                        disabled={isDisabled}
                        className={`
                          w-full px-4 py-4 text-left rounded-lg border-2 transition-all text-base flex items-center gap-3
                          ${isDisabled 
                            ? 'opacity-50 cursor-not-allowed border-border' 
                            : isSelected
                              ? 'border-primary bg-primary/5 text-foreground' 
                              : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-q${currentQ.id}-most-${option.value}`}
                      >
                        <span className="font-semibold">{option.value}.</span>
                        <span className="flex-1">{option.text}</span>
                        {isSelected && (
                          <span className="text-primary font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-3">其次像我的（1分）</div>
                <div className="space-y-3">
                  {currentQ.options.map((option) => {
                    const isSelected = answers[currentQ.id]?.secondLike === option.value;
                    const isDisabled = answers[currentQ.id]?.mostLike === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !isDisabled && handleDualChoice("second", option.value)}
                        disabled={isDisabled}
                        className={`
                          w-full px-4 py-4 text-left rounded-lg border-2 transition-all text-base flex items-center gap-3
                          ${isDisabled 
                            ? 'opacity-50 cursor-not-allowed border-border' 
                            : isSelected
                              ? 'border-primary bg-primary/5 text-foreground' 
                              : 'border-border hover-elevate active-elevate-2'
                          }
                        `}
                        data-testid={`button-q${currentQ.id}-second-${option.value}`}
                      >
                        <span className="font-semibold">{option.value}.</span>
                        <span className="flex-1">{option.text}</span>
                        {isSelected && (
                          <span className="text-primary font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
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
