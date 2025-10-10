import DualMatchScore from '../DualMatchScore';

export default function DualMatchScoreExample() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <DualMatchScore myFit={92} groupSpark="High" size="sm" />
      <DualMatchScore myFit={85} groupSpark="Medium" size="md" />
      <DualMatchScore myFit={78} groupSpark="Low" size="md" />
    </div>
  );
}
