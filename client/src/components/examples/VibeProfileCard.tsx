import VibeProfileCard from '../VibeProfileCard';

export default function VibeProfileCardExample() {
  return (
    <div className="max-w-md p-4">
      <VibeProfileCard
        name="Alex Rivera"
        initials="AR"
        vibes={["Coffee Lover", "Introvert", "Creative", "Book Worm", "Night Owl"]}
        eventsAttended={12}
        matchesMade={8}
      />
    </div>
  );
}
