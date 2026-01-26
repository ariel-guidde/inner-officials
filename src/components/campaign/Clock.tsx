import { motion } from 'framer-motion';
import { Sun, Sunrise, Moon, CloudSun } from 'lucide-react';
import { getTimeOfDay, getTimeLabel, formatHour, TIME_OF_DAY, TimeOfDay } from '../../types/campaign';

interface ClockProps {
  currentHour: number;
  hoursRemaining: number;
  onSkipDay: () => void;
}

function getTimeIcon(period: TimeOfDay) {
  switch (period) {
    case TIME_OF_DAY.EARLY_MORNING:
      return <Sunrise className="w-6 h-6 text-orange-300" />;
    case TIME_OF_DAY.MORNING:
      return <Sun className="w-6 h-6 text-yellow-300" />;
    case TIME_OF_DAY.MIDDAY:
      return <Sun className="w-6 h-6 text-yellow-400" />;
    case TIME_OF_DAY.AFTERNOON:
      return <CloudSun className="w-6 h-6 text-orange-400" />;
    case TIME_OF_DAY.EVENING:
      return <Sunrise className="w-6 h-6 text-orange-500 rotate-180" />;
    case TIME_OF_DAY.NIGHT:
      return <Moon className="w-6 h-6 text-blue-300" />;
  }
}

function getTimeBgColor(period: TimeOfDay): string {
  switch (period) {
    case TIME_OF_DAY.EARLY_MORNING:
      return 'from-orange-900/40 to-yellow-900/20';
    case TIME_OF_DAY.MORNING:
      return 'from-yellow-900/30 to-amber-900/20';
    case TIME_OF_DAY.MIDDAY:
      return 'from-yellow-900/40 to-orange-900/20';
    case TIME_OF_DAY.AFTERNOON:
      return 'from-orange-900/30 to-red-900/20';
    case TIME_OF_DAY.EVENING:
      return 'from-orange-900/40 to-purple-900/30';
    case TIME_OF_DAY.NIGHT:
      return 'from-blue-900/40 to-purple-900/40';
  }
}

export default function Clock({ currentHour, hoursRemaining, onSkipDay }: ClockProps) {
  const period = getTimeOfDay(currentHour);
  const timeLabel = getTimeLabel(currentHour);
  const bgGradient = getTimeBgColor(period);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${bgGradient} backdrop-blur rounded-xl border border-stone-700 p-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: period === TIME_OF_DAY.NIGHT ? 0 : [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {getTimeIcon(period)}
          </motion.div>
          <div>
            <div className="text-amber-100 font-semibold text-lg">{timeLabel}</div>
            <div className="text-stone-400 text-sm">{formatHour(currentHour)}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-stone-400 text-sm">Hours remaining</div>
          <div className="text-amber-200 font-bold text-xl">{hoursRemaining}h</div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSkipDay}
          className="ml-4 px-4 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-lg text-stone-300 text-sm transition-colors"
        >
          Rest Until Dawn
        </motion.button>
      </div>

      {/* Time progress bar */}
      <div className="mt-3 h-2 bg-stone-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentHour - 5) / 12) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-stone-500">
        <span>5:00</span>
        <span>11:00</span>
        <span>17:00</span>
      </div>
    </motion.div>
  );
}
