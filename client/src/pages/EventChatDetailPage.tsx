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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Send, Users, Star, Clock, ArrowDown, Check, CheckCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, ChatMessage, EventFeedback } from "@shared/schema";

// Archetype configuration with full descriptions
const archetypeConfig: Record<string, { 
  icon: string; 
  color: string;
  bgColor: string;
  description: string;
}> = {
  "火花塞": { 
    icon: "🙌", 
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    description: "点燃话题的开场高手，能打破沉默，带动气氛"
  },
  "探索者": { 
    icon: "🧭", 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    description: "好奇心驱动，喜欢发现新事物和深入讨论"
  },
  "故事家": { 
    icon: "📖", 
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    description: "善于分享经历，用故事连接人心"
  },
  "挑战者": { 
    icon: "⚡", 
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    description: "思维敏锐，喜欢辩论和挑战传统观点"
  },
  "连接者": { 
    icon: "🤝", 
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    description: "天生的社交桥梁，帮助他人建立联系"
  },
  "协调者": { 
    icon: "🎯", 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    description: "平衡各方意见，确保每个人都被听到"
  },
  "氛围组": { 
    icon: "🎭", 
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    description: "活跃气氛，用幽默和活力感染他人"
  },
  "肯定者": { 
    icon: "🌟", 
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    description: "给予鼓励和支持，让他人感到被认可"
  },
};

// Helper function to group messages by date
function groupMessagesByDate(messages: Array<ChatMessage & { user: User }>) {
  const groups: Array<{ date: string; label: string; messages: Array<ChatMessage & { user: User }> }> = [];
  
  messages.forEach(msg => {
    const msgDate = new Date(msg.createdAt!);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let label: string;
    const dateKey = msgDate.toDateString();
    
    if (msgDate.toDateString() === today.toDateString()) {
      label = "今天";
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      label = "昨天";
    } else {
      label = msgDate.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
    }
    
    const existingGroup = groups.find(g => g.date === dateKey);
    if (existingGroup) {
      existingGroup.messages.push(msg);
    } else {
      groups.push({ date: dateKey, label, messages: [msg] });
    }
  });
  
  return groups;
}

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get current user info
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

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

  // Auto-scroll to bottom with animation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle scroll button visibility
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulate typing indicator (would be real-time in production)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (message.length > 0) {
      setIsTyping(true);
      timeout = setTimeout(() => setIsTyping(false), 1000);
    } else {
      setIsTyping(false);
    }
    return () => clearTimeout(timeout);
  }, [message]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isEventPast = event && event.dateTime && new Date(event.dateTime) < new Date();
  const hasFeedback = !!existingFeedback;

  const messageGroups = groupMessagesByDate(messages);

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

        <TabsContent value="chat" className="flex-1 flex flex-col m-0 relative">
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
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6"
              >
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <TooltipProvider>
                    {messageGroups.map((group, groupIdx) => (
                      <div key={group.date} className="space-y-4">
                        {/* Date divider */}
                        <div className="flex items-center gap-3 py-2">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground font-medium px-3 py-1 bg-muted rounded-full">
                            {group.label}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Messages */}
                        {group.messages.map((msg, idx) => {
                          const isOwnMessage = currentUser?.id === msg.userId;
                          const archetypeData = msg.user.archetype && archetypeConfig[msg.user.archetype]
                            ? archetypeConfig[msg.user.archetype]
                            : { icon: "✨", color: "text-muted-foreground", bgColor: "bg-muted", description: "独特个性" };
                          
                          return (
                            <div
                              key={msg.id}
                              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                                isOwnMessage ? "flex-row-reverse" : ""
                              }`}
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              {/* Avatar (only for others) */}
                              {!isOwnMessage && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-10 w-10 flex-shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                                      {msg.user.profileImageUrl ? (
                                        <AvatarImage src={msg.user.profileImageUrl} />
                                      ) : (
                                        <AvatarFallback className={`${archetypeData.bgColor} text-2xl`}>
                                          {archetypeData.icon}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl">{archetypeData.icon}</span>
                                        <div>
                                          <p className="font-semibold">{msg.user.archetype}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {msg.user.displayName || "用户"}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-sm">{archetypeData.description}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Message bubble */}
                              <div className={`flex-1 min-w-0 max-w-[75%] ${isOwnMessage ? "flex flex-col items-end" : ""}`}>
                                {/* Header */}
                                {!isOwnMessage && (
                                  <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-sm font-medium">
                                      {msg.user.displayName || msg.user.firstName || "用户"}
                                    </span>
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-[10px] h-5 px-1.5 ${archetypeData.color} animate-pulse-glow`}
                                    >
                                      {msg.user.archetype}
                                    </Badge>
                                  </div>
                                )}

                                {/* Message content */}
                                <div 
                                  className={`
                                    group relative px-4 py-2.5 rounded-[18px] shadow-sm
                                    transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                                    ${isOwnMessage 
                                      ? "bg-primary text-primary-foreground rounded-br-[4px]" 
                                      : "bg-muted text-foreground rounded-bl-[4px]"
                                    }
                                  `}
                                >
                                  {isOwnMessage && (
                                    <div className="text-xs opacity-90 mb-1">我</div>
                                  )}
                                  <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                                  
                                  {/* Time */}
                                  <div className={`text-[10px] mt-1 flex items-center gap-1 ${
                                    isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                                  }`}>
                                    <span>
                                      {new Date(msg.createdAt!).toLocaleTimeString("zh-CN", { 
                                        hour: "2-digit", 
                                        minute: "2-digit" 
                                      })}
                                    </span>
                                    {isOwnMessage && (
                                      <CheckCheck className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>

                                {/* Message status (only for own messages) */}
                                {isOwnMessage && (
                                  <div className="text-xs text-muted-foreground px-1 mt-0.5">
                                    已送达
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="h-10 w-10" />
                        <div className="bg-muted px-4 py-3 rounded-[18px] rounded-bl-[4px]">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </TooltipProvider>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">还没有消息，开始聊天吧！</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-20 right-6 z-10 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-4"
                  onClick={scrollToBottom}
                  data-testid="button-scroll-to-bottom"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              )}

              {/* Input area */}
              <div className="border-t p-4 bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入消息..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    data-testid="input-message"
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    data-testid="button-send"
                    className="flex-shrink-0"
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
              const archetypeData = participant.archetype && archetypeConfig[participant.archetype]
                ? archetypeConfig[participant.archetype]
                : { icon: "✨", color: "text-muted-foreground", bgColor: "bg-muted", description: "独特个性" };
              
              return (
                <Card key={participant.id} className="border shadow-sm hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-12 w-12 flex-shrink-0 rounded-full ${archetypeData.bgColor} flex items-center justify-center shadow-sm text-2xl ring-2 ring-transparent hover:ring-primary/20 transition-all`}>
                        {archetypeData.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">
                            {participant.displayName || participant.firstName || "用户"}
                          </h3>
                        </div>
                        
                        {participant.archetype && (
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className={`text-xs ${archetypeData.color} animate-pulse-glow`}>
                              {participant.archetype}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {archetypeData.description}
                            </p>
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
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover-elevate ${
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

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.85;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          will-change: opacity, transform;
        }
      `}</style>
    </div>
  );
}
