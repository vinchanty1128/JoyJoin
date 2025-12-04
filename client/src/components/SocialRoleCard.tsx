import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { archetypeConfig } from "@/lib/archetypes";
import { archetypeAvatars } from "@/lib/archetypeAvatars";

interface SocialRoleCardProps {
  primaryRole: string;
  secondaryRole?: string;
  primaryRoleScore: number;
  secondaryRoleScore?: number;
}

const roleConfig: Record<string, { emoji: string; color: string; bgGradient: string }> = {
  '开心柯基': {
    emoji: '🐕',
    color: 'from-yellow-400 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30'
  },
  '太阳鸡': {
    emoji: '🐓',
    color: 'from-amber-400 to-yellow-500',
    bgGradient: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30'
  },
  '夸夸豚': {
    emoji: '🐬',
    color: 'from-cyan-400 to-blue-500',
    bgGradient: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30'
  },
  '机智狐': {
    emoji: '🦊',
    color: 'from-orange-400 to-red-500',
    bgGradient: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30'
  },
  '淡定海豚': {
    emoji: '🐬',
    color: 'from-blue-400 to-indigo-500',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30'
  },
  '织网蛛': {
    emoji: '🕷️',
    color: 'from-purple-400 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30'
  },
  '暖心熊': {
    emoji: '🐻',
    color: 'from-rose-400 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30'
  },
  '灵感章鱼': {
    emoji: '🐙',
    color: 'from-violet-400 to-purple-500',
    bgGradient: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30'
  },
  '沉思猫头鹰': {
    emoji: '🦉',
    color: 'from-slate-400 to-gray-500',
    bgGradient: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30'
  },
  '定心大象': {
    emoji: '🐘',
    color: 'from-gray-400 to-slate-500',
    bgGradient: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30'
  },
  '稳如龟': {
    emoji: '🐢',
    color: 'from-green-400 to-emerald-500',
    bgGradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30'
  },
  '隐身猫': {
    emoji: '🐱',
    color: 'from-indigo-400 to-purple-500',
    bgGradient: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30'
  },
};

export default function SocialRoleCard({ 
  primaryRole, 
  secondaryRole,
  primaryRoleScore,
  secondaryRoleScore
}: SocialRoleCardProps) {
  const primaryConfig = roleConfig[primaryRole] || roleConfig['暖心熊'];
  const secondaryConfig = secondaryRole ? roleConfig[secondaryRole] : null;
  const primaryArchetype = archetypeConfig[primaryRole];
  const nickname = primaryArchetype?.nickname || '';
  const tagline = primaryArchetype?.tagline || '';
  const primaryAvatar = archetypeAvatars[primaryRole];

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
              {primaryAvatar ? (
                <img
                  src={primaryAvatar}
                  alt={primaryRole}
                  className="w-20 h-20 rounded-2xl object-cover"
                  data-testid="text-primary-role-emoji"
                />
              ) : (
                <span className="text-5xl" data-testid="text-primary-role-emoji">
                  {primaryConfig.emoji}
                </span>
              )}
            </div>
            {/* Score Badge */}
            <div className="absolute -bottom-2 -right-2 bg-background border-2 border-primary rounded-full px-2 py-0.5 shadow-md">
              <span className="text-xs font-bold text-primary">{primaryRoleScore}分</span>
            </div>
          </div>

          {/* Role Info */}
          <div className="flex-1 space-y-1.5">
            <div>
              <h2 className="text-2xl font-bold mb-1" data-testid="text-primary-role-name">
                {primaryRole}
              </h2>
              {nickname && (
                <p className="text-base font-medium text-primary mb-1" data-testid="text-nickname">
                  {nickname}
                </p>
              )}
              {tagline && (
                <p className="text-sm text-muted-foreground leading-relaxed italic" data-testid="text-tagline">
                  {tagline}
                </p>
              )}
            </div>
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
