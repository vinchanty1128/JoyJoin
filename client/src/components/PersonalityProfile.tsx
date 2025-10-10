import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PersonalityRadarChart from "./PersonalityRadarChart";

interface PersonalityTrait {
  name: string;
  score: number;
  maxScore: number;
}

interface PersonalityProfileProps {
  traits: PersonalityTrait[];
  challenges: string[];
  idealMatch: string;
  onRetakeQuiz?: () => void;
}

export default function PersonalityProfile({ 
  traits, 
  challenges, 
  idealMatch,
  onRetakeQuiz 
}: PersonalityProfileProps) {
  return (
    <div className="space-y-4">
      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">性格特质</h3>
            {onRetakeQuiz && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRetakeQuiz}
                data-testid="button-retake-quiz"
                className="text-xs"
              >
                重新测试
              </Button>
            )}
          </div>

          <PersonalityRadarChart traits={traits} />

          <div className="grid grid-cols-2 gap-2 pt-2">
            {traits.map((trait, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{trait.name}</span>
                <span className="font-medium">{trait.score}/{trait.maxScore}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-destructive/5">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">潜在友谊挑战</h3>
          <div className="space-y-2">
            {challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                <span>{challenge}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">理想朋友类型</h3>
          <p className="text-xs text-muted-foreground">{idealMatch}</p>
        </CardContent>
      </Card>
    </div>
  );
}
