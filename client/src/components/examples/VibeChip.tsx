import VibeChip from '../VibeChip';

export default function VibeChipExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <VibeChip emoji="😌" label="Chill" gradient="from-blue-400 to-cyan-400" />
      <VibeChip emoji="🎈" label="Playful" gradient="from-pink-400 to-rose-400" />
      <VibeChip emoji="⚡" label="High-Energy" gradient="from-orange-400 to-coral-500" />
      <VibeChip emoji="🧠" label="Curious" gradient="from-purple-400 to-indigo-400" />
      <VibeChip emoji="🕯️" label="Cozy" gradient="from-amber-400 to-yellow-400" />
    </div>
  );
}
