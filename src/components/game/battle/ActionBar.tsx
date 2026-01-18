import { motion } from 'framer-motion';
import { Hourglass } from 'lucide-react';

interface ActionBarProps {
  onEndTurn: () => void;
  disabled: boolean;
  patienceCost: number;
}

export default function ActionBar({ onEndTurn, disabled, patienceCost }: ActionBarProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onEndTurn}
      disabled={disabled}
      className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
        disabled
          ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
          : 'bg-amber-600 text-white hover:bg-amber-500'
      }`}
    >
      <span>End Turn</span>
      <span className="flex items-center gap-1 text-sm opacity-80">
        <Hourglass className="w-4 h-4" />
        -{patienceCost}
      </span>
    </motion.button>
  );
}
