import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, FileText, HelpCircle, Shield } from "lucide-react";

export default function AdminContentPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">内容管理</h1>
        <p className="text-muted-foreground mt-1">管理平台公告、帮助文档和社区规范</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover-elevate cursor-pointer" data-testid="card-announcements">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>平台公告</CardTitle>
                <CardDescription>发布和管理系统公告</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持创建公告、定时发布、推送通知
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-help-articles">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>帮助文章</CardTitle>
                <CardDescription>编辑用户帮助文档</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持富文本编辑、分类管理、搜索优化
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-faqs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>常见问题</CardTitle>
                <CardDescription>管理FAQ问答库</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持问题分类、答案模板、数据统计
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-community-guidelines">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>社区规范</CardTitle>
                <CardDescription>管理社区行为准则</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中 - 将支持规范条款、违规案例、处罚说明
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
