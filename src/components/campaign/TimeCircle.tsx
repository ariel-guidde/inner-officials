import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset, Moon, BedDouble } from 'lucide-react';
import { TimePeriod, TIME_PERIOD, USABLE_SEGMENTS, getTimePeriodLabel } from '../../types/campaign';

interface TimeCircleProps {
  currentSegment: number;
  segmentsRemaining: number;
  currentPeriod: TimePeriod;
  isNightTime: boolean;
  mustRest: boolean;
  onRestUntilDawn: () => void;
}

const SEGMENT_COLORS = {
  [TIME_PERIOD.EARLY_MORNING]: 'rgb(251, 191, 36)', // amber-400
  [TIME_PERIOD.LATE_MORNING]: 'rgb(250, 204, 21)', // yellow-400
  [TIME_PERIOD.EVENING]: 'rgb(249, 115, 22)', // orange-500
  [TIME_PERIOD.NIGHT]: 'rgb(71, 85, 105)', // slate-500
};

const PERIOD_ICONS = {
  [TIME_PERIOD.EARLY_MORNING]: Sunrise,
  [TIME_PERIOD.LATE_MORNING]: Sun,
  [TIME_PERIOD.EVENING]: Sunset,
  [TIME_PERIOD.NIGHT]: Moon,
};

export default function TimeCircle({
  currentSegment,
  segmentsRemaining,
  currentPeriod,
  isNightTime,
  mustRest,
  onRestUntilDawn,
}: TimeCircleProps) {
  const usedSegments = USABLE_SEGMENTS - segmentsRemaining;
  const Icon = PERIOD_ICONS[currentPeriod];

  // Calculate arc for SVG
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const segmentAngle = circumference / USABLE_SEGMENTS;

  return (
    <div className="bg-stone-900/60 backdrop-blur rounded-xl border border-stone-700 p-4">
      <div className="flex items-center gap-6">
        {/* Time Circle */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgb(41, 37, 36)"
              strokeWidth="8"
            />

            {/* Segment arcs */}
            {Array.from({ length: USABLE_SEGMENTS }).map((_, i) => {
              const isUsed = i < usedSegments;
              const isCurrent = i === usedSegments && !isNightTime;
              const period = i < 2 ? TIME_PERIOD.EARLY_MORNING :
                i < 4 ? TIME_PERIOD.LATE_MORNING : TIME_PERIOD.EVENING;

              return (
                <motion.circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={isUsed ? 'rgb(68, 64, 60)' : SEGMENT_COLORS[period]}
                  strokeWidth="8"
                  strokeDasharray={`${segmentAngle * 0.9} ${circumference}`}
                  strokeDashoffset={-i * segmentAngle - segmentAngle * 0.05}
                  strokeLinecap="round"
                  initial={false}
                  animate={{
                    opacity: isUsed ? 0.3 : isCurrent ? 1 : 0.7,
                    scale: isCurrent ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}

            {/* Night segments (always shown as dark) */}
            {[6, 7].map((i) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={isNightTime && i - 6 < (currentSegment - 6) ? 'rgb(41, 37, 36)' : SEGMENT_COLORS[TIME_PERIOD.NIGHT]}
                strokeWidth="8"
                strokeDasharray={`${segmentAngle * 0.9} ${circumference}`}
                strokeDashoffset={-i * segmentAngle - segmentAngle * 0.05}
                strokeLinecap="round"
                opacity={isNightTime ? 0.8 : 0.4}
              />
            ))}
          </svg>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${isNightTime ? 'bg-slate-800' : 'bg-amber-900/60'}
            `}>
              <Icon className={`w-6 h-6 ${isNightTime ? 'text-slate-400' : 'text-amber-300'}`} />
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="flex-1">
          <div className="text-amber-200 text-lg font-semibold">
            {getTimePeriodLabel(currentPeriod)}
          </div>

          {mustRest ? (
            <div className="text-red-400 text-sm mt-1">
              You must rest until your face is restored.
            </div>
          ) : isNightTime ? (
            <div className="text-slate-400 text-sm mt-1">
              Night has fallen. Time to rest.
            </div>
          ) : (
            <div className="text-stone-400 text-sm mt-1">
              {segmentsRemaining} segment{segmentsRemaining !== 1 ? 's' : ''} remaining today
            </div>
          )}

          {/* Period Legend */}
          <div className="flex gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-stone-500">Morning</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-stone-500">Midday</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-stone-500">Evening</span>
            </div>
          </div>
        </div>

        {/* Rest Button */}
        {(isNightTime || segmentsRemaining === 0 || mustRest) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestUntilDawn}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 rounded-lg text-indigo-200 transition-colors"
          >
            <BedDouble className="w-5 h-5" />
            <span>Rest Until Dawn</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
