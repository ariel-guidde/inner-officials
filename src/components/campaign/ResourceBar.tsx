import { motion } from 'framer-motion';
import { Coins, Shirt, Gem, MessageCircle } from 'lucide-react';
import { CampaignResources } from '../../types/campaign';

interface ResourceBarProps {
  resources: CampaignResources;
}

const RESOURCE_CONFIG = [
  { key: 'money' as const, label: 'Money', Icon: Coins, color: 'text-yellow-400' },
  { key: 'clothing' as const, label: 'Clothing', Icon: Shirt, color: 'text-pink-400' },
  { key: 'jewelry' as const, label: 'Jewelry', Icon: Gem, color: 'text-cyan-400' },
  { key: 'rumors' as const, label: 'Rumors', Icon: MessageCircle, color: 'text-purple-400' },
];

export default function ResourceBar({ resources }: ResourceBarProps) {
  return (
    <div className="flex gap-6 justify-center bg-stone-900/80 backdrop-blur px-6 py-3 rounded-xl border border-stone-700">
      {RESOURCE_CONFIG.map(({ key, label, Icon, color }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2"
          title={label}
        >
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-stone-200 font-medium min-w-[2ch] text-right">
            {resources[key]}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
