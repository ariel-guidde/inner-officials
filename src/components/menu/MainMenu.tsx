import { motion } from 'framer-motion';
import { BookOpen, Swords, Scroll, Settings } from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: 'deck' | 'how-to-play' | 'settings' | 'battle') => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center font-serif">
      <div className="text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold text-amber-100 mb-4">Inner Officials</h1>
          <p className="text-stone-400 text-xl">The Art of Courtly Debate</p>
        </motion.div>

        <div className="flex flex-col gap-6 max-w-md mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('deck')}
            className="flex items-center gap-4 px-8 py-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-amber-600 transition-colors group"
          >
            <BookOpen className="w-6 h-6 text-amber-500 group-hover:text-amber-400" />
            <span className="text-xl text-stone-200 group-hover:text-amber-200">Deck</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('how-to-play')}
            className="flex items-center gap-4 px-8 py-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-amber-600 transition-colors group"
          >
            <Scroll className="w-6 h-6 text-amber-500 group-hover:text-amber-400" />
            <span className="text-xl text-stone-200 group-hover:text-amber-200">How to Play</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-4 px-8 py-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-amber-600 transition-colors group"
          >
            <Settings className="w-6 h-6 text-amber-500 group-hover:text-amber-400" />
            <span className="text-xl text-stone-200 group-hover:text-amber-200">Settings</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('battle')}
            className="flex items-center gap-4 px-8 py-4 bg-amber-600 border border-amber-500 rounded-2xl hover:bg-amber-500 transition-colors group"
          >
            <Swords className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">Battle</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
