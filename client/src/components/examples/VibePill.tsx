import VibePill from '../VibePill';
import { Coffee, Music, Gamepad2 } from 'lucide-react';

export default function VibePillExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <VibePill icon={Coffee} label="Coffee & Conversation" />
      <VibePill icon={Music} label="Music Lovers" />
      <VibePill icon={Gamepad2} label="Board Games" />
      <VibePill label="Chill Vibes" variant="outline" />
    </div>
  );
}
