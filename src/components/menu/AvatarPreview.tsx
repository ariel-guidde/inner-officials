import { motion } from 'framer-motion';
import {
  CharacterAppearance,
  HAIR_OPTIONS,
  CLOTHING_OPTIONS,
  ACCESSORY_OPTIONS,
} from '../../types/character';

interface AvatarPreviewProps {
  character: CharacterAppearance;
}

export default function AvatarPreview({ character }: AvatarPreviewProps) {
  const hairEmoji = HAIR_OPTIONS.find(h => h.value === character.hair)?.emoji ?? '👤';
  const clothingEmoji = CLOTHING_OPTIONS.find(c => c.value === character.clothing)?.emoji ?? '👘';
  const accessoryEmoji = ACCESSORY_OPTIONS.find(a => a.value === character.accessory)?.emoji ?? '';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Character portrait */}
      <motion.div
        layout
        className="w-32 h-32 rounded-full bg-stone-800 border-2 border-amber-600 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-0">
          <span className="text-4xl">{hairEmoji}</span>
          <span className="text-2xl -mt-2">{clothingEmoji}</span>
        </div>
      </motion.div>

      {/* Accessory badge */}
      {character.accessory !== 'none' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-stone-700 border border-amber-500 flex items-center justify-center text-lg"
        >
          {accessoryEmoji}
        </motion.div>
      )}

      {/* Name */}
      <div className="text-center">
        <div className="text-lg font-medium text-amber-100">{character.name}</div>
        <div className="text-xs text-stone-500">
          {CLOTHING_OPTIONS.find(c => c.value === character.clothing)?.label}
        </div>
      </div>
    </div>
  );
}
