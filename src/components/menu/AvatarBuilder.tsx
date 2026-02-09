import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCharacter } from '../../hooks/useCharacter';
import AvatarPreview from './AvatarPreview';
import {
  HAIR_OPTIONS,
  CLOTHING_OPTIONS,
  ACCESSORY_OPTIONS,
  HairStyle,
  Clothing,
  Accessory,
} from '../../types/character';

interface AvatarBuilderProps {
  onBack: () => void;
}

function OptionGrid<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string; emoji: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-stone-400 mb-2">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(option.value)}
            className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              selected === option.value
                ? 'border-amber-500 bg-amber-900/30 text-amber-100'
                : 'border-stone-700 bg-stone-800/50 text-stone-300 hover:border-stone-600'
            }`}
          >
            <span className="text-lg">{option.emoji}</span>
            <span className="text-sm">{option.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function AvatarBuilder({ onBack }: AvatarBuilderProps) {
  const { character, setHair, setClothing, setAccessory, setName, reset } = useCharacter();

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
          <h1 className="text-2xl font-bold text-amber-100">Character</h1>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Preview */}
        <div className="flex-shrink-0 flex justify-center">
          <div className="relative">
            <AvatarPreview character={character} />
          </div>
        </div>

        {/* Options */}
        <div className="flex-1 space-y-6">
          {/* Name */}
          <div>
            <div className="text-sm font-medium text-stone-400 mb-2">Name</div>
            <input
              type="text"
              value={character.name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 focus:border-amber-500 focus:outline-none"
              placeholder="Enter name..."
            />
          </div>

          {/* Hair */}
          <OptionGrid<HairStyle>
            label="Hair"
            options={HAIR_OPTIONS}
            selected={character.hair}
            onSelect={setHair}
          />

          {/* Clothing */}
          <OptionGrid<Clothing>
            label="Clothing"
            options={CLOTHING_OPTIONS}
            selected={character.clothing}
            onSelect={setClothing}
          />

          {/* Accessory */}
          <OptionGrid<Accessory>
            label="Accessory"
            options={ACCESSORY_OPTIONS}
            selected={character.accessory}
            onSelect={setAccessory}
          />
        </div>
      </div>
    </div>
  );
}
