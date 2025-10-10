import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, DollarSign, Users, ChevronDown } from "lucide-react";
import VibeChip from "@/components/VibeChip";
import GroupSparkMeter from "@/components/GroupSparkMeter";
import { useState } from "react";

export default function EventDetailPage() {
  const [showSafety, setShowSafety] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 font-semibold">Event Details</h1>
        </div>
      </div>

      <div className={`h-56 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 relative`}>
        <div className="absolute top-4 left-4 flex gap-1.5">
          <VibeChip emoji="⚡" label="High-Energy" gradient="from-orange-400 to-coral-500" />
          <VibeChip emoji="🎈" label="Playful" gradient="from-pink-400 to-rose-400" />
          <VibeChip emoji="🤝" label="Social" gradient="from-violet-400 to-purple-400" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-2xl font-display font-bold">Taco Run & Mini Games</h2>
            
            <p className="text-sm text-muted-foreground">
              Fast-paced games + craft beers. Expect laughs, team rotation, and a friendly host.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">LN</AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <p className="font-medium">Host Luna</p>
                <p className="text-muted-foreground">Energizer & icebreaker pro ⚡</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">When it starts</p>
                <p className="text-muted-foreground">Tonight 7:30 PM</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">Where</p>
                <p className="text-muted-foreground">Sanlitun</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">Price</p>
                <p className="text-muted-foreground">¥88</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">Spots left</p>
                <p className="text-muted-foreground">3 of 8</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <GroupSparkMeter energizers={3} connectors={2} reflectors={3} />

        <Card className="border-0 bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">What to expect</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span className="font-medium text-foreground">7:30</span>
                <span>Warm-Up • Arrive & grab a drink</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">7:45</span>
                <span>Break the Ice • Quick intro games</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">8:00</span>
                <span>Team Switch • Taco challenge rounds</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">9:00</span>
                <span>Wind-Down • Free chat & exchange contacts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0 bg-muted/30 cursor-pointer hover-elevate active-elevate-2 transition-all"
          onClick={() => setShowSafety(!showSafety)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Safety & Comfort</h3>
              <ChevronDown className={`h-4 w-4 transition-transform ${showSafety ? 'rotate-180' : ''}`} />
            </div>
            {showSafety && (
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p>• Wheelchair accessible venue</p>
                <p>• Vegetarian & halal options available</p>
                <p>• Alcohol-free alternatives</p>
                <p>• Quiet zone for breaks</p>
                <p>• Code of conduct enforced</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-primary/5">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs font-medium">Why this matches you:</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">You + 2 Energizers = great momentum</Badge>
              <Badge variant="secondary" className="text-[10px]">Shared: board games, izakaya</Badge>
              <Badge variant="secondary" className="text-[10px]">Balance: 3 high-energy, 4 reflective</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
        <Button variant="outline" className="flex-1" data-testid="button-shortlist">
          Shortlist 3 more
        </Button>
        <Button className="flex-1" data-testid="button-join">
          Join this Vibe
        </Button>
      </div>
    </div>
  );
}
