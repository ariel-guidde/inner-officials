import { motion } from 'framer-motion';
import { Heart, Shield } from 'lucide-react';
import { PLAYER_IMAGE } from '../../../lib/characterImages';

interface PlayerInfoPanelProps {
  face: number;
  maxFace: number;
  poise: number;
}

export default function PlayerInfoPanel({ face, maxFace, poise }: PlayerInfoPanelProps) {
  const facePercent = (face / maxFace) * 100;
  const faceColor = facePercent > 50 ? 'bg-rose-500' : facePercent > 25 ? 'bg-orange-500' : 'bg-red-600';

  return (
    <div data-player-panel className="flex flex-col items-start gap-2">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 bg-stone-900/60 border border-stone-700 rounded-xl px-4 py-2 backdrop-blur-sm">
        {/* Face */}
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 icon-face shrink-0" />
          <div className="w-24">
            <div className="progress-bar-lg">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${facePercent}%` }}
                className={`h-full ${faceColor} transition-colors`}
              />
            </div>
          </div>
          <span className="text-sm font-mono text-stone-200 w-12 text-right">{face}/{maxFace}</span>
        </div>

        {/* Composure */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 icon-poise shrink-0" />
          <span className="text-sm font-mono text-stone-200">{poise}</span>
        </div>
      </div>

      {/* Player Character Portrait - Below the bar */}
      <div className="w-48 h-64 rounded-xl overflow-hidden shadow-2xl ml-4">
        <img
          src={PLAYER_IMAGE}
          alt="Player Character"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}
