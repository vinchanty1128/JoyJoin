import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Attendee {
  userId: string;
  displayName: string;
  archetype?: string;
}

interface SelectConnectionsStepProps {
  attendees: Attendee[];
  initialConnections?: string[];
  onNext: (data: { connections: string[] }) => void;
}

const archetypeIcons: Record<string, string> = {
  "社交蝴蝶": "🦋",
  "故事大王": "📖",
  "好奇宝宝": "🔍",
  "氛围担当": "🎭",
  "倾听者": "👂",
  "行动派": "⚡",
  "思考者": "🤔",
  "连接者": "🔗",
  "观察家": "👁️",
  "创意家": "💡",
  "组织者": "📋",
  "破冰者": "❄️",
  "能量球": "⚡",
  "探险家": "🧭",
};

export default function SelectConnectionsStep({
  attendees,
  initialConnections = [],
  onNext,
}: SelectConnectionsStepProps) {
  const [selectedConnections, setSelectedConnections] = useState<string[]>(initialConnections);

  const toggleSelection = (userId: string) => {
    setSelectedConnections(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = () => {
    onNext({ connections: selectedConnections });
  };

  const selectionCount = selectedConnections.length;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-4xl">💫</div>
            <h2 className="text-xl font-bold">选择想继续联系的人</h2>
            <p className="text-sm text-muted-foreground">
              只有双方互选才会解锁1对1私聊，保护你的隐私
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-primary mb-1">隐私保护机制</p>
                <p className="text-muted-foreground leading-relaxed">
                  对方不会知道你选了Ta，除非Ta也选了你。只有双向匹配才解锁私聊，避免尴尬和骚扰。
                </p>
              </div>
            </div>
          </div>

          {/* Attendee Selection */}
          <div className="space-y-3">
            {attendees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">没有其他参与者</p>
              </div>
            ) : (
              attendees.map((attendee) => {
                const isSelected = selectedConnections.includes(attendee.userId);
                const archetypeIcon = attendee.archetype 
                  ? archetypeIcons[attendee.archetype] || "✨"
                  : "✨";

                return (
                  <motion.button
                    key={attendee.userId}
                    onClick={() => toggleSelection(attendee.userId)}
                    className={`w-full border-2 rounded-lg p-4 transition-all hover-elevate active-elevate-2 ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    }`}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`select-connection-${attendee.userId}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {attendee.displayName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 text-left">
                        <div className="font-medium">
                          {attendee.displayName || "参与者"}
                        </div>
                        {attendee.archetype && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm">{archetypeIcon}</span>
                            <span className="text-xs text-muted-foreground">
                              {attendee.archetype}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground/30"
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Selection Counter */}
          {selectionCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Badge variant="secondary" className="text-sm px-4 py-1.5">
                已选择 {selectionCount} 位参与者
              </Badge>
            </motion.div>
          )}

          {/* Helpful Tip */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              💡 小贴士：可以选择多位参与者，也可以一个都不选。双向匹配成功后会收到通知～
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
        data-testid="button-next-connections"
      >
        {selectionCount > 0 ? `继续（已选${selectionCount}位）` : "跳过此步"}
      </Button>
    </div>
  );
}
