import AttendeePreviewCard from "./AttendeePreviewCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AttendeeData {
  userId: string;
  displayName: string;
  archetype?: string;
  topInterests?: string[];
  ageBand?: string;
  industry?: string;
  ageVisible?: boolean;
  industryVisible?: boolean;
}

interface MeetYourTableProps {
  attendees: AttendeeData[];
}

export default function MeetYourTable({ attendees }: MeetYourTableProps) {
  if (!attendees || attendees.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3" data-testid="section-meet-your-table">
      <h3 className="text-lg font-semibold">认识你的桌友</h3>
      <p className="text-sm text-muted-foreground">
        提前了解一起聚会的朋友，减少冷场尴尬
      </p>
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {attendees.map((attendee) => (
            <AttendeePreviewCard key={attendee.userId} attendee={attendee} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
