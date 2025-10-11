import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import BlindBoxInfoSheet from "./BlindBoxInfoSheet";

type PriceTier = "100元以下" | "100-200" | "200-300" | "300-500" | "500+";

interface BlindBoxEventCardProps {
  id: string;
  date: string;
  time: string;
  eventType: "饭局" | "酒局";
  area: string;
  mysteryTitle: string;
  priceTier?: PriceTier;
  isAA?: boolean;
}

export default function BlindBoxEventCard({
  id,
  date,
  time,
  eventType,
  area,
  mysteryTitle,
  priceTier,
  isAA
}: BlindBoxEventCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Card className="hover-elevate active-elevate-2 transition-all border shadow-sm" data-testid={`card-blindbox-${id}`}>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg text-muted-foreground/60 mb-2">
                {mysteryTitle}
              </h3>
              
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{date} {time}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 rounded-md"
                  data-testid={`badge-event-type-${eventType}`}
                >
                  {eventType}
                </Badge>
              </div>
            </div>
            
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{area}</span>
          </div>

          {(priceTier || isAA) && (
            <div className="text-xs text-muted-foreground">
              {priceTier && <span>¥{priceTier}</span>}
              {isAA && <span className="ml-2">• AA制</span>}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button 
              className="flex-1" 
              size="default"
              data-testid={`button-join-${id}`}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              立即参与
            </Button>
            <Button 
              variant="outline" 
              size="default"
              onClick={() => setSheetOpen(true)}
              data-testid={`button-learn-more-${id}`}
            >
              了解更多
            </Button>
          </div>
        </div>
      </Card>

      <BlindBoxInfoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        eventData={{
          date,
          time,
          eventType,
          area,
          priceTier,
          isAA
        }}
      />
    </>
  );
}
