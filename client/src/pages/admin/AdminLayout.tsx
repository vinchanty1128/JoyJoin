import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Route, Switch } from "wouter";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminSubscriptionsPage from "@/pages/admin/AdminSubscriptionsPage";
import AdminCouponsPage from "@/pages/admin/AdminCouponsPage";
import AdminVenuesPage from "@/pages/admin/AdminVenuesPage";
import AdminEventTemplatesPage from "@/pages/admin/AdminEventTemplatesPage";
import AdminEventsPage from "@/pages/admin/AdminEventsPage";
import AdminFinancePage from "@/pages/admin/AdminFinancePage";
import AdminDataInsightsPage from "@/pages/admin/AdminDataInsightsPage";
import AdminContentPage from "@/pages/admin/AdminContentPage";
import AdminModerationPage from "@/pages/admin/AdminModerationPage";
import AdminMatchingLabPage from "@/pages/admin/AdminMatchingLabPage";

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
              <Route path="/admin/users" component={AdminUsersPage} />
              <Route path="/admin/subscriptions" component={AdminSubscriptionsPage} />
              <Route path="/admin/coupons" component={AdminCouponsPage} />
              <Route path="/admin/venues" component={AdminVenuesPage} />
              <Route path="/admin/templates" component={AdminEventTemplatesPage} />
              <Route path="/admin/events" component={AdminEventsPage} />
              <Route path="/admin/finance" component={AdminFinancePage} />
              <Route path="/admin/insights" component={AdminDataInsightsPage} />
              <Route path="/admin/content" component={AdminContentPage} />
              <Route path="/admin/moderation" component={AdminModerationPage} />
              <Route path="/admin/matching" component={AdminMatchingLabPage} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
    </AdminGuard>
  );
}
