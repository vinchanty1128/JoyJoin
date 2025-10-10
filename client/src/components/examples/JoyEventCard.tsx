import JoyEventCard from '../JoyEventCard';

export default function JoyEventCardExample() {
  return (
    <div className="max-w-sm p-4">
      <JoyEventCard
        title="High-Energy Taco Run"
        time="7:00 PM"
        area="三里屯"
        price="¥88"
        vibes={["highEnergy", "playful", "social"]}
        spotsLeft={3}
        myFit={92}
        groupSpark="High"
        imageGradient="from-orange-400 via-red-500 to-pink-500"
        socialProof="3 friends-of-friends joined"
      />
    </div>
  );
}
