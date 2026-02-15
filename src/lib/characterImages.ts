/**
 * Character image mapping
 * Maps character names to their image paths
 */

// Player character image
export const PLAYER_IMAGE = '/images/PC.png';

// Opponent character images
export const OPPONENT_IMAGES: Record<string, string> = {
  'The Concubine': '/images/opponent/concubine-1.png',
  'The Scholar': '/images/opponent/concubine-2.png', // Using concubine-2 for Scholar
  'The General': '/images/opponent/general-1.png',
  'The Eunuch': '/images/opponent/concubine-3.png', // Using concubine-3 for Eunuch
  'The Empress': '/images/opponent/concubine-1.png', // Fallback to concubine-1 for Empress
};

/**
 * Get the image path for an opponent by name
 * Falls back to first concubine image if opponent not found
 */
export function getOpponentImage(opponentName: string): string {
  return OPPONENT_IMAGES[opponentName] || '/images/opponent/concubine-1.png';
}
