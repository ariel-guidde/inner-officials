import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  height?: 'sm' | 'md';
}

export default function ProgressBar({ value, max, color, height = 'sm' }: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const heightClass = height === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={`${heightClass} w-full bg-stone-900 rounded-full overflow-hidden border border-white/5`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        className={`h-full ${color}`}
      />
    </div>
  );
}
