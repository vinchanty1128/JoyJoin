import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PersonalityRadarChart from '@/components/PersonalityRadarChart';
import { Sparkles, Users, TrendingUp, AlertTriangle, Heart, Share2 } from 'lucide-react';
import type { RoleResult } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { motion } from 'framer-motion';

export default function PersonalityTestResultPage() {
  const [, setLocation] = useLocation();

  const { data: result, isLoading } = useQuery<RoleResult>({
    queryKey: ['/api/personality-test/results'],
  });

  const { data: stats } = useQuery<Record<string, number>>({
    queryKey: ['/api/personality-test/stats'],
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
    '火花塞': '🙌',
    '探索者': '🧭',
    '故事家': '🗣️',
    '挑战者': '💪',
    '连接者': '🤗',
    '协调者': '🧘',
    '氛围组': '🕺',
    '肯定者': '🙏',
  };

  // Chemistry/matching compatibility data
  const chemistryMap: Record<string, Array<{ role: string; percentage: number }>> = {
    '火花塞': [
      { role: '探索者', percentage: 92 },
      { role: '故事家', percentage: 88 },
      { role: '协调者', percentage: 85 },
    ],
    '探索者': [
      { role: '火花塞', percentage: 92 },
      { role: '挑战者', percentage: 90 },
      { role: '连接者', percentage: 86 },
    ],
    '故事家': [
      { role: '连接者', percentage: 94 },
      { role: '火花塞', percentage: 88 },
      { role: '肯定者', percentage: 87 },
    ],
    '挑战者': [
      { role: '探索者', percentage: 90 },
      { role: '协调者', percentage: 88 },
      { role: '氛围组', percentage: 82 },
    ],
    '连接者': [
      { role: '故事家', percentage: 94 },
      { role: '探索者', percentage: 86 },
      { role: '肯定者', percentage: 89 },
    ],
    '协调者': [
      { role: '火花塞', percentage: 85 },
      { role: '挑战者', percentage: 88 },
      { role: '连接者', percentage: 84 },
    ],
    '氛围组': [
      { role: '肯定者', percentage: 91 },
      { role: '故事家', percentage: 87 },
      { role: '挑战者', percentage: 82 },
    ],
    '肯定者': [
      { role: '氛围组', percentage: 91 },
      { role: '连接者', percentage: 89 },
      { role: '故事家', percentage: 87 },
    ],
  };

  const myChemistry = chemistryMap[result.primaryRole] || [];
  const myPercentage = stats?.[result.primaryRole] || 0;

  const handleShare = async () => {
    const shareData = {
      title: `我的社交角色是${result.primaryRole}！`,
      text: `刚完成了JoyJoin性格测评，发现我是${result.primaryRole}！快来测测你的社交特质吧~ ✨`,
      url: window.location.origin + '/personality-test',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert('已复制到剪贴板！');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 pb-8 space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6 pb-2"
        >
          <h1 className="text-3xl font-bold mb-2" data-testid="text-result-title">
            你的社交引擎角色
          </h1>
          <p className="text-muted-foreground">
            基于你的选择，我们识别出了你的社交特质
          </p>
        </motion.div>

        {/* Primary Role Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
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
        </motion.div>

        {/* Social Comparison Card */}
        {stats && myPercentage > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  你在人群中的位置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {myPercentage}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    在港深使用JoyJoin的用户中，<span className="font-semibold text-foreground">{myPercentage}%</span> 的人也是<span className="font-semibold text-foreground">{result.primaryRole}</span>
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    社群分布概览
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(stats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([role, percentage]) => (
                        <div key={role} className="text-center p-2 rounded-lg bg-muted/30">
                          <div className="text-lg mb-1">{roleIcons[role]}</div>
                          <div className="text-xs font-semibold">{percentage}%</div>
                          <div className="text-[10px] text-muted-foreground truncate">{role}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chemistry/Matching Prediction Card */}
        {myChemistry.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-red-500" />
                  活动匹配预测
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  作为<span className="font-semibold text-foreground">{result.primaryRole}</span>，你在活动中与这些角色最有化学反应：
                </p>
                <div className="space-y-3">
                  {myChemistry.map((match, index) => (
                    <motion.div
                      key={match.role}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="text-2xl">{roleIcons[match.role]}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{match.role}</div>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${match.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className="bg-primary h-2 rounded-full"
                          />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {match.percentage}%
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 我们的AI算法会优先为你匹配这些化学反应高的角色，让每次聚会都能擦出火花！
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
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
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            data-testid="button-share"
            variant="outline"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            分享结果
          </Button>
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
