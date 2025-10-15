import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface SocialRoleCardProps {
  primaryRole: string;
  secondaryRole?: string;
  primaryRoleScore: number;
  secondaryRoleScore?: number;
}

const roleConfig: Record<string, { emoji: string; color: string; bgGradient: string; description: string }> = {
  '火花塞': {
    emoji: '⚡',
    color: 'from-yellow-400 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30',
    description: '点燃活动氛围的能量源'
  },
  '探索者': {
    emoji: '🔍',
    color: 'from-blue-400 to-cyan-500',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    description: '发现新鲜事物的冒险家'
  },
  '故事家': {
    emoji: '📖',
    color: 'from-purple-400 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    description: '用故事连接人心'
  },
  '挑战者': {
    emoji: '🎯',
    color: 'from-red-400 to-rose-500',
    bgGradient: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    description: '推动团队突破边界'
  },
  '连接者': {
    emoji: '🤝',
    color: 'from-green-400 to-emerald-500',
    bgGradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    description: '搭建友谊的桥梁'
  },
  '协调者': {
    emoji: '⚖️',
    color: 'from-indigo-400 to-blue-500',
    bgGradient: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30',
    description: '平衡关系的智者'
  },
  '氛围组': {
    emoji: '🎉',
    color: 'from-pink-400 to-fuchsia-500',
    bgGradient: 'bg-gradient-to-br from-pink-50 to-fuchsia-50 dark:from-pink-950/30 dark:to-fuchsia-950/30',
    description: '制造欢乐的魔法师'
  },
  '肯定者': {
    emoji: '👍',
    color: 'from-teal-400 to-green-500',
    bgGradient: 'bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-950/30 dark:to-green-950/30',
    description: '传递正能量的太阳'
  },
};

export default function SocialRoleCard({ 
  primaryRole, 
  secondaryRole,
  primaryRoleScore,
  secondaryRoleScore
}: SocialRoleCardProps) {
  const primaryConfig = roleConfig[primaryRole] || roleConfig['火花塞'];
  const secondaryConfig = secondaryRole ? roleConfig[secondaryRole] : null;

  return (
    <Card className={`border-2 shadow-lg overflow-hidden ${primaryConfig.bgGradient}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">我的社交角色</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            AI 匹配
          </Badge>
        </div>

        {/* Primary Role Avatar & Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${primaryConfig.color} flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}>
              <span className="text-5xl" data-testid="text-primary-role-emoji">
                {primaryConfig.emoji}
              </span>
            </div>
            {/* Score Badge */}
            <div className="absolute -bottom-2 -right-2 bg-background border-2 border-primary rounded-full px-2 py-0.5 shadow-md">
              <span className="text-xs font-bold text-primary">{primaryRoleScore}分</span>
            </div>
          </div>

          {/* Role Info */}
          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-2xl font-bold mb-1" data-testid="text-primary-role-name">
                {primaryRole}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {primaryConfig.description}
              </p>
            </div>

            {/* Secondary Role */}
            {secondaryRole && secondaryConfig && (
              <div className="flex items-center gap-2 pt-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${secondaryConfig.color} flex items-center justify-center`}>
                  <span className="text-lg" data-testid="text-secondary-role-emoji">
                    {secondaryConfig.emoji}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" data-testid="text-secondary-role-name">
                      {secondaryRole}
                    </span>
                    {secondaryRoleScore && (
                      <Badge variant="outline" className="text-xs">
                        {secondaryRoleScore}分
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">辅助角色</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fun Fact */}
        <div className={`mt-4 p-3 rounded-lg bg-gradient-to-r ${primaryConfig.color} bg-opacity-10`}>
          <p className="text-xs text-center font-medium">
            💫 {primaryRole}们最擅长在小聚中带来独特的社交价值！
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
