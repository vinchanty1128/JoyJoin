import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame } from "lucide-react";

interface DualMatchScoreProps {
  myFit: number;
  groupSpark: "High" | "Medium" | "Low";
  size?: "sm" | "md";
}

export default function DualMatchScore({ myFit, groupSpark, size = "sm" }: DualMatchScoreProps) {
  const sparkColor = {
    High: "text-orange-500",
    Medium: "text-yellow-500", 
    Low: "text-gray-400"
  }[groupSpark];

  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  
  return (
    <Badge className={`${sizeClass} bg-background/90 backdrop-blur-sm text-foreground border-0 font-medium`}>
      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
      {myFit}%
      <span className="mx-1">|</span>
      <Flame className={`h-2.5 w-2.5 mr-0.5 ${sparkColor}`} />
      {groupSpark}
    </Badge>
  );
}
