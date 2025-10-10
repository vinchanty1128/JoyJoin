import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Users, Shield, Heart } from "lucide-react";
import VibeChip from "@/components/VibeChip";
import EnergyBalanceMeter from "@/components/EnergyBalanceMeter";
import { VIBE_TYPES, VibeType } from "@/lib/vibes";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

//todo: remove mock functionality
const event = {
  title: "High-Energy Taco Run",
  primaryVibe: "highEnergy" as VibeType,
  vibes: ["highEnergy", "playful", "social"] as VibeType[],
  oneLiner: "Fast-paced games + craft beers",
  pitch: "Laughs, bites, and mini challenges. Come as you are.",
  host: {
    name: "Luna",
    initials: "LN",
    role: "Energizer & icebreaker pro"
  },
  time: "今晚 7:00 PM",
  location: "三里屯 Taco Bar",
  price: "¥88",
  spotsLeft: 2,
  attendees: [
    { name: "Sarah", initials: "SJ", tags: "Board games · Foodie" },
    { name: "Mike", initials: "MC", tags: "Music · EN/CN bilingual" },
    { name: "Emma", initials: "ED", tags: "Tech · Coffee lover" }
  ],
  energyBalance: { energizers: 2, connectors: 3, reflectors: 3 },
  timeline: [
    { time: "7:00", label: "Warm-Up", desc: "Drinks & intros" },
    { time: "7:20", label: "Break the Ice", desc: "Fun challenge" },
    { time: "8:00", label: "Team Switch", desc: "New pairings" },
    { time: "9:00", label: "Wind-Down", desc: "Chill & connect" }
  ],
  matchReasons: [
    "You + 2 Energizers = great momentum",
    "Shared: tacos, games, evening vibes",
    "Balance: 2 high-energy, 3 reflective"
  ]
};

export default function EventDetailPage() {
  const vibeGradient = VIBE_TYPES[event.primaryVibe].gradient;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className={`h-48 bg-gradient-to-br ${vibeGradient} relative`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm"
          data-testid="button-favorite"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex gap-1.5">
              {event.vibes.map((vibe, i) => (
                <VibeChip key={i} vibe={vibe} size="md" />
              ))}
            </div>
            
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">{event.oneLiner}</p>
            <p className="text-sm">{event.pitch}</p>

            <div className="flex items-center gap-2 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {event.host.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                Host {event.host.name} · {event.host.role}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-semibold">活动时间</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.spotsLeft} spots left · {event.price}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-semibold">Tonight's Mix</h3>
            <EnergyBalanceMeter {...event.energyBalance} />
            
            <div className="pt-2 space-y-2">
              {event.attendees.map((attendee, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-xs">
                      {attendee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{attendee.tags}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-semibold">Why this match?</h3>
            <div className="flex flex-wrap gap-2">
              {event.matchReasons.map((reason, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-2">
            <h3 className="font-semibold">Run of Show</h3>
            <div className="space-y-3">
              {event.timeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-sm font-medium text-muted-foreground w-12">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Collapsible>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Safety & Comfort</span>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 text-sm text-muted-foreground space-y-2">
                <p>✓ Wheelchair accessible</p>
                <p>✓ Alcohol-free options</p>
                <p>✓ Quiet spaces available</p>
                <p>✓ Code of conduct enforced</p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-2 safe-area-pb">
        <Button className="w-full" size="lg" data-testid="button-join">
          Join this Vibe
        </Button>
        <Button variant="outline" className="w-full" size="lg" data-testid="button-shortlist">
          Shortlist 3 more like this
        </Button>
      </div>
    </div>
  );
}
