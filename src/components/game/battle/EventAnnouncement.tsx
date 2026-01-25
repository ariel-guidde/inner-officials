import { motion, AnimatePresence } from 'framer-motion';
import { GameEvent, GAME_EVENT_TYPE, INTENTION_TYPE } from '../../../types/game';
import { Gavel, Swords, Heart, Hourglass, Sparkles, BookMinus } from 'lucide-react';

interface EventAnnouncementProps {
  event: GameEvent | null;
}

export default function EventAnnouncement({ event }: EventAnnouncementProps) {
  if (!event) return null;

  const isJudge = event.type === GAME_EVENT_TYPE.JUDGE_DECREE;
  const bgColor = isJudge
    ? 'from-amber-900/95 to-amber-950/95'
    : 'from-red-900/95 to-red-950/95';
  const borderColor = isJudge ? 'border-amber-500/50' : 'border-red-500/50';
  const accentColor = isJudge ? 'text-amber-400' : 'text-red-400';

  const getIcon = () => {
    if (isJudge) {
      return <Gavel className="w-8 h-8 text-amber-400" />;
    }
    switch (event.actionType) {
      case INTENTION_TYPE.ATTACK:
        return <Swords className="w-8 h-8 text-red-400" />;
      case INTENTION_TYPE.FAVOR_GAIN:
        return <Sparkles className="w-8 h-8 text-purple-400" />;
      case INTENTION_TYPE.FAVOR_STEAL:
        return <BookMinus className="w-8 h-8 text-amber-400" />;
      case INTENTION_TYPE.STALL:
        return <Hourglass className="w-8 h-8 text-orange-400" />;
      default:
        return <Swords className="w-8 h-8 text-red-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Event Card */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className={`
            relative z-10 min-w-[300px] max-w-md
            bg-gradient-to-b ${bgColor}
            border-2 ${borderColor}
            rounded-2xl p-6 shadow-2xl
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {getIcon()}
            <h2 className={`text-2xl font-bold ${accentColor}`}>
              {isJudge ? 'Judge Decree' : 'Opponent Action'}
            </h2>
          </div>

          {/* Event Name */}
          <div className="text-center mb-3">
            <h3 className="text-xl font-semibold text-white">
              {event.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-center text-stone-300 mb-4">
            {event.description}
          </p>

          {/* Stat Changes */}
          {event.statChanges && (
            <div className="flex justify-center gap-4">
              {event.statChanges.playerFace !== undefined && event.statChanges.playerFace !== 0 && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  event.statChanges.playerFace < 0
                    ? 'bg-red-900/50 text-red-300'
                    : 'bg-green-900/50 text-green-300'
                }`}>
                  <Heart className="w-4 h-4" />
                  <span className="font-mono">
                    {event.statChanges.playerFace > 0 ? '+' : ''}{event.statChanges.playerFace}
                  </span>
                </div>
              )}
              {event.statChanges.playerFavor !== undefined && event.statChanges.playerFavor !== 0 && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  event.statChanges.playerFavor < 0
                    ? 'bg-red-900/50 text-red-300'
                    : 'bg-purple-900/50 text-purple-300'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  <span className="font-mono">
                    {event.statChanges.playerFavor > 0 ? '+' : ''}{event.statChanges.playerFavor}
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
