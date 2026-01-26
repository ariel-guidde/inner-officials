import { motion } from 'framer-motion';
import { Coins, Shirt, Gem, MessageCircle, Heart } from 'lucide-react';
import { CampaignResources } from '../../types/campaign';

interface ResourceBarProps {
  resources: CampaignResources;
  face: number;
  maxFace: number;
}

const RESOURCE_CONFIG = [
  { key: 'money' as const, label: 'Money', Icon: Coins, color: 'text-yellow-400' },
  { key: 'clothing' as const, label: 'Clothing', Icon: Shirt, color: 'text-pink-400' },
  { key: 'jewelry' as const, label: 'Jewelry', Icon: Gem, color: 'text-cyan-400' },
  { key: 'rumors' as const, label: 'Rumors', Icon: MessageCircle, color: 'text-purple-400' },
];

export default function ResourceBar({ resources, face, maxFace }: ResourceBarProps) {
  const facePercent = (face / maxFace) * 100;
  const faceColor = facePercent > 60 ? 'text-green-400' : facePercent > 30 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="flex gap-4 justify-center bg-stone-900/80 backdrop-blur px-4 py-3 rounded-xl border border-stone-700">
      {/* Face display */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 pr-3 border-r border-stone-600"
        title={`Face: ${face}/${maxFace}`}
      >
        <Heart className={`w-5 h-5 ${faceColor}`} />
        <span className={`font-medium ${faceColor}`}>
          {face}
        </span>
      </motion.div>

      {/* Resources */}
      {RESOURCE_CONFIG.map(({ key, label, Icon, color }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (index + 1) * 0.1 }}
          className="flex items-center gap-2"
          title={label}
        >
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-stone-200 font-medium min-w-[2ch] text-right text-sm">
            {resources[key]}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
