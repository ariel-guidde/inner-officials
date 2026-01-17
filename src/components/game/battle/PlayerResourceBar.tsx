import { Heart, Sparkles, Hourglass, Shield } from 'lucide-react';
import ResourceDisplay from '../shared/ResourceDisplay';

interface PlayerResourceBarProps {
  face: number;
  maxFace: number;
  poise: number;
  patience: number;
  favor: number;
}

export default function PlayerResourceBar({ face, maxFace, poise, patience, favor }: PlayerResourceBarProps) {
  return (
    <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
      <ResourceDisplay
        icon={<Heart className="text-rose-500" />}
        label="Face"
        current={face}
        max={maxFace}
        color="bg-rose-500"
      />
      <ResourceDisplay
        icon={<Shield className="text-blue-500" />}
        label="Composure"
        current={poise}
        max={100}
        color="bg-blue-500"
      />
      <ResourceDisplay
        icon={<Hourglass className="text-amber-500" />}
        label="Patience"
        current={patience}
        max={40}
        color="bg-amber-500"
      />
      <ResourceDisplay
        icon={<Sparkles className="text-purple-500" />}
        label="Favor"
        current={favor}
        max={100}
        color="bg-purple-500"
      />
    </div>
  );
}
