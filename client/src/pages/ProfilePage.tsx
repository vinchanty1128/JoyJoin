import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import VibeProfileCard from "@/components/VibeProfileCard";
import PersonalityProfile from "@/components/PersonalityProfile";
import QuizIntro from "@/components/QuizIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, LogOut, Shield, HelpCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [showQuizIntro, setShowQuizIntro] = useState(false);
  
  const hasCompletedQuiz = true;
  
  const personalityData = hasCompletedQuiz ? {
    traits: [
      { name: "亲和力", score: 8, maxScore: 10 },
      { name: "开放性", score: 7, maxScore: 10 },
      { name: "责任心", score: 6, maxScore: 10 },
      { name: "外向性", score: 5, maxScore: 10 },
      { name: "情绪稳定性", score: 8, maxScore: 10 }
    ],
    challenges: [
      "可能对突然的计划变更感到不适应",
      "在大型社交场合中可能需要独处时间恢复能量"
    ],
    idealMatch: "你会在与同样重视深度对话、欣赏计划性活动但也能享受偶尔即兴时刻的朋友相处中感到愉快。寻找那些能理解你需要独处时间、同时也享受有意义社交互动的人。",
    energyLevel: 75
  } : null;

  const handleStartQuiz = () => {
    setLocation("/onboarding/quiz");
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="我的" showSettings={true} />
      
      <div className="px-4 py-4 space-y-4">
        <VibeProfileCard
          name="Alex Rivera"
          initials="AR"
          vibes={["咖啡爱好者", "内向", "创意", "书虫", "夜猫子"]}
          eventsAttended={12}
          matchesMade={8}
        />

        {!hasCompletedQuiz ? (
          <Card className="border shadow-sm bg-gradient-to-br from-primary/10 to-transparent cursor-pointer hover-elevate active-elevate-2" onClick={() => setShowQuizIntro(true)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">发现你的社交风格</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    完成5分钟语音测评，获得个性化的朋友匹配推荐
                  </p>
                </div>
                <Button size="sm" data-testid="button-take-quiz">
                  开始
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : personalityData ? (
          <PersonalityProfile
            traits={personalityData.traits}
            challenges={personalityData.challenges}
            idealMatch={personalityData.idealMatch}
            energyLevel={personalityData.energyLevel}
            onRetakeQuiz={handleStartQuiz}
          />
        ) : null}

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">账户</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" data-testid="button-edit-profile">
              <Edit className="h-4 w-4 mr-3" />
              编辑资料
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-safety">
              <Shield className="h-4 w-4 mr-3" />
              安全与隐私
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-help">
              <HelpCircle className="h-4 w-4 mr-3" />
              帮助与支持
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-3" />
              退出登录
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />

      {showQuizIntro && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
            <div className="flex items-center h-14 px-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowQuizIntro(false)}
                data-testid="button-close-quiz-intro"
              >
                <span className="text-lg">←</span>
              </Button>
              <h1 className="ml-2 font-semibold">性格测评</h1>
            </div>
          </div>
          <div className="p-4">
            <QuizIntro 
              onStart={handleStartQuiz}
              onSkip={() => setShowQuizIntro(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
