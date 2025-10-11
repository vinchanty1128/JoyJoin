import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LocationSelectorProps {
  selectedCity: "香港" | "深圳";
  onCityChange: (city: "香港" | "深圳") => void;
}

export default function LocationSelector({ selectedCity, onCityChange }: LocationSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-1 px-2 h-8 hover-elevate active-elevate-2"
          data-testid="button-location-selector"
        >
          <MapPin className="h-4 w-4" />
          <span className="font-medium">{selectedCity}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" data-testid="menu-location-options">
        <DropdownMenuItem 
          onClick={() => onCityChange("深圳")}
          className="gap-2 cursor-pointer"
          data-testid="menu-item-shenzhen"
        >
          <MapPin className="h-4 w-4" />
          <span>深圳</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onCityChange("香港")}
          className="gap-2 cursor-pointer"
          data-testid="menu-item-hongkong"
        >
          <MapPin className="h-4 w-4" />
          <span>香港</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
