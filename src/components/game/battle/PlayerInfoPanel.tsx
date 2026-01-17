import { motion } from 'framer-motion';
import { Heart, Shield } from 'lucide-react';

interface PlayerInfoPanelProps {
  face: number;
  maxFace: number;
  poise: number;
}

export default function PlayerInfoPanel({ face, maxFace, poise }: PlayerInfoPanelProps) {
  const facePercent = (face / maxFace) * 100;
  const faceColor = facePercent > 50 ? 'bg-rose-500' : facePercent > 25 ? 'bg-orange-500' : 'bg-red-600';

  return (
    <div className="bg-stone-900/80 border border-stone-700 rounded-xl p-4 backdrop-blur-sm w-48">
      <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">Your Status</div>

      {/* Face */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-stone-400">Face</span>
          </div>
          <span className="text-sm font-mono text-stone-200">{face}/{maxFace}</span>
        </div>
        <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${facePercent}%` }}
            className={`h-full ${faceColor} transition-colors`}
          />
        </div>
      </div>

      {/* Poise/Composure */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-stone-400">Composure</span>
          </div>
          <span className="text-sm font-mono text-stone-200">{poise}</span>
        </div>
        {poise > 0 && (
          <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, poise)}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
