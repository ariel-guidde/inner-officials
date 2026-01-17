import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ProgressBar from '../shared/ProgressBar';
import { Intention } from '../../../types/game';

interface OpponentPanelProps {
  name: string;
  face: number;
  maxFace: number;
  favor: number;
  isShocked: number;
  currentIntention: Intention | null;
}

export default function OpponentPanel({
  name,
  face,
  maxFace,
  favor,
  isShocked,
  currentIntention,
}: OpponentPanelProps) {
  return (
    <div className="max-w-2xl mx-auto text-center mt-8 mb-16 p-8 bg-stone-900/40 border border-stone-800 rounded-3xl backdrop-blur-md">
      <h2 className="text-3xl text-amber-100 mb-4">{name}</h2>

      {/* Opponent Face */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="text-sm uppercase tracking-widest text-stone-500">Composure</div>
        <div className="text-xl font-mono text-rose-400">
          {face} / {maxFace}
        </div>
      </div>

      {/* Opponent Favor */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-tighter text-stone-400 mb-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Opponent Favor</span>
          <span className="ml-auto font-mono text-stone-200">{favor}/100</span>
        </div>
        <ProgressBar value={favor} max={100} color="bg-purple-500" height="md" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIntention?.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-block px-6 py-2 rounded-full border ${
            isShocked > 0
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-red-500/50 text-red-400 bg-red-500/5'
          }`}
        >
          {isShocked > 0 ? 'Shocked: Stammering...' : `Intention: ${currentIntention?.name}`}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
