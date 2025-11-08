import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: fullUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !userLoading && fullUser && !fullUser.isAdmin) {
      setLocation("/");
    }
  }, [authLoading, userLoading, fullUser, setLocation]);

  if (authLoading || userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">验证权限中...</p>
        </div>
      </div>
    );
  }

  if (!fullUser?.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-lg font-medium">无权访问</p>
          <p className="text-sm text-muted-foreground">您没有访问管理后台的权限</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
