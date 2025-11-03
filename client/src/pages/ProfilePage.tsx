import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import PersonalityProfile from "@/components/PersonalityProfile";
import SocialRoleCard from "@/components/SocialRoleCard";
import QuizIntro from "@/components/QuizIntro";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, LogOut, Shield, HelpCircle, Sparkles, User, GraduationCap, Briefcase, Heart, Star } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  getGenderDisplay,
  calculateAge,
  formatAge,
  getEducationDisplay,
  getStudyLocaleDisplay,
  getSeniorityDisplay,
  getRelationshipDisplay,
  getChildrenDisplay,
  formatArray,
} from "@/lib/userFieldMappings";

type SectionType = "basic" | "education" | "work" | "personal" | "interests";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [showQuizIntro, setShowQuizIntro] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<SectionType>("basic");
  const { toast } = useToast();
  
  const { data: user } = useQuery<any>({ queryKey: ["/api/auth/user"] });
  const { data: personalityResults } = useQuery<any>({
    queryKey: ["/api/personality-test/results"],
    enabled: !!user?.hasCompletedPersonalityTest,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "保存成功",
        description: "个人信息已更新",
      });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (section: SectionType) => {
    setEditSection(section);
    setEditDialogOpen(true);
  };

  const handleSaveProfile = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "已退出登录",
        description: "您已成功退出登录",
      });
      setLocation("/auth/phone");
    },
    onError: () => {
      toast({
        title: "退出失败",
        description: "退出登录时出现问题，请重试",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const hasCompletedQuiz = !!user?.hasCompletedPersonalityTest;
  
  const personalityData = hasCompletedQuiz && personalityResults ? {
    traits: [
      { name: "亲和力", score: personalityResults.affinityScore || 0, maxScore: 10 },
      { name: "开放性", score: personalityResults.opennessScore || 0, maxScore: 10 },
      { name: "责任心", score: personalityResults.conscientiousnessScore || 0, maxScore: 10 },
      { name: "外向性", score: personalityResults.extraversionScore || 0, maxScore: 10 },
      { name: "情绪稳定性", score: personalityResults.emotionalStabilityScore || 0, maxScore: 10 },
      { name: "正能量性", score: personalityResults.positivityScore || 0, maxScore: 10 }
    ],
    challenges: personalityResults.challenges ? [personalityResults.challenges] : [],
    idealMatch: personalityResults.idealFriendTypes?.join('、') || personalityResults.idealFriendTypes?.[0] || "",
    energyLevel: 75 // Default energy level for now
  } : null;

  const handleStartQuiz = () => {
    setLocation("/onboarding/quiz");
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    return "用户";
  };

  const getInitials = () => {
    const name = getUserName();
    if (name === "用户") return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="我的" showSettings={true} />
      
      <div className="px-4 py-4 space-y-4">
        {/* Profile Header Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{getUserName()}</h2>
                <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{user?.eventsAttended || 0} 次活动</span>
                  <span>{user?.matchesMade || 0} 个匹配</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Role Card - Show if test completed */}
        {hasCompletedQuiz && personalityResults && (
          <SocialRoleCard
            primaryRole={personalityResults.primaryRole}
            secondaryRole={personalityResults.secondaryRole}
            primaryRoleScore={personalityResults.primaryRoleScore}
            secondaryRoleScore={personalityResults.secondaryRoleScore}
          />
        )}

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

        {/* Basic Information Card */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">基本信息</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditClick("basic")}
              data-testid="button-edit-basic"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">昵称</span>
              <span className="text-muted-foreground">{user?.displayName || "未填写"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">性别</span>
              <span className="text-muted-foreground">{getGenderDisplay(user?.gender) || "未填写"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">年龄</span>
              <span className="text-muted-foreground">
                {user?.birthdate ? formatAge(calculateAge(user.birthdate)) : "未填写"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">常用语言</span>
              <span className="text-muted-foreground">
                {formatArray(user?.languagesComfort) || "未填写"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Education Background Card */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">教育背景</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditClick("education")}
              data-testid="button-edit-education"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">教育水平</span>
              <span className="text-muted-foreground">{getEducationDisplay(user?.educationLevel) || "未填写"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">专业领域</span>
              <span className="text-muted-foreground">{user?.fieldOfStudy || "未填写"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">学习地点</span>
              <span className="text-muted-foreground">{getStudyLocaleDisplay(user?.studyLocale) || "未填写"}</span>
            </div>
            {user?.overseasRegions && user.overseasRegions.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="font-medium">海外地区</span>
                <span className="text-muted-foreground">{formatArray(user.overseasRegions)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Information Card */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">工作信息</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditClick("work")}
              data-testid="button-edit-work"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">行业</span>
              <span className="text-muted-foreground">{user?.industry || "未填写"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">职位</span>
              <span className="text-muted-foreground">{user?.roleTitleShort || "未填写"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">资历</span>
              <span className="text-muted-foreground">{getSeniorityDisplay(user?.seniority) || "未填写"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Background Card */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">个人背景</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditClick("personal")}
              data-testid="button-edit-personal"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">关系状态</span>
              <span className="text-muted-foreground">{getRelationshipDisplay(user?.relationshipStatus) || "未填写"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">孩子状况</span>
              <span className="text-muted-foreground">{getChildrenDisplay(user?.children) || "未填写"}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              提示：此信息仅自己可见
            </p>
          </CardContent>
        </Card>

        {/* Interests and Preferences Card */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">兴趣偏好</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditClick("interests")}
              data-testid="button-edit-interests"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="font-medium">兴趣爱好</span>
              <span className="text-muted-foreground">
                {formatArray(user?.interestsTop) || "未填写"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">预算偏好</span>
              <span className="text-muted-foreground">
                {formatArray(user?.budgetPreference) || "未填写"}
              </span>
            </div>
          </CardContent>
        </Card>

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
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive" 
              data-testid="button-logout"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {logoutMutation.isPending ? "退出中..." : "退出登录"}
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

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        section={editSection}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
