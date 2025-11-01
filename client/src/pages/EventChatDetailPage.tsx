import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Users, Star, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, ChatMessage, EventFeedback } from "@shared/schema";

// Archetype configuration for displaying icons and colors
const archetypeConfig: Record<string, { icon: string; color: string }> = {
  "火花塞": { icon: "🙌", color: "text-orange-600 dark:text-orange-400" },
  "探索者": { icon: "🧭", color: "text-cyan-600 dark:text-cyan-400" },
  "故事家": { icon: "🗣️", color: "text-purple-600 dark:text-purple-400" },
  "挑战者": { icon: "💪", color: "text-red-600 dark:text-red-400" },
  "连接者": { icon: "🤗", color: "text-emerald-600 dark:text-emerald-400" },
  "协调者": { icon: "🧘", color: "text-indigo-600 dark:text-indigo-400" },
  "氛围组": { icon: "🕺", color: "text-fuchsia-600 dark:text-fuchsia-400" },
  "肯定者": { icon: "🙏", color: "text-teal-600 dark:text-teal-400" },
};

export default function EventChatDetailPage() {
  const { eventId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [vibeMatch, setVibeMatch] = useState(0);
  const [energyMatch, setEnergyMatch] = useState(0);
  const [wouldAttendAgain, setWouldAttendAgain] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: joinedEvents } = useQuery<Array<any>>({
    queryKey: ["/api/events/joined"],
  });

  const event = joinedEvents?.find((e: any) => e.id === eventId);

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{
    chatUnlocked: boolean;
    hoursUntilUnlock: number;
    messages: Array<ChatMessage & { user: User }>;
  }>({
    queryKey: ["/api/events", eventId, "/messages"],
    refetchInterval: 5000,
  });

  const messages = messagesData?.messages || [];
  const chatUnlocked = messagesData?.chatUnlocked ?? false;
  const hoursUntilUnlock = messagesData?.hoursUntilUnlock ?? 0;

  const { data: participants } = useQuery<Array<User>>({
    queryKey: ["/api/events", eventId, "/participants"],
  });

  const { data: existingFeedback } = useQuery<EventFeedback | null>({
    queryKey: ["/api/events", eventId, "/feedback"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: string) => {
      return await apiRequest("POST", `/api/events/${eventId}/messages`, { message: msg });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "/messages"] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/events/${eventId}/feedback`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "/feedback"] });
      toast({
        title: "反馈已提交",
        description: "感谢你的反馈！",
      });
    },
    onError: (error) => {
      toast({
        title: "提交失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleSubmitFeedback = () => {
    if (rating === 0 || vibeMatch === 0 || energyMatch === 0) {
      toast({
        title: "请完成评分",
        description: "请为所有项目评分",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate({
      rating,
      vibeMatch,
      energyMatch,
      wouldAttendAgain,
      feedback: feedbackText || null,
      connections: selectedConnections,
    });
  };

  const toggleConnection = (userId: string) => {
    setSelectedConnections(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const isEventPast = event && event.dateTime && new Date(event.dateTime) < new Date();
  const hasFeedback = !!existingFeedback;


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center h-14 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/chats")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-2 flex-1">
            <h1 className="font-semibold truncate">{event?.title || "活动聊天"}</h1>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b h-12 px-4">
          <TabsTrigger value="chat" data-testid="tab-chat">聊天</TabsTrigger>
          <TabsTrigger value="participants" data-testid="tab-participants">
            参与者 ({participants?.length || 0})
          </TabsTrigger>
          {isEventPast && (
            <TabsTrigger value="feedback" data-testid="tab-feedback">
              反馈 {hasFeedback && "✓"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col m-0">
          {!chatUnlocked ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <Card className="max-w-sm w-full">
                <CardContent className="p-8 text-center space-y-4">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">群聊即将开放</h3>
                    <p className="text-sm text-muted-foreground">
                      群聊将在活动开始前24小时开放
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {Math.floor(hoursUntilUnlock)}小时{Math.round((hoursUntilUnlock % 1) * 60)}分钟后开放
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-4">
                    届时你可以和其他参与者提前认识，聊聊期待～
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg) => {
                    const archetypeData = msg.user.archetype && archetypeConfig[msg.user.archetype]
                      ? archetypeConfig[msg.user.archetype]
                      : { icon: "✨", color: "text-muted-foreground" };
                    
                    return (
                      <div key={msg.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {msg.user.profileImageUrl ? (
                            <AvatarImage src={msg.user.profileImageUrl} />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-lg">
                              {archetypeData.icon}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">
                              {msg.user.displayName || msg.user.firstName || "用户"}
                            </span>
                            {msg.user.archetype && (
                              <Badge variant="secondary" className={`text-[10px] h-5 ${archetypeData.color}`}>
                                {msg.user.archetype}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(msg.createdAt!).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm mt-0.5 break-words">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">还没有消息，开始聊天吧！</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入消息..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    data-testid="input-message"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    data-testid="button-send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="participants" className="flex-1 overflow-y-auto p-4 m-0">
          <div className="space-y-3">
            {participants?.map((participant) => {
              const archetypeIcons: Record<string, string> = {
                "火花塞": "🙌",
                "探索者": "🧭",
                "故事家": "🗣️",
                "挑战者": "💪",
                "连接者": "🤗",
                "协调者": "🧘",
                "氛围组": "🕺",
                "肯定者": "🙏",
              };
              const archetypeIcon = participant.archetype && archetypeIcons[participant.archetype] 
                ? archetypeIcons[participant.archetype] 
                : "✨";
              
              return (
                <Card key={participant.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm text-2xl">
                        {archetypeIcon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">
                            {participant.displayName || participant.firstName || "用户"}
                          </h3>
                        </div>
                        
                        {participant.archetype && (
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {participant.archetype}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {isEventPast && (
          <TabsContent value="feedback" className="flex-1 overflow-y-auto p-4 m-0">
            {hasFeedback ? (
              <Card className="border shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">✓</div>
                  <h3 className="font-semibold mb-2">已提交反馈</h3>
                  <p className="text-sm text-muted-foreground">
                    感谢你的反馈！我们会根据你的评价优化匹配算法
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">活动评分</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>整体评分</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            variant={rating >= value ? "default" : "outline"}
                            size="icon"
                            onClick={() => setRating(value)}
                            data-testid={`button-rating-${value}`}
                          >
                            <Star className={`h-4 w-4 ${rating >= value ? "fill-current" : ""}`} />
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>氛围匹配度</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            variant={vibeMatch >= value ? "default" : "outline"}
                            size="icon"
                            onClick={() => setVibeMatch(value)}
                            data-testid={`button-vibe-${value}`}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>能量匹配度</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            variant={energyMatch >= value ? "default" : "outline"}
                            size="icon"
                            onClick={() => setEnergyMatch(value)}
                            data-testid={`button-energy-${value}`}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">你想再次参加吗？</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={wouldAttendAgain ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setWouldAttendAgain(true)}
                        data-testid="button-would-attend-yes"
                      >
                        是的
                      </Button>
                      <Button
                        variant={!wouldAttendAgain ? "destructive" : "outline"}
                        className="flex-1"
                        onClick={() => setWouldAttendAgain(false)}
                        data-testid="button-would-attend-no"
                      >
                        不会
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">你和谁建立了联系？</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {participants?.map((participant) => (
                      <div
                        key={participant.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedConnections.includes(participant.id)
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => toggleConnection(participant.id)}
                        data-testid={`connection-${participant.id}`}
                      >
                        <Avatar className="h-10 w-10">
                          {participant.profileImageUrl ? (
                            <AvatarImage src={participant.profileImageUrl} />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {participant.displayName?.[0] || participant.firstName?.[0] || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">
                          {participant.displayName || participant.firstName || "用户"}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">其他反馈</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="分享你的感受和建议..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      data-testid="textarea-feedback"
                    />
                  </CardContent>
                </Card>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmitFeedback}
                  disabled={submitFeedbackMutation.isPending}
                  data-testid="button-submit-feedback"
                >
                  {submitFeedbackMutation.isPending ? "提交中..." : "提交反馈"}
                </Button>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
