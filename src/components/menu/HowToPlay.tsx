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
              Advance through Standing tiers to surpass your opponent in the eyes of the judge. When Patience runs out, the side with the higher tier wins.
              If your Face reaches zero, you lose immediately. Break your opponent's composure to gain the upper hand.
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
              <li><strong className="text-amber-400">Patience</strong> - The shared time limit. Playing cards and ending turns costs Patience. When it reaches zero, the judge makes a final decision based on Standing tiers.</li>
              <li><strong className="text-purple-400">Standing</strong> - Your reputation with the judge. Gain Standing to advance through tiers. Each tier requires a set amount of Standing to complete. Your tier at the end of the debate determines victory.</li>
              <li><strong className="text-blue-400">Composure (Poise)</strong> - Your defense. Absorbs damage from opponent attacks before it hits your Face. Resets to zero at the end of each turn.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Standing & Tiers</h2>
            <p className="mb-4">
              Standing is tracked as progress through a series of tiers defined by the judge. Each tier requires a certain amount of Standing to complete.
              When you gain enough Standing, you advance to the next tier.
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li>Each judge has a unique tier structure with different requirements and names.</li>
              <li>When Patience runs out, the player must have a <strong>strictly higher</strong> tier than all opponents to win.</li>
              <li>Ties go to the opponent — you must decisively outperform them.</li>
              <li>Standing can also be damaged by opponent actions, potentially dropping you down tiers.</li>
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
              <li>Your opponent performs their action (attack, gain standing, damage your standing, or stall).</li>
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
            <p className="mb-4">
              The relationship between the last played element and your current card determines the flow type:
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-green-400">Balanced Flow</strong> (next in cycle) - Reduces Patience cost by 1.</li>
              <li><strong className="text-stone-400">Neutral Flow</strong> (same element or first card) - No change to costs.</li>
              <li><strong className="text-orange-400">Dissonant Flow</strong> (3 or 4 steps ahead) - Increases Patience cost by 1 and Face cost by 1.</li>
              <li><strong className="text-red-400">Chaos Flow</strong> (2 steps ahead) - Increases Patience cost by 2 and Face cost by 2, but effect values are multiplied by <strong>1.5x</strong> (rounded down).</li>
            </ul>
            <p className="mt-4 text-stone-400">
              The Wuxing Compass shows the last played element and indicates which element to play next for Balanced Flow.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">The Judge</h2>
            <p className="mb-4">
              Each battle is overseen by a judge who modifies the rules during combat. Judges issue decrees that change the game as Patience is spent.
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-amber-300">Element Taxes</strong> - Certain elements may cost extra Patience.</li>
              <li><strong className="text-amber-300">Damage Modifiers</strong> - Opponent attacks may deal more or less damage.</li>
              <li><strong className="text-amber-300">Standing Modifiers</strong> - Standing gains may be multiplied up or down.</li>
              <li><strong className="text-amber-300">End Turn Costs</strong> - The Patience cost of ending your turn may increase.</li>
            </ul>
            <p className="mt-4 text-stone-400">
              Watch for judge announcements — adapting your strategy to the current decrees is key to winning.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Opponent Actions</h2>
            <p className="mb-4">
              Your opponent has four types of intentions:
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-red-400">Attack</strong> - Deals damage to your Face, reduced by your Composure.</li>
              <li><strong className="text-purple-400">Standing Gain</strong> - The opponent gains Standing with the judge.</li>
              <li><strong className="text-yellow-400">Standing Damage</strong> - Damages your Standing, potentially dropping your tier.</li>
              <li><strong className="text-amber-400">Stall</strong> - Drains Patience, speeding up the time limit.</li>
            </ul>
            <p className="mt-4">
              If you reduce an opponent's Face to zero, they become <strong className="text-rose-300">Flustered</strong> — their Face resets to half,
              and their current intention is replaced with a harmless flustered action, giving you a reprieve.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Status Effects</h2>
            <p className="mb-4">
              Cards and core arguments can apply status effects — buffs or debuffs that persist across turns.
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li>Statuses have a <strong>duration</strong> (number of turns) or are <strong>permanent</strong>.</li>
              <li>Some statuses trigger effects at the start or end of your turn (healing, poise gain, standing gain).</li>
              <li>Others provide passive modifiers (cost reduction, damage resistance, standing multipliers).</li>
              <li>Some have a limited number of <strong>trigger charges</strong> — they fire a set number of times, then expire.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Elements & Cards</h2>
            <p className="mb-4">Each element specializes in different strategies:</p>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-green-400">Wood</strong> - Healing and timed effects. Cards like Growing Roots and Regeneration provide sustained benefits over multiple turns.</li>
              <li><strong className="text-red-400">Fire</strong> - High cost, high reward. Powerful shame attacks and burn mechanics that remove cards from the game permanently.</li>
              <li><strong className="text-yellow-400">Earth</strong> - Poise and standing. The best source of Composure to defend against attacks, plus steady standing gain.</li>
              <li><strong className="text-slate-300">Metal</strong> - Defense and information. Reveal opponent intentions and gain standing through precision plays.</li>
              <li><strong className="text-blue-400">Water</strong> - Card draw and deck manipulation. Control the pace of the debate by cycling through your deck faster.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-4">Strategy Tips</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>Plan your element sequence to maximize Balanced Flow bonuses and avoid Dissonant penalties.</li>
              <li>Use Chaos Flow strategically when the 1.5x effect boost is worth the extra cost.</li>
              <li>Build Composure with Earth cards before the opponent attacks to absorb damage.</li>
              <li>Watch the judge's decrees and adapt — if an element is taxed, pivot to others.</li>
              <li>Focus on advancing tiers early. A higher tier at the end wins, even if Patience runs out.</li>
              <li>Metal cards that reveal intentions help you plan your defense each turn.</li>
              <li>Wood's timed effects compound over turns — play them early for maximum value.</li>
              <li>Break the opponent's Face to trigger Flustered, buying you a free turn.</li>
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
