import GroupSummaryCard from "./GroupSummaryCard";
import StackedAttendeeCards from "./StackedAttendeeCards";
import { generateSparkPredictions, type AttendeeData } from "@/lib/attendeeAnalytics";

interface MeetYourTableProps {
  attendees: AttendeeData[];
  userInterests?: string[];
  userEducationLevel?: string;
  userIndustry?: string;
  userAgeBand?: string;
  userRelationshipStatus?: string;
  userStudyLocale?: string;
  userSeniority?: string;
}

export default function MeetYourTable({
  attendees,
  userInterests = [],
  userEducationLevel,
  userIndustry,
  userAgeBand,
  userRelationshipStatus,
  userStudyLocale,
  userSeniority,
}: MeetYourTableProps) {
  if (!attendees || attendees.length === 0) {
    return null;
  }

  const userContext = {
    userInterests,
    userEducationLevel,
    userIndustry,
    userAgeBand,
    userRelationshipStatus,
    userStudyLocale,
    userSeniority,
  };

  const connectionPoints: Record<string, Array<{ label: string; type: string }>> = {};
  
  attendees.forEach((attendee) => {
    const predictions = generateSparkPredictions(userContext, attendee);
    connectionPoints[attendee.userId] = predictions.map(label => ({
      label,
      type: 'connection'
    }));
  });

  return (
    <div className="space-y-4" data-testid="section-meet-your-table">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">认识你的桌友</h3>
        <p className="text-sm text-muted-foreground">
          提前了解一起聚会的朋友，减少冷场尴尬
        </p>
      </div>

      <GroupSummaryCard attendees={attendees} />

      <div className="py-4">
        <StackedAttendeeCards 
          attendees={attendees} 
          connectionPoints={connectionPoints}
        />
      </div>
    </div>
  );
}
