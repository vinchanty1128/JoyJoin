import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

interface PoolRegistration {
  id: string;
  poolId: string;
  matchStatus: "pending" | "matched" | "completed";
  assignedGroupId: string | null;
  matchScore: number | null;
  registeredAt: string;
  poolTitle: string;
  poolEventType: string;
  poolCity: string;
  poolDistrict: string;
  poolDateTime: string;
  poolStatus: string;
  budgetRange: string[];
  preferredLanguages: string[];
  socialGoals: string[];
}

interface PoolRegistrationCardProps {
  registration: PoolRegistration;
}

export default function PoolRegistrationCard({ registration }: PoolRegistrationCardProps) {
  const poolDateTime = parseISO(registration.poolDateTime);
  
  const getStatusBadge = () => {
    if (registration.matchStatus === "matched") {
      return <Badge className="bg-green-500 hover:bg-green-600">已匹配</Badge>;
    } else if (registration.matchStatus === "completed") {
      return <Badge variant="secondary">已完成</Badge>;
    } else {
      return <Badge variant="outline">匹配中</Badge>;
    }
  };

  const getMatchInfo = () => {
    if (registration.matchStatus === "matched" && registration.matchScore !== null) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            匹配度: <span className="font-semibold text-foreground">{(registration.matchScore * 100).toFixed(0)}%</span>
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card data-testid={`card-pool-registration-${registration.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{registration.poolTitle}</CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary">{registration.poolEventType}</Badge>
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(poolDateTime, 'MM月dd日 EEEE HH:mm', { locale: zhCN })}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{registration.poolCity} · {registration.poolDistrict}</span>
        </div>

        {getMatchInfo()}

        {registration.matchStatus === "pending" && (
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>AI正在为你寻找最佳匹配...</span>
              </div>
            </div>
          </div>
        )}

        {registration.matchStatus === "matched" && (
          <div className="pt-2">
            <Button 
              className="w-full" 
              size="sm"
              data-testid={`button-view-group-${registration.id}`}
            >
              <Users className="h-4 w-4 mr-2" />
              查看小组成员
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
