// ==================== CHARACTER APPEARANCE ====================

export const HAIR_STYLE = {
  TOPKNOT: 'topknot',
  LONG: 'long',
  SHORT: 'short',
  BALD: 'bald',
  BRAIDED: 'braided',
} as const;

export type HairStyle = typeof HAIR_STYLE[keyof typeof HAIR_STYLE];

export const CLOTHING = {
  SCHOLAR_ROBE: 'scholar_robe',
  COURT_DRESS: 'court_dress',
  MILITARY_ARMOR: 'military_armor',
  MERCHANT_GARB: 'merchant_garb',
  MONK_VESTMENT: 'monk_vestment',
} as const;

export type Clothing = typeof CLOTHING[keyof typeof CLOTHING];

export const ACCESSORY = {
  NONE: 'none',
  JADE_PENDANT: 'jade_pendant',
  FAN: 'fan',
  BRUSH: 'brush',
  INCENSE: 'incense',
} as const;

export type Accessory = typeof ACCESSORY[keyof typeof ACCESSORY];

export interface CharacterAppearance {
  hair: HairStyle;
  clothing: Clothing;
  accessory: Accessory;
  name: string;
}

export const DEFAULT_CHARACTER: CharacterAppearance = {
  hair: HAIR_STYLE.TOPKNOT,
  clothing: CLOTHING.SCHOLAR_ROBE,
  accessory: ACCESSORY.NONE,
  name: 'Scholar',
};

// Display info for each option
export const HAIR_OPTIONS: { value: HairStyle; label: string; emoji: string }[] = [
  { value: HAIR_STYLE.TOPKNOT, label: 'Topknot', emoji: '🎎' },
  { value: HAIR_STYLE.LONG, label: 'Long', emoji: '💇' },
  { value: HAIR_STYLE.SHORT, label: 'Short', emoji: '👤' },
  { value: HAIR_STYLE.BALD, label: 'Bald', emoji: '🧑‍🦲' },
  { value: HAIR_STYLE.BRAIDED, label: 'Braided', emoji: '🧑' },
];

export const CLOTHING_OPTIONS: { value: Clothing; label: string; emoji: string }[] = [
  { value: CLOTHING.SCHOLAR_ROBE, label: 'Scholar Robe', emoji: '📚' },
  { value: CLOTHING.COURT_DRESS, label: 'Court Dress', emoji: '👘' },
  { value: CLOTHING.MILITARY_ARMOR, label: 'Military Armor', emoji: '⚔️' },
  { value: CLOTHING.MERCHANT_GARB, label: 'Merchant Garb', emoji: '🏪' },
  { value: CLOTHING.MONK_VESTMENT, label: 'Monk Vestment', emoji: '🙏' },
];

export const ACCESSORY_OPTIONS: { value: Accessory; label: string; emoji: string }[] = [
  { value: ACCESSORY.NONE, label: 'None', emoji: '✨' },
  { value: ACCESSORY.JADE_PENDANT, label: 'Jade Pendant', emoji: '💎' },
  { value: ACCESSORY.FAN, label: 'Fan', emoji: '🪭' },
  { value: ACCESSORY.BRUSH, label: 'Brush', emoji: '🖌️' },
  { value: ACCESSORY.INCENSE, label: 'Incense', emoji: '🪔' },
];
