import { motion } from 'framer-motion';
import { BookOpen, Swords, Scroll, Settings, Castle, User } from 'lucide-react';
import { SPRING_PRESETS, STAGGER_CHILDREN, TANG_COLORS } from '../../lib/animations/constants';

interface MainMenuProps {
  onNavigate: (screen: 'deck' | 'how-to-play' | 'settings' | 'battle' | 'campaign-menu' | 'avatar-builder') => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center font-serif relative overflow-hidden">
      {/* Tang Dynasty floating pattern background */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.sin(i) * 70, 0],
              rotate: [0, 360],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12 + i * 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
            className="absolute border-2 rounded-full"
            style={{
              width: 40 + (i % 3) * 20,
              height: 40 + (i % 3) * 20,
              borderColor: i % 2 === 0 ? TANG_COLORS.imperialGold : TANG_COLORS.jadeGreen,
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              boxShadow: `0 0 20px ${i % 2 === 0 ? TANG_COLORS.imperialGold : TANG_COLORS.jadeGreen}40`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center space-y-12 relative z-10">
        {/* Title with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING_PRESETS.dramatic}
        >
          <motion.h1
            className="text-7xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% auto',
              textShadow: `0 0 30px ${TANG_COLORS.imperialGold}40`,
            }}
          >
            Inner Officials
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-stone-400 text-2xl tracking-wide"
          >
            The Art of Courtly Debate
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
          />
        </motion.div>

        {/* Menu buttons with enhanced animations */}
        <motion.div
          variants={STAGGER_CHILDREN}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 max-w-md mx-auto"
        >
          <MenuButton
            icon={<BookOpen className="w-6 h-6" />}
            label="Deck"
            delay={0.2}
            onClick={() => onNavigate('deck')}
          />

          <MenuButton
            icon={<User className="w-6 h-6" />}
            label="Character"
            delay={0.3}
            onClick={() => onNavigate('avatar-builder')}
          />

          <MenuButton
            icon={<Scroll className="w-6 h-6" />}
            label="How to Play"
            delay={0.35}
            onClick={() => onNavigate('how-to-play')}
          />

          <MenuButton
            icon={<Settings className="w-6 h-6" />}
            label="Settings"
            delay={0.4}
            onClick={() => onNavigate('settings')}
          />

          <MenuButton
            icon={<Castle className="w-6 h-6" />}
            label="Campaign"
            delay={0.5}
            onClick={() => onNavigate('campaign-menu')}
            primary
          />

          <MenuButton
            icon={<Swords className="w-6 h-6" />}
            label="Quick Battle"
            delay={0.6}
            onClick={() => onNavigate('battle')}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced menu button component
interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  delay: number;
  onClick: () => void;
  primary?: boolean;
}

function MenuButton({ icon, label, delay, onClick, primary = false }: MenuButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -150, rotateY: -45, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
      transition={{
        ...SPRING_PRESETS.bouncy,
        delay,
      }}
      whileHover={{
        scale: 1.08,
        x: 20,
        boxShadow: primary
          ? `0 15px 60px ${TANG_COLORS.imperialGold}80`
          : `0 15px 40px ${TANG_COLORS.bronze}60`,
        borderColor: TANG_COLORS.imperialGold,
        transition: { duration: 0.15, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.92,
        rotate: primary ? 0 : [0, -2, 2, 0],
        transition: { duration: 0.1 },
      }}
      onClick={onClick}
      className={`
        relative flex items-center gap-4 px-8 py-5 rounded-2xl
        border-2 transition-all duration-300
        ${
          primary
            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-400 text-white'
            : 'bg-stone-900 border-stone-800 text-stone-200'
        }
        group overflow-hidden
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-500/30 to-amber-600/0"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Icon with rotation animation */}
      <motion.div
        className={`relative z-10 ${primary ? 'text-white' : 'text-amber-500 group-hover:text-amber-400'}`}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>

      {/* Label */}
      <span
        className={`relative z-10 text-xl font-medium ${
          primary ? 'font-bold' : 'group-hover:text-amber-200'
        }`}
      >
        {label}
      </span>

      {/* Corner decorations */}
      <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
