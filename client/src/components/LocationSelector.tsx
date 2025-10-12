import { MapPin, ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface LocationSelectorProps {
  selectedCity: "香港" | "深圳";
  onCityChange: (city: "香港" | "深圳") => void;
}

const cityConfig = {
  "深圳": {
    icon: "🏙️",
    label: "深圳",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30"
  },
  "香港": {
    icon: "🇭🇰",
    label: "香港",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30"
  }
};

export default function LocationSelector({ selectedCity, onCityChange }: LocationSelectorProps) {
  const config = cityConfig[selectedCity];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`gap-2 px-4 h-10 font-semibold text-base border-2 ${config.bgColor} hover-elevate active-elevate-2 shadow-sm`}
          data-testid="button-location-selector"
        >
          <span className="text-xl">{config.icon}</span>
          <span className={`font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
            {config.label}
          </span>
          <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48" data-testid="menu-location-options">
        <DropdownMenuItem 
          onClick={() => onCityChange("深圳")}
          className="gap-3 cursor-pointer p-3 hover-elevate"
          data-testid="menu-item-shenzhen"
        >
          <span className="text-2xl">{cityConfig["深圳"].icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-base">深圳</div>
            <div className="text-xs text-muted-foreground">试点城市</div>
          </div>
          {selectedCity === "深圳" && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              当前
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onCityChange("香港")}
          className="gap-3 cursor-pointer p-3 hover-elevate"
          data-testid="menu-item-hongkong"
        >
          <span className="text-2xl">{cityConfig["香港"].icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-base">香港</div>
            <div className="text-xs text-muted-foreground">特别行政区</div>
          </div>
          {selectedCity === "香港" && (
            <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
              当前
            </Badge>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
