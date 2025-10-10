import { Badge } from "@/components/ui/badge";

interface VibeChipProps {
  emoji: string;
  label: string;
  gradient?: string;
}

export default function VibeChip({ emoji, label, gradient }: VibeChipProps) {
  return (
    <Badge 
      className={`
        rounded-full px-2.5 py-1 text-xs font-medium gap-1
        ${gradient ? `bg-gradient-to-r ${gradient} text-white border-0` : ''}
        hover-elevate active-elevate-2 transition-all
      `}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </Badge>
  );
}
