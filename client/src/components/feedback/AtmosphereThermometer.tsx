import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface AtmosphereThermometerProps {
  initialScore?: number;
  initialNote?: string;
  onNext: (data: { atmosphereScore: number; atmosphereNote?: string }) => void;
}

const ATMOSPHERE_LABELS = [
  { value: 1, emoji: "😞", label: "尴尬", description: "气氛不太好" },
  { value: 2, emoji: "😐", label: "平淡", description: "感觉还行" },
  { value: 3, emoji: "😊", label: "舒适", description: "挺愉快的" },
  { value: 4, emoji: "🤩", label: "热烈", description: "非常开心" },
  { value: 5, emoji: "✨", label: "完美", description: "太棒了！" },
];

export default function AtmosphereThermometer({ 
  initialScore = 3, 
  initialNote = "", 
  onNext 
}: AtmosphereThermometerProps) {
  const [score, setScore] = useState(initialScore);
  const [note, setNote] = useState(initialNote);

  const currentLabel = ATMOSPHERE_LABELS.find(l => l.value === score) || ATMOSPHERE_LABELS[2];

  // Calculate thermometer fill percentage (0-100%)
  const fillPercentage = ((score - 1) / 4) * 100;

  // Get color based on score
  const getColor = (value: number) => {
    if (value <= 2) return "hsl(var(--destructive))";
    if (value === 3) return "hsl(var(--warning))";
    return "hsl(var(--primary))";
  };

  const handleSubmit = () => {
    onNext({ 
      atmosphereScore: score, 
      atmosphereNote: note.trim() || undefined 
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-4xl">{currentLabel.emoji}</div>
            <h2 className="text-xl font-bold">现场氛围如何？</h2>
            <p className="text-sm text-muted-foreground">滑动描述你的感受</p>
          </div>

          {/* Thermometer Visualization */}
          <div className="space-y-4">
            {/* Thermometer Bar */}
            <div className="relative h-12 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ backgroundColor: getColor(score) }}
                initial={{ width: "0%" }}
                animate={{ width: `${fillPercentage}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-foreground mix-blend-difference">
                  {currentLabel.label}
                </span>
              </div>
            </div>

            {/* Slider */}
            <Slider
              value={[score]}
              onValueChange={(values) => setScore(values[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
              data-testid="slider-atmosphere"
            />

            {/* Labels */}
            <div className="flex justify-between text-xs text-muted-foreground px-2">
              <span>😞 尴尬</span>
              <span>😐 平淡</span>
              <span>😊 舒适</span>
              <span>🤩 热烈</span>
              <span>✨ 完美</span>
            </div>
          </div>

          {/* Current Selection Display */}
          <motion.div
            key={score}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10"
          >
            <p className="text-sm font-medium text-primary">
              {currentLabel.description}
            </p>
          </motion.div>

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              补充说明（可选）
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="有什么特别想说的吗？"
              rows={3}
              maxLength={200}
              className="resize-none"
              data-testid="textarea-atmosphere-note"
            />
            <p className="text-xs text-muted-foreground text-right">
              {note.length}/200
            </p>
          </div>

          {/* Next Button */}
          <Button 
            onClick={handleSubmit} 
            size="lg" 
            className="w-full"
            data-testid="button-next-atmosphere"
          >
            下一步
          </Button>
        </CardContent>
      </Card>

      {/* Insight Card */}
      {score >= 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground"
        >
          💡 {((score / 5) * 100).toFixed(0)}% 用户同感
        </motion.div>
      )}
    </div>
  );
}
