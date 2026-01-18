import { Swords } from 'lucide-react';
import { SessionState } from '../../../types/game';

interface CampaignProgressProps {
  session: SessionState;
}

export default function CampaignProgress({ session }: CampaignProgressProps) {
  const battlesRemaining = session.totalBattles - session.currentBattle;

  return (
    <div className="flex items-center gap-3 bg-stone-900/80 border border-stone-700 rounded-lg px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <Swords className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-stone-400">Battle</span>
        <span className="text-sm font-mono text-stone-200">
          {session.currentBattle}/{session.totalBattles}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: session.totalBattles }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < session.battlesWon
                ? 'bg-amber-500'
                : i === session.currentBattle - 1
                  ? 'bg-amber-500/50 animate-pulse'
                  : 'bg-stone-700'
            }`}
          />
        ))}
      </div>

      {battlesRemaining > 0 && (
        <span className="text-[10px] text-stone-500">
          {battlesRemaining} left
        </span>
      )}
    </div>
  );
}
