import { useState, useEffect } from 'react';
import { CombatLogEntry } from '../../types/game';
import { combatLogger } from '../../lib/debug/combatLogger';

interface LogViewerProps {
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export default function LogViewer({ onExportJSON, onExportCSV }: LogViewerProps) {
  const [entries, setEntries] = useState<CombatLogEntry[]>(combatLogger.getEntries());

  useEffect(() => {
    const unsubscribe = combatLogger.subscribe(() => {
      setEntries(combatLogger.getEntries());
    });
    return unsubscribe;
  }, []);

  const getActorColor = (actor: CombatLogEntry['actor']) => {
    switch (actor) {
      case 'player':
        return 'text-green-400';
      case 'opponent':
        return 'text-red-400';
      case 'system':
        return 'text-yellow-400';
      default:
        return 'text-stone-400';
    }
  };

  const formatDelta = (delta: CombatLogEntry['stateDelta']) => {
    if (!delta) return null;
    const changes: string[] = [];
    if (delta.playerFace && delta.playerFace !== 0) {
      changes.push(`Face ${delta.playerFace > 0 ? '+' : ''}${delta.playerFace}`);
    }
    if (delta.playerStanding && delta.playerStanding !== 0) {
      changes.push(`Standing ${delta.playerStanding > 0 ? '+' : ''}${delta.playerStanding}`);
    }
    if (delta.playerTier && delta.playerTier !== 0) {
      changes.push(`Tier ${delta.playerTier > 0 ? '+' : ''}${delta.playerTier}`);
    }
    if (delta.opponentFace && delta.opponentFace !== 0) {
      changes.push(`Opp.Face ${delta.opponentFace > 0 ? '+' : ''}${delta.opponentFace}`);
    }
    if (delta.opponentStanding && delta.opponentStanding !== 0) {
      changes.push(`Opp.Standing ${delta.opponentStanding > 0 ? '+' : ''}${delta.opponentStanding}`);
    }
    if (delta.patience && delta.patience !== 0) {
      changes.push(`Patience ${delta.patience > 0 ? '+' : ''}${delta.patience}`);
    }
    return changes.length > 0 ? changes.join(', ') : null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Export Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={onExportJSON}
          className="px-3 py-1 bg-stone-700 hover:bg-stone-600 rounded text-xs"
        >
          Export JSON
        </button>
        <button
          onClick={onExportCSV}
          className="px-3 py-1 bg-stone-700 hover:bg-stone-600 rounded text-xs"
        >
          Export CSV
        </button>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono">
        {entries.length === 0 ? (
          <div className="text-stone-500 text-center py-4">No combat log entries yet.</div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-stone-800 rounded p-2 border-l-2"
              style={{
                borderLeftColor:
                  entry.actor === 'player'
                    ? '#4ade80'
                    : entry.actor === 'opponent'
                    ? '#f87171'
                    : '#facc15',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-stone-500">T{entry.turn}</span>
                <span className={getActorColor(entry.actor)}>[{entry.actor}]</span>
                <span className="text-stone-200">{entry.action}</span>
              </div>
              {formatDelta(entry.stateDelta) && (
                <div className="text-stone-400 mt-1 pl-4">{formatDelta(entry.stateDelta)}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
