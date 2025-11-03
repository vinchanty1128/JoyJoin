import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import UserInfoCard from "@/components/UserInfoCard";
import EditFullProfileDialog from "@/components/EditFullProfileDialog";
import { ChevronLeft, User, GraduationCap, Briefcase, Heart, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
} from "@/lib/userFieldMappings";

export default function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: user, isLoading } = useQuery<any>({ queryKey: ["/api/auth/user"] });

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

  const handleSaveProfile = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const age = user.birthdate ? calculateAge(user.birthdate) : null;
  const ageDisplay = age ? formatAge(age) : null;

  // Prepare data for cards
  const basicInfoFields = [
    { label: "昵称", value: user.displayName },
    { label: "性别", value: user.gender ? getGenderDisplay(user.gender) : null },
    { label: "年龄", value: ageDisplay },
    { label: "常用语言", value: user.languagesComfort, type: "badge-list" as const },
  ];

  const educationFields = [
    { label: "教育水平", value: user.educationLevel ? getEducationDisplay(user.educationLevel) : null },
    { label: "专业领域", value: user.fieldOfStudy },
    { label: "学习地点", value: user.studyLocale ? getStudyLocaleDisplay(user.studyLocale) : null },
    ...(user.studyLocale === "Overseas" || user.studyLocale === "Both"
      ? [{ label: "海外地区", value: user.overseasRegions, type: "badge-list" as const }]
      : []),
  ];

  const workFields = [
    { label: "行业", value: user.industry },
    { label: "职位", value: user.roleTitleShort },
    { label: "资历", value: user.seniority ? getSeniorityDisplay(user.seniority) : null },
  ];

  const personalFields = [
    { label: "关系状态", value: user.relationshipStatus ? getRelationshipDisplay(user.relationshipStatus) : null },
    { label: "孩子状况", value: user.children ? getChildrenDisplay(user.children) : null },
  ];

  const interestsFields = [
    { label: "兴趣爱好", value: user.interestsTop, type: "badge-list" as const },
    { label: "预算偏好", value: user.budgetPreference, type: "badge-list" as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center h-14 px-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/profile")}
            data-testid="button-back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-lg font-semibold">编辑资料</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        <UserInfoCard
          title="基本信息"
          icon={<User className="h-4 w-4" />}
          fields={basicInfoFields}
          editable
          onEdit={() => setEditDialogOpen(true)}
        />

        <UserInfoCard
          title="教育背景"
          icon={<GraduationCap className="h-4 w-4" />}
          fields={educationFields}
          editable
          onEdit={() => setEditDialogOpen(true)}
        />

        <UserInfoCard
          title="工作信息"
          icon={<Briefcase className="h-4 w-4" />}
          fields={workFields}
          editable
          onEdit={() => setEditDialogOpen(true)}
        />

        <UserInfoCard
          title="个人背景"
          icon={<Heart className="h-4 w-4" />}
          fields={personalFields}
          editable
          onEdit={() => setEditDialogOpen(true)}
        />

        <div className="text-xs text-muted-foreground px-4 py-2">
          💡 提示：此信息仅自己可见
        </div>

        <UserInfoCard
          title="兴趣偏好"
          icon={<Star className="h-4 w-4" />}
          fields={interestsFields}
          editable
          onEdit={() => setEditDialogOpen(true)}
        />
      </div>

      {/* Edit Dialog */}
      <EditFullProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
