import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PersonalityRadarChart from '@/components/PersonalityRadarChart';
import { Sparkles, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import type { RoleResult } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

export default function PersonalityTestResultPage() {
  const [, setLocation] = useLocation();

  const { data: result, isLoading } = useQuery<RoleResult>({
    queryKey: ['/api/personality-test/results'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">正在加载您的结果...</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">未找到测试结果</div>
          <Button
            data-testid="button-back-to-test"
            className="mt-4"
            onClick={() => setLocation('/personality-test')}
          >
            返回测试
          </Button>
        </div>
      </div>
    );
  }

  const roleIcons: Record<string, string> = {
    '火花塞': '⚡',
    '探索者': '🔍',
    '故事家': '📖',
    '挑战者': '🎯',
    '连接者': '🤝',
    '协调者': '⚖️',
    '氛围组': '🎉',
    '肯定者': '👍',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 pb-8 space-y-4">
        {/* Header */}
        <div className="text-center pt-6 pb-2">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-result-title">
            你的社交引擎角色
          </h1>
          <p className="text-muted-foreground">
            基于你的选择，我们识别出了你的社交特质
          </p>
        </div>

        {/* Primary Role Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-4xl" data-testid="text-role-icon">
                  {roleIcons[result.primaryRole] || '🌟'}
                </span>
                <div>
                  <div className="text-2xl" data-testid="text-primary-role">
                    {result.primaryRole}
                  </div>
                  {result.roleSubtype && (
                    <div className="text-sm text-muted-foreground font-normal" data-testid="text-role-subtype">
                      {result.roleSubtype}
                    </div>
                  )}
                </div>
              </CardTitle>
              {result.secondaryRole && (
                <Badge variant="secondary" data-testid="badge-secondary-role">
                  辅助角色: {result.secondaryRole}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Radar Chart */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-center">六维社交特质</h3>
              <PersonalityRadarChart
                affinityScore={result.affinityScore}
                opennessScore={result.opennessScore}
                conscientiousnessScore={result.conscientiousnessScore}
                emotionalStabilityScore={result.emotionalStabilityScore}
                extraversionScore={result.extraversionScore}
                positivityScore={result.positivityScore}
              />
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>你的优势</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-strengths">
                {result.strengths}
              </p>
            </div>

            {/* Challenges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>可能的挑战</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-challenges">
                {result.challenges}
              </p>
            </div>

            {/* Ideal Friend Types */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="w-4 h-4 text-primary" />
                <span>理想朋友类型</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.idealFriendTypes?.map((type: string) => (
                  <Badge key={type} variant="outline" data-testid={`badge-ideal-friend-${type}`}>
                    {roleIcons[type] || '👥'} {type}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">接下来做什么？</p>
                <p className="text-sm text-muted-foreground">
                  你的角色信息将帮助我们为你匹配更合适的聚会和朋友。现在可以继续完善你的个人资料，或者直接开始探索活动！
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            data-testid="button-continue"
            className="flex-1"
            onClick={async () => {
              // Invalidate auth query to trigger next onboarding step
              await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
              setLocation('/');
            }}
          >
            开始探索活动
          </Button>
        </div>
      </div>
    </div>
  );
}
