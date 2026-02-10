import { GameState } from '../../types/game';

interface StateInspectorProps {
  state: GameState;
  deckInfo: { deck: number; hand: number; discard: number };
}

export default function StateInspector({ state, deckInfo }: StateInspectorProps) {
  const primaryOpponent = state.opponents[0];

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* Turn Info */}
      <div className="bg-stone-800 rounded p-3">
        <h4 className="text-amber-400 font-bold mb-2">Turn Info</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>Turn: {state.turnNumber ?? 1}</div>
          <div>Phase: {state.turnPhase ?? 'player_action'}</div>
          <div>Last Element: {state.lastElement ?? 'none'}</div>
          <div>Game Over: {state.isGameOver ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="bg-stone-800 rounded p-3">
        <h4 className="text-green-400 font-bold mb-2">Player</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>Face: {state.player.face}/{state.player.maxFace}</div>
          <div>Tier: {state.player.standing.currentTier}</div>
          <div>Tier Progress: {state.player.standing.favorInCurrentTier}</div>
          <div>Poise: {state.player.poise}</div>
          <div>Patience: {state.patience}/40</div>
        </div>
      </div>

      {/* Deck Info */}
      <div className="bg-stone-800 rounded p-3">
        <h4 className="text-blue-400 font-bold mb-2">Deck</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>Hand: {deckInfo.hand}</div>
          <div>Deck: {deckInfo.deck}</div>
          <div>Discard: {deckInfo.discard}</div>
        </div>
      </div>

      {/* Opponent Stats */}
      <div className="bg-stone-800 rounded p-3">
        <h4 className="text-red-400 font-bold mb-2">Opponent: {primaryOpponent?.name ?? 'None'}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>Face: {primaryOpponent?.face ?? 0}/{primaryOpponent?.maxFace ?? 0}</div>
          <div>Tier: {primaryOpponent?.standing.currentTier ?? 0}</div>
          <div>Tier Progress: {primaryOpponent?.standing.favorInCurrentTier ?? 0}</div>
          <div>Opponents: {state.opponents.length}</div>
          <div>Intent: {primaryOpponent?.currentIntention?.name ?? 'None'}</div>
        </div>
      </div>
    </div>
  );
}
