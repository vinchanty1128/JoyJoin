import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Star } from "lucide-react";

interface UserEnergyBadgeProps {
  level: number;
  role: "energizer" | "connector" | "reflector";
}

const levelConfig = {
  1: { label: "新人", icon: Star, color: "text-slate-500" },
  2: { label: "活跃", icon: Zap, color: "text-blue-500" },
  3: { label: "达人", icon: Trophy, color: "text-purple-500" },
  4: { label: "专家", icon: Trophy, color: "text-orange-500" },
  5: { label: "大师", icon: Trophy, color: "text-amber-500" }
};

const roleColors = {
  energizer: "from-orange-400 to-red-500",
  connector: "from-purple-400 to-indigo-400",
  reflector: "from-emerald-400 to-teal-400"
};

export default function UserEnergyBadge({ level, role }: UserEnergyBadgeProps) {
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig[1];
  const Icon = config.icon;
  const gradient = roleColors[role];

  return (
    <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 gap-1.5`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-semibold">{config.label} Lv.{level}</span>
    </Badge>
  );
}
