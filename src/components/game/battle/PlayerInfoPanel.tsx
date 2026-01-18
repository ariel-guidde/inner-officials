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
    <div className="panel p-4 w-48">
      <div className="text-label-small mb-3">Your Status</div>

      {/* Face */}
      <div className="mb-3">
        <div className="stat-row mb-1">
          <div className="stat-row-label">
            <Heart className="w-4 h-4 icon-face" />
            <span>Face</span>
          </div>
          <span className="text-sm font-mono text-stone-200">{face}/{maxFace}</span>
        </div>
        <div className="progress-bar-lg">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${facePercent}%` }}
            className={`h-full ${faceColor} transition-colors`}
          />
        </div>
      </div>

      {/* Poise/Composure */}
      <div>
        <div className="stat-row mb-1">
          <div className="stat-row-label">
            <Shield className="w-4 h-4 icon-poise" />
            <span>Composure</span>
          </div>
          <span className="text-sm font-mono text-stone-200">{poise}</span>
        </div>
        {poise > 0 && (
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, poise)}%` }}
              className="h-full bg-cyan-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
