import { motion } from 'framer-motion';

interface ActionBarProps {
  onEndTurn: () => void;
  disabled: boolean;
}

export default function ActionBar({ onEndTurn, disabled }: ActionBarProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onEndTurn}
      disabled={disabled}
      className={`px-6 py-3 rounded-full font-bold transition-all ${
        disabled
          ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
          : 'bg-amber-600 text-white hover:bg-amber-500'
      }`}
    >
      End Turn
    </motion.button>
  );
}
