import VibeChip from '../VibeChip';

export default function VibeChipExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <VibeChip vibe="chill" />
      <VibeChip vibe="playful" />
      <VibeChip vibe="highEnergy" />
      <VibeChip vibe="curious" />
      <VibeChip vibe="cozy" size="md" />
      <VibeChip vibe="adventurous" size="md" />
    </div>
  );
}
