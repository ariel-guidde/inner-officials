import { useGameLogic } from '../../hooks/useGameLogic';
import BattleLayout from './battle/BattleLayout';
import WuxingIndicator from './battle/WuxingIndicator';
import OpponentInfoPanel from './battle/OpponentInfoPanel';
import JudgePanel from './battle/JudgePanel';
import PlayerInfoPanel from './battle/PlayerInfoPanel';
import DeckDisplay from './battle/DeckDisplay';
import HandDisplay from './battle/HandDisplay';
import ActionBar from './battle/ActionBar';
import GameOverOverlay from './battle/GameOverOverlay';
import DebugPanel from '../debug/DebugPanel';

interface BattleArenaProps {
  onBack: () => void;
}

export default function BattleArena({ onBack }: BattleArenaProps) {
  const { state, playCard, endTurn, debug } = useGameLogic();

  return (
    <BattleLayout
      onBack={onBack}
      wuxingIndicator={<WuxingIndicator lastElement={state.lastElement} />}
      opponentPanel={
        <OpponentInfoPanel
          name={state.opponent.name}
          face={state.opponent.face}
          maxFace={state.opponent.maxFace}
          favor={state.opponent.favor}
          isShocked={state.opponent.isShocked}
          currentIntention={state.opponent.currentIntention}
        />
      }
      judgePanel={
        <JudgePanel
          patience={state.patience}
          maxPatience={40}
          playerFavor={state.player.favor}
          opponentFavor={state.opponent.favor}
        />
      }
      playerPanel={
        <PlayerInfoPanel
          face={state.player.face}
          maxFace={state.player.maxFace}
          poise={state.player.poise}
        />
      }
      deckDisplay={
        <DeckDisplay
          deckCount={state.player.deck.length}
          discardCount={state.player.discard.length}
        />
      }
      hand={
        <HandDisplay
          cards={state.player.hand}
          patience={state.patience}
          playerFace={state.player.face}
          onPlayCard={playCard}
        />
      }
      actionBar={
        <ActionBar
          onEndTurn={endTurn}
          disabled={state.isGameOver}
        />
      }
      overlay={state.isGameOver ? <GameOverOverlay winner={state.winner} onBack={onBack} /> : undefined}
      debugPanel={
        <DebugPanel
          state={state}
          deckInfo={debug.getDeckInfo()}
          history={debug.getHistory()}
        />
      }
    />
  );
}
