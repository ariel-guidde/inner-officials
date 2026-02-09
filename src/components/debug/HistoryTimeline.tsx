import { StateHistoryEntry } from '../../types/game';

interface HistoryTimelineProps {
  history: StateHistoryEntry[];
}

export default function HistoryTimeline({ history }: HistoryTimelineProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-1 text-xs font-mono overflow-y-auto">
      {history.length === 0 ? (
        <div className="text-stone-500 text-center py-4">No history entries yet.</div>
      ) : (
        history.map((entry, index) => (
          <div
            key={`${entry.timestamp}-${index}`}
            className="bg-stone-800 rounded p-2 flex items-center gap-3"
          >
            <span className="text-stone-500 w-16">{formatTime(entry.timestamp)}</span>
            <span className="text-amber-400">T{entry.state.turnNumber ?? 1}</span>
            <span className="text-stone-200 flex-1">{entry.label}</span>
            <div className="flex gap-2 text-stone-400">
              <span>F:{entry.state.player.face}</span>
              <span>T{entry.state.player.standing.currentTier}</span>
              <span>P:{entry.state.patience}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
