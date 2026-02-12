import { motion } from 'framer-motion';
import { Heart, TrendingUp } from 'lucide-react';
import { calculateCombatRewards } from '../../lib/combat/modules/victory';
import { CombatResult } from '../../types/game';
import { SPRING_PRESETS, TANG_COLORS } from '../../lib/animations/constants';

export type RewardType = 'heal' | 'standing';

interface RewardSelectionProps {
  combatResult: CombatResult;
  onSelectReward: (reward: RewardType) => void;
}

export default function RewardSelection({
  combatResult,
  onSelectReward,
}: RewardSelectionProps) {
  const rewards = calculateCombatRewards(combatResult);

  const rewardOptions = [
    {
      type: 'heal' as RewardType,
      title: 'Restore Face',
      description: 'Heal your reputation and dignity',
      value: rewards.faceHealing,
      valueLabel: 'Face',
      icon: Heart,
      color: 'rose',
      gradient: 'from-rose-500/20 to-pink-500/20',
      borderColor: 'border-rose-500',
      textColor: 'text-rose-300',
      glowColor: 'shadow-rose-500/50',
    },
    {
      type: 'standing' as RewardType,
      title: 'Gain Favor',
      description: 'Start with advantage in the next debate',
      value: rewards.startingStanding,
      valueLabel: 'Standing',
      icon: TrendingUp,
      color: 'green',
      gradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500',
      textColor: 'text-green-300',
      glowColor: 'shadow-green-500/50',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_PRESETS.bouncy}
        className="bg-stone-900 border border-stone-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, ...SPRING_PRESETS.bouncy }}
            className="text-3xl font-bold mb-2"
            style={{ color: TANG_COLORS.imperialGold }}
          >
            Choose Your Reward
          </motion.h2>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, ...SPRING_PRESETS.smooth }}
            className="text-stone-400"
          >
            Your victory grants you a boon
          </motion.p>
        </div>

        {/* Reward Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewardOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, ...SPRING_PRESETS.bouncy }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectReward(option.type)}
                className={`relative p-6 rounded-xl border-2 ${option.borderColor} bg-gradient-to-br ${option.gradient} backdrop-blur-sm hover:shadow-xl transition-shadow overflow-hidden group`}
              >
                {/* Glow effect on hover */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${option.glowColor}`}
                  style={{ zIndex: -1 }}
                />

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${option.gradient} border ${option.borderColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-8 h-8 ${option.textColor}`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold mb-2 ${option.textColor}`}>
                  {option.title}
                </h3>

                {/* Value */}
                <div className="text-3xl font-bold text-white mb-2">
                  +{option.value}
                  <span className="text-sm text-stone-400 ml-2">{option.valueLabel}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-stone-400">{option.description}</p>

                {/* Decorative corner accents */}
                <div className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 ${option.borderColor}`} />
                <div className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 ${option.borderColor}`} />
              </motion.button>
            );
          })}
        </div>

        {/* Tier Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-sm text-stone-500"
        >
          Rewards based on your final standing (Tier {combatResult.playerTier})
        </motion.div>
      </motion.div>
    </div>
  );
}
