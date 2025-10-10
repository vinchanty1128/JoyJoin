import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface VibePillProps {
  icon?: LucideIcon;
  label: string;
  variant?: "default" | "secondary" | "outline";
}

export default function VibePill({ icon: Icon, label, variant = "secondary" }: VibePillProps) {
  return (
    <Badge variant={variant} className="rounded-full px-3 py-1 text-xs font-medium gap-1.5">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
