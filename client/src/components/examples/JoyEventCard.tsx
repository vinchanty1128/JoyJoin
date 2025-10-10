import JoyEventCard from '../JoyEventCard';

export default function JoyEventCardExample() {
  return (
    <div className="max-w-sm p-4">
      <JoyEventCard
        title="Taco Run & Mini Games"
        time="7:30 PM"
        area="Sanlitun"
        price="¥88"
        vibes={[
          { emoji: "⚡", label: "High-Energy", gradient: "from-orange-400 to-coral-500" },
          { emoji: "🎈", label: "Playful", gradient: "from-pink-400 to-rose-400" },
          { emoji: "🤝", label: "Social", gradient: "from-violet-400 to-purple-400" }
        ]}
        spotsLeft={3}
        myFit={92}
        groupSpark="High"
        imageGradient="from-orange-400 via-red-400 to-pink-500"
        socialProof="3 friends-of-friends joined"
      />
    </div>
  );
}
