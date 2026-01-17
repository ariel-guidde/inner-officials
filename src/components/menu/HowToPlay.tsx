import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface HowToPlayProps {
  onBack: () => void;
}

export default function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 font-serif">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-4xl font-bold text-amber-100">How to Play</h1>
        </div>

        <div className="space-y-8 text-stone-300 leading-relaxed">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Objective</h2>
            <p>
              Win the favor of the judges by reaching 100 Favor, or survive until Patience runs out while maintaining at least 50 Favor. 
              Your opponent seeks to reduce your Face to zero or gain more favor than you.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Resources</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-rose-400">Face</strong> - Your composure. If it reaches zero, you lose. Composure (Poise) defends your Face from attacks.</li>
              <li><strong className="text-amber-400">Patience</strong> - The time limit. When it reaches zero, the judges make their final decision based on Favor.</li>
              <li><strong className="text-purple-400">Favor</strong> - The judge's approval. Reach 100 to win instantly, or have at least 50 when Patience runs out.</li>
              <li><strong className="text-blue-400">Composure (Poise)</strong> - Your defense. Reduces damage from opponent attacks before they hit your Face.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Turn Flow</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>At the start of your turn, draw a hand of cards.</li>
              <li>Play cards from your hand. Each card costs Patience and may cost Face. Cards are removed from your hand immediately.</li>
              <li>When ready, click "End Turn" to proceed.</li>
              <li>Your opponent performs their action (attack, reduce your favor, or stall).</li>
              <li>Your entire hand is discarded.</li>
              <li>If your deck is empty, the discard pile is shuffled into your deck.</li>
              <li>Draw a new hand and begin your next turn.</li>
            </ol>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">The Wuxing Cycle</h2>
            <p className="mb-4">
              The five elements follow a cycle: <strong>Wood → Fire → Earth → Metal → Water → Wood</strong>
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-green-400">Balanced Flow</strong> - Playing the next element in the cycle reduces Patience cost by 1.</li>
              <li><strong className="text-red-400">Chaos Flow</strong> - Playing an element two steps ahead increases Face cost by 10 but grants +5 Favor.</li>
              <li>The Wuxing Compass shows the last played element and indicates which element to play next for Balanced Flow.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Opponent Actions</h2>
            <p className="mb-4">
              Your opponent has three types of intentions:
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-red-400">Attack</strong> - Deals damage to your Face, reduced by your Composure.</li>
              <li><strong className="text-purple-400">Favor Reduction</strong> - Reduces your Favor and may increase their own.</li>
              <li><strong className="text-amber-400">Stall</strong> - Reduces your Patience, speeding up the time limit.</li>
            </ul>
            <p className="mt-4">
              If you reduce the opponent's Face to zero, they become Shocked for 3 turns, giving you a reprieve.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Strategy Tips</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>Plan your element sequence to maximize Balanced Flow bonuses.</li>
              <li>Use Chaos Flow strategically when you need extra Favor and can afford the Face cost.</li>
              <li>Build Composure to protect yourself from opponent attacks.</li>
              <li>Balance aggressive Favor gain with defensive Face protection.</li>
              <li>Watch the opponent's Favor bar - they can also win by reaching 100 Favor.</li>
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
