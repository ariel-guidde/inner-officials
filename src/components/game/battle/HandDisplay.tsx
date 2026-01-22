import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card } from '../../../types/game';
import CardInHand from './CardInHand';
import { calculateCardPositions, getHandWidth, HandHoverState } from '../../../lib/cardLayout';

interface HandDisplayProps {
  cards: Card[];
  patience: number;
  playerFace: number;
  playerPoise?: number;
  onPlayCard: (card: Card) => void;
  disabled?: boolean;
}

const CARD_WIDTH = 128; // w-32 = 8rem = 128px

export default function HandDisplay({ cards, patience, playerFace, playerPoise = 0, onPlayCard, disabled = false }: HandDisplayProps) {
  const [isHandHovered, setIsHandHovered] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const hoverState: HandHoverState = useMemo(() => {
    if (hoveredCardIndex !== null) return 'card_hover';
    if (isHandHovered) return 'hand_hover';
    return 'resting';
  }, [isHandHovered, hoveredCardIndex]);

  const positions = useMemo(() => {
    return calculateCardPositions(cards.length, hoverState, hoveredCardIndex);
  }, [cards.length, hoverState, hoveredCardIndex]);

  const containerWidth = getHandWidth(cards.length, CARD_WIDTH);

  if (cards.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 flex items-center justify-center">
        <div className="text-stone-500 text-sm">
          No cards in hand. Click "End Turn" to draw.
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-48 z-30"
      onMouseEnter={() => setIsHandHovered(true)}
      onMouseLeave={() => {
        setIsHandHovered(false);
        setHoveredCardIndex(null);
      }}
    >
      {/* Cards container */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div
          className="relative"
          style={{ width: `${containerWidth}px`, height: '180px' }}
        >
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => {
              // Face cost can be paid with poise first, then face
              const effectiveFacePool = playerPoise + playerFace;
              const canAfford = !disabled && patience >= card.patienceCost && effectiveFacePool >= card.faceCost;
              return (
                <CardInHand
                  key={card.id}
                  card={card}
                  canAfford={canAfford}
                  position={positions[index]}
                  index={index}
                  isHovered={hoveredCardIndex === index}
                  onPlay={disabled ? () => {} : onPlayCard}
                  onHover={disabled ? () => {} : setHoveredCardIndex}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
