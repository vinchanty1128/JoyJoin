import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, CheckCircle, Clock, Play, Eye } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schema for creating event pool
const createPoolSchema = z.object({
  title: z.string().min(1, "活动标题不能为空"),
  description: z.string().optional(),
  eventType: z.enum(["饭局", "酒局", "其他"]),
  city: z.enum(["深圳", "香港"]),
  district: z.string().optional(),
  dateTime: z.string().min(1, "请选择活动时间"),
  registrationDeadline: z.string().min(1, "请选择报名截止时间"),
  genderRestriction: z.string().optional(),
  industryRestrictions: z.array(z.string()).optional(),
  seniorityRestrictions: z.array(z.string()).optional(),
  educationLevelRestrictions: z.array(z.string()).optional(),
  ageRangeMin: z.union([z.number(), z.undefined()]).optional(),
  ageRangeMax: z.union([z.number(), z.undefined()]).optional(),
  minGroupSize: z.number().min(2).max(10).default(4),
  maxGroupSize: z.number().min(2).max(10).default(6),
  targetGroups: z.number().min(1).default(1),
});

interface EventPool {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  city: string;
  district: string | null;
  dateTime: string;
  registrationDeadline: string;
  status: string;
  totalRegistrations: number;
  successfulMatches: number;
  minGroupSize: number;
  maxGroupSize: number;
  targetGroups: number;
  createdAt: string;
  registrationCount?: number;
  matchedCount?: number;
  pendingCount?: number;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "招募中", variant: "secondary" },
  matching: { label: "匹配中", variant: "default" },
  matched: { label: "已匹配", variant: "default" },
  completed: { label: "已完成", variant: "outline" },
  cancelled: { label: "已取消", variant: "destructive" },
};

// Industry options matching user schema
const INDUSTRY_OPTIONS = [
  "互联网/科技",
  "金融/投资",
  "咨询/专业服务",
  "教育/培训",
  "医疗/健康",
  "文化/创意",
  "制造业",
  "零售/电商",
  "房地产/建筑",
  "其他",
];

// Seniority options
const SENIORITY_OPTIONS = [
  "Intern",
  "Junior",
  "Mid",
  "Senior",
  "Founder",
  "Executive",
];

// Education levels
const EDUCATION_OPTIONS = [
  "High school/below",
  "Some college/Associate",
  "Bachelor's",
  "Master's",
  "Doctorate",
  "Trade/Vocational",
];

