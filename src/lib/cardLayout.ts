export interface CardLayoutConfig {
  maxRotation: number;      // Max rotation in degrees for outermost cards
  spacing: number;          // Horizontal spacing between cards
  hoverLift: number;        // Vertical lift on hover (individual card)
  arcHeight: number;        // Height of the parabolic arc
  spreadOnHover: number;    // How much neighbors spread apart
  restingY: number;         // How far cards are hidden at rest (positive = below)
  handHoverLift: number;    // How much to lift all cards when hand is hovered
}

export interface CardPosition {
  x: number;           // Horizontal offset from center
  y: number;           // Vertical offset (arc)
  rotation: number;    // Rotation in degrees
  zIndex: number;      // Stacking order
  scale: number;
}

const DEFAULT_CONFIG: CardLayoutConfig = {
  maxRotation: 4,          // Less steep rotation
  spacing: 50,             // Tighter spacing
  hoverLift: 25,           // Slight lift on individual hover
  arcHeight: 5,            // Much flatter arc
  spreadOnHover: 12,       // Less spread
  restingY: 80,            // Show top portion of cards at rest
  handHoverLift: 60,       // Lift when hand area is hovered
};

export type HandHoverState = 'resting' | 'hand_hover' | 'card_hover';

/**
 * Calculate card positions based on hand hover state
 */
export function calculateCardPositions(
  cardCount: number,
  hoverState: HandHoverState = 'resting',
  hoveredCardIndex: number | null = null,
  config: Partial<CardLayoutConfig> = {}
): CardPosition[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const positions: CardPosition[] = [];

  if (cardCount === 0) return positions;

  const centerIndex = (cardCount - 1) / 2;

  for (let i = 0; i < cardCount; i++) {
    const normalizedOffset = (i - centerIndex) / Math.max(1, centerIndex);

    // Horizontal position - linear spread from center
    let x = (i - centerIndex) * cfg.spacing;

    // Base vertical position with arc
    const arcOffset = cfg.arcHeight * normalizedOffset * normalizedOffset;

    // Calculate Y based on hover state
    let y: number;
    let rotation = normalizedOffset * cfg.maxRotation;
    let scale = 1;
    let zIndex = cardCount - Math.floor(Math.abs(i - centerIndex));

    if (hoverState === 'resting') {
      // Cards are mostly hidden
      y = cfg.restingY + arcOffset;
    } else if (hoverState === 'hand_hover') {
      // All cards lift up when hand is hovered
      y = cfg.restingY - cfg.handHoverLift + arcOffset;
    } else if (hoverState === 'card_hover' && hoveredCardIndex !== null) {
      // Specific card is hovered
      const isHovered = i === hoveredCardIndex;
      const distanceFromHovered = i - hoveredCardIndex;

      if (isHovered) {
        // Hovered card: extra lift, straighten slightly
        y = cfg.restingY - cfg.handHoverLift - cfg.hoverLift + arcOffset;
        rotation = rotation * 0.3; // Reduce rotation but don't fully straighten
        zIndex = 100;
        scale = 1.05;
      } else {
        // Non-hovered cards: spread apart slightly
        const spreadDirection = distanceFromHovered > 0 ? 1 : -1;
        const spreadAmount = cfg.spreadOnHover / (Math.abs(distanceFromHovered) + 0.5);
        x = x + spreadDirection * spreadAmount;
        y = cfg.restingY - cfg.handHoverLift + arcOffset;
      }
    } else {
      y = cfg.restingY + arcOffset;
    }

    positions.push({ x, y, rotation, zIndex, scale });
  }

  return positions;
}

/**
 * Get container width needed for the hand
 */
export function getHandWidth(cardCount: number, cardWidth: number, config: Partial<CardLayoutConfig> = {}): number {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  return Math.max(cardWidth, cardCount * cfg.spacing + cardWidth);
}

export { DEFAULT_CONFIG };
