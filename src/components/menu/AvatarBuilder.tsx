import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCharacter } from '../../hooks/useCharacter';
import CharacterDisplay from './CharacterDisplay';
import {
  ATTIRE_BY_TIER,
  TIER_LABELS,
  StatusTier,
  AttireOption,
} from '../../types/character';
import { SPRING_PRESETS } from '../../lib/animations/constants';

interface AvatarBuilderProps {
  onBack: () => void;
}

interface AttireSwatchProps {
  attire: AttireOption;
  isSelected: boolean;
  onSelect: () => void;
}

function AttireSwatch({ attire, isSelected, onSelect }: AttireSwatchProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`
        relative w-16 h-20 rounded-lg overflow-hidden
        border-2 transition-all
        ${isSelected
          ? 'border-amber-400 ring-2 ring-amber-500/50'
          : 'border-stone-600 hover:border-amber-600'
        }
      `}
      style={{
        background: `linear-gradient(180deg,
          ${attire.primaryColor} 0%,
          ${attire.secondaryColor} 70%,
          ${attire.primaryColor} 100%
        )`,
        boxShadow: isSelected
          ? `0 8px 20px ${attire.primaryColor}60`
          : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Accent decoration */}
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
        style={{
          background: attire.accentColor,
          boxShadow: `0 0 8px ${attire.accentColor}`,
        }}
      />

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={SPRING_PRESETS.bouncy}
          className="absolute bottom-1 right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-amber-900 rounded-full" />
        </motion.div>
      )}

      {/* Mini pattern lines */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{ background: attire.accentColor }}
          />
        ))}
      </div>
    </motion.button>
  );
}

interface TierSectionProps {
  tier: StatusTier;
  attires: AttireOption[];
  selectedAttireId: string;
  onSelect: (attireId: string) => void;
}

function TierSection({ tier, attires, selectedAttireId, onSelect }: TierSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={SPRING_PRESETS.smooth}
      className="space-y-3"
    >
      {/* Tier label */}
      <div className="flex items-center gap-2">
        <div className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${tier === 'early' ? 'bg-stone-700 text-stone-300' :
            tier === 'mid' ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' :
            'bg-amber-900/50 text-amber-300 border border-amber-500/50'
          }
        `}>
          {TIER_LABELS[tier]}
        </div>
      </div>

      {/* Attire swatches */}
      <div className="flex gap-3 flex-wrap">
        {attires.map(attire => (
          <AttireSwatch
            key={attire.id}
            attire={attire}
            isSelected={selectedAttireId === attire.id}
            onSelect={() => onSelect(attire.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function AvatarBuilder({ onBack }: AvatarBuilderProps) {
  const { character, setAttire, setName, reset } = useCharacter();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-serif p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-amber-100">Character Attire</h1>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Character Preview */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_PRESETS.smooth}
              className="bg-stone-900/50 border-2 border-stone-700 rounded-2xl p-8 backdrop-blur-sm"
            >
              <CharacterDisplay character={character} />
            </motion.div>

            {/* Name input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 w-full max-w-xs"
            >
              <label className="text-sm font-medium text-stone-400 mb-2 block">
                Official Name
              </label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 text-center focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="Enter name..."
              />
            </motion.div>
          </div>

          {/* Right: Attire Selection by Tier */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-amber-100 mb-2">Select Attire</h2>
              <p className="text-sm text-stone-400 mb-6">
                Choose robes befitting your station in the imperial court
              </p>
            </motion.div>

            {/* Tier sections */}
            <div className="space-y-8">
              <TierSection
                tier="early"
                attires={ATTIRE_BY_TIER.early}
                selectedAttireId={character.attireId}
                onSelect={setAttire}
              />

              <TierSection
                tier="mid"
                attires={ATTIRE_BY_TIER.mid}
                selectedAttireId={character.attireId}
                onSelect={setAttire}
              />

              <TierSection
                tier="late"
                attires={ATTIRE_BY_TIER.late}
                selectedAttireId={character.attireId}
                onSelect={setAttire}
              />
            </div>

            {/* Info box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg"
            >
              <div className="text-xs text-amber-200">
                <strong>Tip:</strong> Your attire reflects your standing in the court.
                Choose wisely to impress the judges!
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