export default function AdminEventPoolsPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "matched" | "completed">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPool, setSelectedPool] = useState<EventPool | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const { toast } = useToast();

  const { data: pools = [], isLoading } = useQuery<EventPool[]>({
    queryKey: ["/api/admin/event-pools"],
  });

  const form = useForm({
    resolver: zodResolver(createPoolSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "饭局" as const,
      city: "深圳" as const,
      district: "",
      dateTime: "",
      registrationDeadline: "",
      genderRestriction: "",
      industryRestrictions: [],
      seniorityRestrictions: [],
      educationLevelRestrictions: [],
      ageRangeMin: undefined,
      ageRangeMax: undefined,
      minGroupSize: 4,
      maxGroupSize: 6,
      targetGroups: 1,
    },
  });

  const createPoolMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/event-pools", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-pools"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "创建成功",
        description: "活动池已创建，等待用户报名",
      });
    },
    onError: (error: any) => {
      toast({
        title: "创建失败",
        description: error.message || "无法创建活动池，请重试",
        variant: "destructive",
      });
    },
  });

  const triggerMatchingMutation = useMutation({
    mutationFn: (poolId: string) => apiRequest(`/api/admin/event-pools/${poolId}/match`, "POST", {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-pools"] });
      toast({
        title: "匹配完成",
        description: `成功匹配${data.groupCount}个小组，共${data.totalMatched}人`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "匹配失败",
        description: error.message || "无法完成匹配，请检查报名人数是否充足",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (pool: EventPool) => {
    setSelectedPool(pool);
    setShowDetailsDialog(true);
  };

  const handleTriggerMatching = (poolId: string) => {
    if (confirm("确定要开始匹配吗？匹配后将无法撤销。")) {
      triggerMatchingMutation.mutate(poolId);
    }
  };

  const onSubmit = (data: any) => {
    // Convert form data to API format
    const poolData = {
      ...data,
      ageRangeMin: data.ageRangeMin || null,
      ageRangeMax: data.ageRangeMax || null,
      industryRestrictions: data.industryRestrictions || [],
      seniorityRestrictions: data.seniorityRestrictions || [],
      educationLevelRestrictions: data.educationLevelRestrictions || [],
    };
    
    createPoolMutation.mutate(poolData);
  };

  const filteredPools = filterStatus === "all" 
    ? pools 
    : pools.filter(p => p.status === filterStatus);

  const totalPools = pools.length;
  const activeCount = pools.filter(p => p.status === "active").length;
  const matchedCount = pools.filter(p => p.status === "matched").length;
  const completedCount = pools.filter(p => p.status === "completed").length;

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return format(date, "yyyy年MM月dd日 HH:mm", { locale: zhCN });
    } catch (e) {
      return dateTimeStr;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} data-testid={`skeleton-metric-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">加载中...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">活动池管理</h1>
          <p className="text-muted-foreground">两阶段匹配模型 - Admin创建活动池，用户报名并由AI智能分组</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-pool">
              <Calendar className="mr-2 h-4 w-4" />
              创建活动池
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建新活动池</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Basic Info */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>活动标题 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：周五夜聊酒局" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>活动描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="活动简介..." {...field} data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活动类型 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-event-type">
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="饭局">饭局</SelectItem>
                            <SelectItem value="酒局">酒局</SelectItem>
                            <SelectItem value="其他">其他</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>城市 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder="选择城市" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="深圳">深圳</SelectItem>
                            <SelectItem value="香港">香港</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>区域</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：南山区、湾仔" {...field} data-testid="input-district" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活动时间 *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} data-testid="input-datetime" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>报名截止 *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} data-testid="input-deadline" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Hard Constraints */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">硬约束条件（可选）</h3>
                  
                  <FormField
                    control={form.control}
                    name="genderRestriction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性别限制</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="不限" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">不限</SelectItem>
                            <SelectItem value="Woman">仅限女性</SelectItem>
                            <SelectItem value="Man">仅限男性</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>留空表示不限制性别</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="ageRangeMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>最小年龄</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="例如：25"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              data-testid="input-age-min"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ageRangeMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>最大年龄</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="例如：35"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              data-testid="input-age-max"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Group Configuration */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">组局配置</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="minGroupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>最小人数 *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="2"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-min-size"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxGroupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>最大人数 *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="2"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-max-size"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetGroups"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>目标组数 *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-target-groups"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={createPoolMutation.isPending} data-testid="button-submit-pool">
                    {createPoolMutation.isPending ? "创建中..." : "创建活动池"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="metric-total">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总活动池数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPools}</div>
          </CardContent>
        </Card>

        <Card data-testid="metric-active">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">招募中</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>

        <Card data-testid="metric-matched">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已匹配</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchedCount}</div>
          </CardContent>
        </Card>

        <Card data-testid="metric-completed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
        <TabsList>
          <TabsTrigger value="all" data-testid="filter-all">全部</TabsTrigger>
          <TabsTrigger value="active" data-testid="filter-active">招募中</TabsTrigger>
          <TabsTrigger value="matched" data-testid="filter-matched">已匹配</TabsTrigger>
          <TabsTrigger value="completed" data-testid="filter-completed">已完成</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Event Pools List */}
      <div className="grid gap-4">
        {filteredPools.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              暂无活动池
            </CardContent>
          </Card>
        ) : (
          filteredPools.map((pool) => (
            <Card key={pool.id} data-testid={`pool-card-${pool.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {pool.title}
                      <Badge variant={STATUS_MAP[pool.status]?.variant || "default"}>
                        {STATUS_MAP[pool.status]?.label || pool.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {pool.description || "无描述"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">活动类型</div>
                    <div className="font-medium">{pool.eventType}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">地点</div>
                    <div className="font-medium">{pool.city}{pool.district ? ` · ${pool.district}` : ""}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">活动时间</div>
                    <div className="font-medium">{formatDateTime(pool.dateTime)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">报名截止</div>
                    <div className="font-medium">{formatDateTime(pool.registrationDeadline)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>总报名: {pool.registrationCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>已匹配: {pool.matchedCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span>待匹配: {pool.pendingCount || 0}</span>
                  </div>
                  <div className="text-muted-foreground">
                    目标: {pool.targetGroups}组 ({pool.minGroupSize}-{pool.maxGroupSize}人/组)
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(pool)}
                    data-testid={`button-view-${pool.id}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看详情
                  </Button>
                  {pool.status === "active" && (pool.pendingCount || 0) >= (pool.minGroupSize || 4) && (
                    <Button
                      size="sm"
                      onClick={() => handleTriggerMatching(pool.id)}
                      disabled={triggerMatchingMutation.isPending}
                      data-testid={`button-match-${pool.id}`}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      开始匹配
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPool?.title} - 详细信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">状态</div>
                <Badge variant={STATUS_MAP[selectedPool?.status || ""]?.variant || "default"}>
                  {STATUS_MAP[selectedPool?.status || ""]?.label || selectedPool?.status}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground">创建时间</div>
                <div>{selectedPool?.createdAt && formatDateTime(selectedPool.createdAt)}</div>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                报名人数: {selectedPool?.registrationCount || 0} | 
                已匹配: {selectedPool?.matchedCount || 0} | 
                待匹配: {selectedPool?.pendingCount || 0}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
