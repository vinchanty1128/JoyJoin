import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, DirectMessage } from "@shared/schema";

type DirectThreadWithDetails = {
  id: string;
  user1Id: string;
  user2Id: string;
  eventId: string;
  connectionPointTypes: string[] | null;
  createdAt: Date;
  otherUser: {
    id: string;
    displayName: string | null;
    archetype: string | null;
  };
  event: {
    title: string;
    dateTime: Date;
  };
};

export default function DirectChatPage() {
  const { threadId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: thread, isLoading: threadLoading } = useQuery<DirectThreadWithDetails>({
    queryKey: ["/api/direct-messages", threadId],
    select: (data: any) => data.thread,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Array<DirectMessage & { user: User }>>({
    queryKey: ["/api/direct-messages", threadId, "messages"],
    select: (data: any) => data.messages,
    refetchInterval: 3000,
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: string) => {
      return await apiRequest("POST", `/api/direct-messages/${threadId}`, { message: msg });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages", threadId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages"] });
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConnectionPointLabel = (type: string) => {
    const labels: Record<string, string> = {
      interests: "共同兴趣",
      topics_happy: "话题契合",
      archetype: "性格互补",
      debate_comfort: "交流风格",
      life_stage: "人生阶段",
      languages: "语言相通",
      communication_style: "沟通方式",
      gender: "性别相同",
      family_status: "家庭状况",
      overseas_region: "海外背景",
      hometown: "老乡",
    };
    return labels[type] || type;
  };

  if (threadLoading || !thread) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/chats")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {thread.otherUser.displayName?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">
                {thread.otherUser.displayName || "用户"}
              </h1>
              {thread.otherUser.archetype && (
                <p className="text-xs text-muted-foreground">
                  {thread.otherUser.archetype}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Connection Points Banner */}
        {thread.connectionPointTypes && thread.connectionPointTypes.length > 0 && (
          <div className="px-4 pb-3">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-primary mb-1">
                      你们的契合点
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {thread.connectionPointTypes.map((type, index) => (
                        <Badge 
                          key={index}
                          variant="secondary" 
                          className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20"
                        >
                          {getConnectionPointLabel(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Event Context */}
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground">
            来自活动：{thread.event.title}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">加载消息中...</p>
            </div>
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === currentUser?.id;
            
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                data-testid={`message-${msg.id}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={isCurrentUser ? "bg-primary/10 text-primary" : "bg-muted"}>
                    {msg.user.displayName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[75%] ${isCurrentUser ? "flex flex-col items-end" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              还没有消息，开始聊天吧！
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="icon"
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
