import AttendeePreviewCard from "./AttendeePreviewCard";
import GroupSummaryCard from "./GroupSummaryCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { AttendeeData } from "@/lib/attendeeAnalytics";

interface MeetYourTableProps {
  attendees: AttendeeData[];
  userInterests?: string[];
}

export default function MeetYourTable({
  attendees,
  userInterests = [],
}: MeetYourTableProps) {
  if (!attendees || attendees.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="section-meet-your-table">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">认识你的桌友</h3>
        <p className="text-sm text-muted-foreground">
          提前了解一起聚会的朋友，减少冷场尴尬
        </p>
      </div>

      <GroupSummaryCard attendees={attendees} />

      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {attendees.map((attendee) => (
            <AttendeePreviewCard
              key={attendee.userId}
              attendee={attendee}
              userInterests={userInterests}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
