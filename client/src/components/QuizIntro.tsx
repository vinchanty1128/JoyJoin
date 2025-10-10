import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Clock, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuizIntroProps {
  onStart: () => void;
  onSkip?: () => void;
}

export default function QuizIntro({ onStart, onSkip }: QuizIntroProps) {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">了解你的社交风格</h2>
            <Badge className="bg-primary/20 text-primary border-0">
              专属测评
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            通过语音回答几个简单问题，深入了解你的性格特质，发现潜在的社交挑战，并找到最适合你的朋友类型。
          </p>

          <div className="grid gap-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">仅需5分钟</p>
                <p className="text-xs text-muted-foreground">5个语音问题，每个约30秒</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mic className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">语音回答</p>
                <p className="text-xs text-muted-foreground">用自然的方式表达真实的你</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">AI深度分析</p>
                <p className="text-xs text-muted-foreground">获得个性化的社交建议和匹配推荐</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        className="w-full" 
        size="lg"
        onClick={onStart}
        data-testid="button-start-quiz"
      >
        开始测评
      </Button>

      {onSkip && (
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={onSkip}
          data-testid="button-skip-intro"
        >
          跳过，稍后完成
        </Button>
      )}
    </div>
  );
}
