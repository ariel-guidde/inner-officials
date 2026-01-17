import { Element } from '../../../types/game';
import ElementIcon from '../ElementIcon';

interface WuxingIndicatorProps {
  lastElement: Element | null;
}

const ELEMENT_ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export default function WuxingIndicator({ lastElement }: WuxingIndicatorProps) {
  const getNextElement = (element: Element): Element => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return ELEMENT_ORDER[(currentIndex + 1) % 5];
  };

  const getChaosElement = (element: Element): Element => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return ELEMENT_ORDER[(currentIndex + 2) % 5];
  };

  const nextElement = lastElement ? getNextElement(lastElement) : null;
  const chaosElement = lastElement ? getChaosElement(lastElement) : null;

  return (
    <div className="bg-stone-900/80 border border-stone-700 rounded-xl p-3 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Wuxing Flow</div>

      {/* Mini compass showing the cycle */}
      <div className="relative w-24 h-24 mx-auto mb-3">
        {/* Connection lines (pentagon) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Generating cycle (outer pentagon) */}
          <polygon
            points="50,8 92,38 77,88 23,88 8,38"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-700"
          />
          {/* Arrows showing direction */}
          <path
            d="M50,8 L92,38 L77,88 L23,88 L8,38 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4,2"
            className="text-green-600/50"
          />
        </svg>

        {/* Element nodes */}
        {ELEMENT_ORDER.map((element, index) => {
          const angle = (index * 72 - 90) * (Math.PI / 180);
          const radius = 38;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);

          const isLast = lastElement === element;
          const isNext = nextElement === element;
          const isChaos = chaosElement === element;

          let ringColor = 'ring-stone-600';
          let bgColor = 'bg-stone-800';
          if (isLast) {
            ringColor = 'ring-blue-500 ring-2';
            bgColor = 'bg-blue-900/50';
          } else if (isNext) {
            ringColor = 'ring-green-500 ring-2';
            bgColor = 'bg-green-900/30';
          } else if (isChaos) {
            ringColor = 'ring-red-500 ring-2';
            bgColor = 'bg-red-900/30';
          }

          return (
            <div
              key={element}
              className={`absolute w-7 h-7 rounded-full ${bgColor} ${ringColor} ring-1 flex items-center justify-center transition-all`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <ElementIcon element={element} size="xs" />
            </div>
          );
        })}

        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center">
            {lastElement ? (
              <ElementIcon element={lastElement} size="xs" />
            ) : (
              <span className="text-[8px] text-stone-500">?</span>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      {lastElement && (
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-900/50 ring-1 ring-green-500 flex items-center justify-center">
              <ElementIcon element={nextElement!} size="xs" />
            </div>
            <span className="text-green-400">Balanced: -1 Patience</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-900/50 ring-1 ring-red-500 flex items-center justify-center">
              <ElementIcon element={chaosElement!} size="xs" />
            </div>
            <span className="text-red-400">Chaos: +Effect, +Cost</span>
          </div>
        </div>
      )}

      {!lastElement && (
        <div className="text-xs text-stone-500 text-center">Play any card to start</div>
      )}
    </div>
  );
}
