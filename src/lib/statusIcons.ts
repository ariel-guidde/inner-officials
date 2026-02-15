import {
  LucideIcon,
  Leaf,
  Shield,
  Heart,
  Eye,
  Sparkles,
  Flame,
  Droplets,
  Mountain,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Ban,
  RefreshCw,
  Swords,
  Target,
  CircleDot,
} from 'lucide-react';

/**
 * Status icon registry mapping template IDs to Lucide icons.
 *
 * When adding new status templates, you MUST add a corresponding icon here.
 * If a template ID is not found, the fallback icon (Sparkles) will be used.
 */
export const STATUS_ICON_MAP: Record<string, LucideIcon> = {
  // ==================== WOOD (Growth, Defense, Healing) ====================
  growing_roots: Leaf,
  thick_bark: Shield,
  regeneration: Heart,

  // ==================== METAL (Insight, Precision) ====================
  keen_insight: Eye,

  // ==================== FIRE (Damage, Burn) ====================
  burning: Flame,
  scorched: Flame,

  // ==================== WATER (Flow, Draw, Manipulation) ====================
  flowing: Droplets,
  tidal_surge: Droplets,

  // ==================== EARTH (Stability, Foundation) ====================
  grounded: Mountain,
  fortified: Mountain,

  // ==================== GENERIC POSITIVE BUFFS ====================
  empowered: Sparkles,
  focused: Target,
  energized: Zap,
  inspired: Sparkles,
  strengthened: Swords,
  blessed: Sparkles,
  protected: Shield,

  // ==================== GENERIC NEGATIVE DEBUFFS ====================
  weakened: TrendingDown,
  vulnerable: Ban,
  exhausted: Clock,
  stunned: CircleDot,
  confused: RefreshCw,
  poisoned: Droplets,
  bleeding: Heart,

  // ==================== SPECIAL MECHANICS ====================
  revealed: Eye, // Shows opponent's next intention
  flustered: RefreshCw, // Opponent skips turn
  stalling: Clock, // Patience drain
  pressured: TrendingUp,
};

/**
 * Get the icon component for a status template.
 * @param templateId - The status template ID
 * @returns The Lucide icon component, or Sparkles as fallback
 */
export function getStatusIcon(templateId: string): LucideIcon {
  return STATUS_ICON_MAP[templateId] || Sparkles;
}

/**
 * Get the border and background color classes for a status.
 * @param isPositive - True for buffs, false for debuffs
 * @returns Tailwind classes for border and background
 */
export function getStatusColor(isPositive: boolean): string {
  return isPositive
    ? 'border-green-500 bg-green-500/20'
    : 'border-red-500 bg-red-500/20';
}

/**
 * Get the text color class for a status.
 * @param isPositive - True for buffs, false for debuffs
 * @returns Tailwind text color class
 */
export function getStatusTextColor(isPositive: boolean): string {
  return isPositive ? 'text-green-400' : 'text-red-400';
}
