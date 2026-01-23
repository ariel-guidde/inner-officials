import { Element, ELEMENT } from '../../types/game';
import ElementIcon from './ElementIcon';

interface WuxingCompassProps {
  lastElement: Element | null;
}

const ELEMENT_ORDER: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];
const ELEMENT_POSITIONS: Record<Element, number> = {
  [ELEMENT.WOOD]: 0,
  [ELEMENT.FIRE]: 1,
  [ELEMENT.EARTH]: 2,
  [ELEMENT.METAL]: 3,
  [ELEMENT.WATER]: 4,
};

const ELEMENT_ANGLES: Record<number, number> = {
  0: 0,    // Wood - top
  1: 72,   // Fire - top-right
  2: 144,  // Earth - bottom-right
  3: 216,  // Metal - bottom-left
  4: 288,  // Water - top-left
};

export default function WuxingCompass({ lastElement }: WuxingCompassProps) {
  const getNextElement = (element: Element): Element => {
    const currentIndex = ELEMENT_POSITIONS[element];
    const nextIndex = (currentIndex + 1) % 5;
    return ELEMENT_ORDER[nextIndex];
  };

  const getChaosElement = (element: Element): Element => {
    const currentIndex = ELEMENT_POSITIONS[element];
    const chaosIndex = (currentIndex + 2) % 5;
    return ELEMENT_ORDER[chaosIndex];
  };

  const nextElement = lastElement ? getNextElement(lastElement) : null;
  const chaosElement = lastElement ? getChaosElement(lastElement) : null;

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Outer circle */}
      <div className="absolute inset-0 border-2 border-stone-700 rounded-full"></div>
      
      {/* Element positions */}
      {ELEMENT_ORDER.map((element, index) => {
        const angle = ELEMENT_ANGLES[index];
        const radian = (angle * Math.PI) / 180;
        const radius = 80;
        const x = Math.sin(radian) * radius;
        const y = -Math.cos(radian) * radius;

        const isLast = lastElement === element;
        const isNext = nextElement === element;
        const isChaos = chaosElement === element;

        let bgColor = 'bg-stone-800';
        let borderColor = 'border-stone-700';
        let scale = 1;

        if (isLast) {
          bgColor = 'bg-blue-600';
          borderColor = 'border-blue-400';
          scale = 1.2;
        } else if (isNext) {
          bgColor = 'bg-green-600';
          borderColor = 'border-green-400';
        } else if (isChaos) {
          bgColor = 'bg-red-600';
          borderColor = 'border-red-400';
        }

        return (
          <div
            key={element}
            className={`absolute w-12 h-12 ${bgColor} ${borderColor} border-2 rounded-full flex items-center justify-center transition-all duration-300`}
            style={{
              left: `calc(50% + ${x}px - 24px)`,
              top: `calc(50% + ${y}px - 24px)`,
              transform: `scale(${scale})`,
            }}
          >
            <ElementIcon element={element} size="sm" />
          </div>
        );
      })}

      {/* Center indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-stone-900 border-2 border-stone-700 rounded-full flex items-center justify-center">
          {lastElement ? (
            <div className="text-center">
              <div className="text-xs text-stone-400 mb-1">Last</div>
              <ElementIcon element={lastElement} size="sm" />
            </div>
          ) : (
            <div className="text-xs text-stone-500">Start</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 text-xs">
        {lastElement && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 border border-blue-400 rounded-full"></div>
              <span className="text-stone-400">Last</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 border border-green-400 rounded-full"></div>
              <span className="text-stone-400">Balanced</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-600 border border-red-400 rounded-full"></div>
              <span className="text-stone-400">Chaos</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
