// ==================== CHARACTER APPEARANCE ====================

export type StatusTier = 'early' | 'mid' | 'late';

export interface AttireOption {
  id: string;
  name: string;
  tier: StatusTier;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Future: image paths can be added here
  // imagePath?: string;
}

export interface CharacterAppearance {
  name: string;
  attireId: string;
}

export const DEFAULT_CHARACTER: CharacterAppearance = {
  name: 'Official',
  attireId: 'early_beige',
};

// Attire options organized by status tier
export const ATTIRE_OPTIONS: AttireOption[] = [
  // Early Status
  {
    id: 'early_beige',
    name: 'Simple Robe',
    tier: 'early',
    primaryColor: '#e8dcc8',
    secondaryColor: '#d4c4a8',
    accentColor: '#8b7355',
  },
  {
    id: 'early_red',
    name: 'Crimson Robe',
    tier: 'early',
    primaryColor: '#c8102e',
    secondaryColor: '#a00d26',
    accentColor: '#ffd700',
  },
  {
    id: 'early_purple',
    name: 'Violet Robe',
    tier: 'early',
    primaryColor: '#6b4c8a',
    secondaryColor: '#533a6b',
    accentColor: '#c0c0c0',
  },

  // Mid Status
  {
    id: 'mid_teal',
    name: 'Jade Vestment',
    tier: 'mid',
    primaryColor: '#00a86b',
    secondaryColor: '#008558',
    accentColor: '#ffd700',
  },
  {
    id: 'mid_red',
    name: 'Scarlet Regalia',
    tier: 'mid',
    primaryColor: '#e34234',
    secondaryColor: '#c8102e',
    accentColor: '#ffd700',
  },
  {
    id: 'mid_olive',
    name: 'Forest Vestment',
    tier: 'mid',
    primaryColor: '#556b2f',
    secondaryColor: '#3a4a1f',
    accentColor: '#00a86b',
  },
  {
    id: 'mid_blue',
    name: 'Azure Regalia',
    tier: 'mid',
    primaryColor: '#002fa7',
    secondaryColor: '#001f70',
    accentColor: '#c0c0c0',
  },
  {
    id: 'mid_purple',
    name: 'Amethyst Vestment',
    tier: 'mid',
    primaryColor: '#7b2d8e',
    secondaryColor: '#5a1f68',
    accentColor: '#ffd700',
  },

  // Late Status
  {
    id: 'late_imperial',
    name: 'Imperial Regalia',
    tier: 'late',
    primaryColor: '#2d1b33',
    secondaryColor: '#1a0f1f',
    accentColor: '#ffd700',
  },
];

// Group attire by tier for display
export const ATTIRE_BY_TIER: Record<StatusTier, AttireOption[]> = {
  early: ATTIRE_OPTIONS.filter(a => a.tier === 'early'),
  mid: ATTIRE_OPTIONS.filter(a => a.tier === 'mid'),
  late: ATTIRE_OPTIONS.filter(a => a.tier === 'late'),
};

export const TIER_LABELS: Record<StatusTier, string> = {
  early: 'Early Status',
  mid: 'Mid Status',
  late: 'Late Status',
};
