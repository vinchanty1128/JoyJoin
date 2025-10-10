import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import VoiceQuiz from "@/components/VoiceQuiz";
import QuizIntro from "@/components/QuizIntro";
import PersonalityProfile from "@/components/PersonalityProfile";

export default function OnboardingQuizPage() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<"intro" | "quiz" | "results">("intro");
  const [results, setResults] = useState<any>(null);

  const handleQuizComplete = (quizResults: any) => {
    setResults(quizResults);
    setStage("results");
  };

  const handleFinish = () => {
    // In real app, save results to backend
    setLocation("/profile");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center h-14 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => stage === "results" ? handleFinish() : setLocation("/profile")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 font-semibold">
            {stage === "intro" && "性格测评"}
            {stage === "quiz" && "语音问答"}
            {stage === "results" && "测评结果"}
          </h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {stage === "intro" && (
          <QuizIntro 
            onStart={() => setStage("quiz")}
            onSkip={() => setLocation("/profile")}
          />
        )}

        {stage === "quiz" && (
          <VoiceQuiz 
            onComplete={handleQuizComplete}
            onSkip={() => setLocation("/profile")}
          />
        )}

        {stage === "results" && results && (
          <div className="space-y-4">
            <div className="text-center space-y-2 pb-4">
              <h2 className="text-2xl font-display font-bold">测评完成！</h2>
              <p className="text-sm text-muted-foreground">
                以下是你的性格分析结果
              </p>
            </div>

            <PersonalityProfile
              traits={results.traits}
              challenges={results.challenges}
              idealMatch={results.idealMatch}
            />

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleFinish}
              data-testid="button-finish-quiz"
            >
              完成并保存
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
