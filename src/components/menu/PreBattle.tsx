import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Swords, Sparkles } from 'lucide-react';
import { CoreArgument, ELEMENT, Element } from '../../types/game';
import { OPPONENTS } from '../../data/opponents';
import { CORE_ARGUMENTS } from '../../data/coreArguments';

interface PreBattleProps {
  opponentIndices: number[];
  onStartBattle: (coreArgument: CoreArgument) => void;
  onBack: () => void;
}

const OPPONENT_SPRITES: Record<string, string> = {
  'The Concubine': '\u{1F478}',
  'The Scholar': '\u{1F9D1}\u200D\u{1F393}',
  'The General': '\u2694\uFE0F',
  'The Eunuch': '\u{1F9D1}\u200D\u{1F9B2}',
  'The Empress': '\u{1F451}',
};

const ELEMENT_COLORS: Record<Element, { bg: string; border: string; text: string }> = {
  [ELEMENT.FIRE]: { bg: 'bg-red-900/30', border: 'border-red-600/50', text: 'text-red-300' },
  [ELEMENT.WATER]: { bg: 'bg-blue-900/30', border: 'border-blue-600/50', text: 'text-blue-300' },
  [ELEMENT.WOOD]: { bg: 'bg-green-900/30', border: 'border-green-600/50', text: 'text-green-300' },
  [ELEMENT.EARTH]: { bg: 'bg-amber-900/30', border: 'border-amber-600/50', text: 'text-amber-300' },
  [ELEMENT.METAL]: { bg: 'bg-slate-800/50', border: 'border-slate-500/50', text: 'text-slate-300' },
};

const NEUTRAL_COLORS = { bg: 'bg-purple-900/30', border: 'border-purple-600/50', text: 'text-purple-300' };

export default function PreBattle({ opponentIndices, onStartBattle, onBack }: PreBattleProps) {
  const [selectedArgument, setSelectedArgument] = useState<CoreArgument | null>(null);

  const opponents = opponentIndices.map(i => OPPONENTS[i % OPPONENTS.length]);

  const getColors = (arg: CoreArgument) => {
    if (arg.element) return ELEMENT_COLORS[arg.element];
    return NEUTRAL_COLORS;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-serif flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-stone-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-amber-100">Prepare for Debate</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Opponents Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">
                {opponents.length > 1 ? 'Opponents' : 'Opponent'}
              </h2>
            </div>
            <div className="flex gap-3">
              {opponents.map((opp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-1 panel p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center text-2xl">
                      {OPPONENT_SPRITES[opp.name] || '\u{1F464}'}
                    </div>
                    <div>
                      <div className="text-amber-100 font-medium">{opp.name}</div>
                      <div className="text-xs text-stone-500">Face: {opp.maxFace}</div>
                    </div>
                  </div>
                  {opp.coreArgument && (
                    <div className="text-xs text-stone-400 px-2 py-1 bg-stone-800/50 rounded border border-stone-700">
                      <span className="text-stone-500">Argument: </span>
                      <span className="text-amber-200">{opp.coreArgument.name}</span>
                      <span className="text-stone-500 ml-1">- {opp.coreArgument.description}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Core Argument Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Choose Your Core Argument</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CORE_ARGUMENTS.map((arg) => {
                const colors = getColors(arg);
                const isSelected = selectedArgument?.id === arg.id;
                return (
                  <motion.button
                    key={arg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedArgument(arg)}
                    className={`text-left p-3 rounded-xl border transition-all ${colors.bg} ${
                      isSelected
                        ? `${colors.border} ring-2 ring-amber-500/50 border-amber-500/50`
                        : `${colors.border} hover:border-stone-500`
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${isSelected ? 'text-amber-100' : colors.text}`}>
                        {arg.name}
                      </span>
                      {arg.element && (
                        <span className="text-[10px] text-stone-500 uppercase">{arg.element}</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">{arg.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="p-4 border-t border-stone-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="text-sm text-stone-500">
            {selectedArgument ? (
              <span>Selected: <span className="text-amber-200">{selectedArgument.name}</span></span>
            ) : (
              'Select a core argument to begin'
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectedArgument && onStartBattle(selectedArgument)}
            disabled={!selectedArgument}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedArgument
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4" />
              <span>Begin Debate</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
