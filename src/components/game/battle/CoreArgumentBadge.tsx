import { motion } from 'framer-motion';
import { CoreArgument } from '../../../types/game';
import { ELEMENT_THEMES } from '../../../lib/animations/constants';
import ElementIcon from '../ElementIcon';
import { SPRING_PRESETS } from '../../../lib/animations/constants';

interface CoreArgumentBadgeProps {
  coreArgument?: CoreArgument;
  onClick?: () => void;
}

export default function CoreArgumentBadge({ coreArgument, onClick }: CoreArgumentBadgeProps) {
  if (!coreArgument) return null;

  const elementTheme = coreArgument.element ? ELEMENT_THEMES[coreArgument.element] : null;

  // Abbreviate the name (take first 2-3 words or 20 chars max)
  const abbreviatedName = coreArgument.name.length > 20
    ? coreArgument.name.substring(0, 17) + '...'
    : coreArgument.name;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={SPRING_PRESETS.quick}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        border-2 ${elementTheme?.borderColor || 'border-stone-600'}
        ${elementTheme ? `bg-gradient-to-r ${elementTheme.bgGradient}` : 'bg-gradient-to-r from-stone-800 to-stone-900'}
        hover:brightness-110 transition-all
        shadow-lg
      `}
      title={`${coreArgument.name} - Click for details`}
    >
      {coreArgument.element && (
        <ElementIcon element={coreArgument.element} size="sm" />
      )}
      <div className="flex flex-col items-start">
        <div className="text-[10px] text-stone-400">Core Argument</div>
        <div className="text-sm font-medium text-amber-100 leading-tight">
          {abbreviatedName}
        </div>
      </div>
    </motion.button>
  );
}
