import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Play, FolderOpen } from 'lucide-react';

interface CampaignMenuProps {
  onBack: () => void;
  onNewCampaign: () => void;
  onContinueCampaign: () => void;
  hasSavedCampaign: boolean;
}

export default function CampaignMenu({
  onBack,
  onNewCampaign,
  onContinueCampaign,
  hasSavedCampaign,
}: CampaignMenuProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center font-serif">
      <div className="text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-amber-100 mb-4">Palace Campaign</h1>
          <p className="text-stone-400 text-lg">Navigate the intrigues of the imperial court</p>
        </motion.div>

        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewCampaign}
            className="flex items-center gap-4 px-8 py-4 bg-amber-600 border border-amber-500 rounded-2xl hover:bg-amber-500 transition-colors group"
          >
            <Plus className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">New Campaign</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={hasSavedCampaign ? { scale: 1.05, x: 10 } : {}}
            whileTap={hasSavedCampaign ? { scale: 0.95 } : {}}
            onClick={hasSavedCampaign ? onContinueCampaign : undefined}
            disabled={!hasSavedCampaign}
            className={`
              flex items-center gap-4 px-8 py-4 border rounded-2xl transition-colors group
              ${hasSavedCampaign
                ? 'bg-stone-900 border-stone-800 hover:border-amber-600 cursor-pointer'
                : 'bg-stone-900/50 border-stone-800/50 cursor-not-allowed opacity-50'
              }
            `}
          >
            <Play className={`w-6 h-6 ${hasSavedCampaign ? 'text-amber-500 group-hover:text-amber-400' : 'text-stone-600'}`} />
            <span className={`text-xl ${hasSavedCampaign ? 'text-stone-200 group-hover:text-amber-200' : 'text-stone-500'}`}>
              Continue
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            disabled
            className="flex items-center gap-4 px-8 py-4 bg-stone-900/50 border border-stone-800/50 rounded-2xl cursor-not-allowed opacity-50"
          >
            <FolderOpen className="w-6 h-6 text-stone-600" />
            <span className="text-xl text-stone-500">Load Campaign</span>
            <span className="text-xs text-stone-600 ml-auto">(Coming Soon)</span>
          </motion.button>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={onBack}
          className="flex items-center gap-2 mx-auto text-stone-500 hover:text-amber-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Main Menu</span>
        </motion.button>
      </div>
    </div>
  );
}
