import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Route, Switch } from "wouter";
import AdminDashboard from "@/pages/admin/AdminDashboard";

export default function AdminLayout() {
  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <AdminGuard>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b px-6 py-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-medium">管理后台</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">管理员</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/users">
                <div className="p-6">用户管理 - 开发中</div>
              </Route>
              <Route path="/admin/subscriptions">
                <div className="p-6">订阅管理 - 开发中</div>
              </Route>
              <Route path="/admin/coupons">
                <div className="p-6">优惠券管理 - 开发中</div>
              </Route>
              <Route path="/admin/venues">
                <div className="p-6">场地管理 - 开发中</div>
              </Route>
              <Route path="/admin/templates">
                <div className="p-6">活动模板管理 - 开发中</div>
              </Route>
              <Route path="/admin/events">
                <div className="p-6">活动管理 - 开发中</div>
              </Route>
              <Route path="/admin/finance">
                <div className="p-6">财务管理 - 开发中</div>
              </Route>
              <Route path="/admin/insights">
                <div className="p-6">数据洞察 - 开发中</div>
              </Route>
              <Route path="/admin/content">
                <div className="p-6">内容管理 - 开发中</div>
              </Route>
              <Route path="/admin/moderation">
                <div className="p-6">举报审核 - 开发中</div>
              </Route>
              <Route path="/admin/matching">
                <div className="p-6">匹配实验室 - 开发中</div>
              </Route>
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
    </AdminGuard>
  );
}
