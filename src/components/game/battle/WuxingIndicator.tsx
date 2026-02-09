import { Element, ELEMENT } from '../../../types/game';
import ElementIcon from '../ElementIcon';

interface WuxingIndicatorProps {
  lastElement: Element | null;
  harmonyStreak: number;
}

const ELEMENT_ORDER: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];
const HARMONY_THRESHOLD = 5;

export default function WuxingIndicator({ lastElement, harmonyStreak }: WuxingIndicatorProps) {
  const getNextElement = (element: Element): Element => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return ELEMENT_ORDER[(currentIndex + 1) % 5];
  };

  const getChaosElement = (element: Element): Element => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return ELEMENT_ORDER[(currentIndex + 2) % 5];
  };

  const getDissonantElements = (element: Element): Element[] => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return [
      ELEMENT_ORDER[(currentIndex + 3) % 5],
      ELEMENT_ORDER[(currentIndex + 4) % 5],
    ];
  };

  const nextElement = lastElement ? getNextElement(lastElement) : null;
  const chaosElement = lastElement ? getChaosElement(lastElement) : null;
  const dissonantElements = lastElement ? getDissonantElements(lastElement) : [];

  const getNodeStyle = (element: Element) => {
    if (!lastElement) return { ring: 'ring-stone-600', bg: 'bg-stone-800' };
    if (lastElement === element) return { ring: 'ring-blue-500 ring-2', bg: 'bg-blue-900/50' };
    if (nextElement === element) return { ring: 'ring-green-500 ring-2', bg: 'bg-green-900/30' };
    if (chaosElement === element) return { ring: 'ring-orange-500 ring-2', bg: 'bg-orange-900/30' };
    if (dissonantElements.includes(element)) return { ring: 'ring-yellow-500 ring-2', bg: 'bg-yellow-900/20' };
    return { ring: 'ring-stone-600', bg: 'bg-stone-800' };
  };

  return (
    <div className="bg-stone-900/80 border border-stone-700 rounded-xl p-3 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Wuxing Flow</div>

      {/* Mini compass showing the cycle */}
      <div className="relative w-24 h-24 mx-auto mb-3">
        {/* Connection lines (pentagon) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <polygon
            points="50,8 92,38 77,88 23,88 8,38"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-700"
          />
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
          const style = getNodeStyle(element);

          return (
            <div
              key={element}
              className={`absolute w-7 h-7 rounded-full ${style.bg} ${style.ring} ring-1 flex items-center justify-center transition-all`}
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

        {/* Center - Show harmony countdown */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-600 flex flex-col items-center justify-center">
            {harmonyStreak >= HARMONY_THRESHOLD ? (
              <>
                <div className="text-[8px] text-green-400 font-bold">HARMONY</div>
                <ElementIcon element={lastElement!} size="xs" />
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-stone-300">{Math.max(0, HARMONY_THRESHOLD - harmonyStreak)}</div>
                <div className="text-[6px] text-stone-500">cards</div>
              </>
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
            <div className="w-3 h-3 rounded-full bg-orange-900/50 ring-1 ring-orange-500 flex items-center justify-center">
              <ElementIcon element={chaosElement!} size="xs" />
            </div>
            <span className="text-orange-400">Chaos: 2x Effect, +2 Cost</span>
          </div>
          {dissonantElements.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-900/30 ring-1 ring-yellow-500 flex items-center justify-center">
                <ElementIcon element={dissonantElements[0]} size="xs" />
              </div>
              <span className="text-yellow-500/70">Dissonant: +1 Cost</span>
            </div>
          )}
        </div>
      )}

      {!lastElement && (
        <div className="text-xs text-stone-500 text-center">Play any card to start</div>
      )}
    </div>
  );
}
