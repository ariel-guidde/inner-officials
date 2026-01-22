import BattleLayout from './battle/BattleLayout';
import WuxingIndicator from './battle/WuxingIndicator';
import OpponentInfoPanel from './battle/OpponentInfoPanel';
import JudgePanel from './battle/JudgePanel';
import PlayerInfoPanel from './battle/PlayerInfoPanel';
import DeckDisplay from './battle/DeckDisplay';
import HandDisplay from './battle/HandDisplay';
import ActionBar from './battle/ActionBar';
import CampaignProgress from './battle/CampaignProgress';
import DebugPanel from '../debug/DebugPanel';
import TargetingOverlay from './battle/TargetingOverlay';
import EventAnnouncement from './battle/EventAnnouncement';
import ActiveEffectsDisplay from './battle/ActiveEffectsDisplay';
import { GameState, Card, SessionState, TargetRequirement, GameEvent } from '../../types/game';
import { DebugInterface } from '../../hooks/useGameLogic';

interface TargetingState {
  isTargeting: boolean;
  pendingCard: Card | null;
  requirement: TargetRequirement | null;
  selectedTargets: Card[];
  validTargets: Card[];
  selectTarget: (card: Card) => void;
  deselectTarget: (card: Card) => void;
  confirmTargets: () => void;
  cancelTargeting: () => void;
  canConfirm: () => boolean;
}

interface EventsState {
  currentEvent: GameEvent | null;
  isBlocking: boolean;
}

interface BattleArenaProps {
  onBack: () => void;
  session: SessionState;
  state: GameState;
  playCard: (card: Card) => void;
  endTurn: () => void;
  debug: DebugInterface;
  targeting?: TargetingState;
  events?: EventsState;
}

export default function BattleArena({ onBack, session, state, playCard, endTurn, debug, targeting, events }: BattleArenaProps) {
  const isBlocking = events?.isBlocking ?? false;

  return (
    <>
      <BattleLayout
        onBack={onBack}
        wuxingIndicator={<WuxingIndicator lastElement={state.lastElement} />}
        opponentPanel={
          <OpponentInfoPanel
            name={state.opponent.name}
            face={state.opponent.face}
            maxFace={state.opponent.maxFace}
            favor={state.opponent.favor}
            patienceSpent={state.opponent.patienceSpent}
            currentIntention={state.opponent.currentIntention}
            nextIntention={state.opponent.nextIntention}
            canSeeNextIntention={state.player.canSeeNextIntention}
          />
        }
        judgePanel={
          <JudgePanel
            patience={state.patience}
            maxPatience={40}
            playerFavor={state.player.favor}
            opponentFavor={state.opponent.favor}
            judgeEffects={state.judge.effects}
            nextJudgeAction={state.judge.nextEffect}
            patienceThreshold={state.judge.patienceThreshold}
            patienceSpent={state.judge.patienceSpent}
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
            playerPoise={state.player.poise}
            onPlayCard={playCard}
            disabled={isBlocking || (targeting?.isTargeting ?? false)}
          />
        }
        actionBar={
          <ActionBar
            onEndTurn={endTurn}
            disabled={state.isGameOver || isBlocking || (targeting?.isTargeting ?? false)}
            patienceCost={state.judge.effects.endTurnPatienceCost}
          />
        }
        campaignProgress={<CampaignProgress session={session} />}
        debugPanel={
          <DebugPanel
            state={state}
            deckInfo={debug.getDeckInfo()}
            history={debug.getHistory()}
          />
        }
        activeEffectsDisplay={
          <ActiveEffectsDisplay
            activeEffects={state.activeEffects}
            boardEffects={state.boardEffects}
          />
        }
      />

      {/* Targeting Overlay */}
      {targeting && (
        <TargetingOverlay
          isActive={targeting.isTargeting}
          pendingCard={targeting.pendingCard}
          requirement={targeting.requirement}
          validTargets={targeting.validTargets}
          selectedTargets={targeting.selectedTargets}
          onSelectTarget={targeting.selectTarget}
          onDeselectTarget={targeting.deselectTarget}
          onConfirm={targeting.confirmTargets}
          onCancel={targeting.cancelTargeting}
          canConfirm={targeting.canConfirm()}
        />
      )}

      {/* Event Announcement */}
      {events && (
        <EventAnnouncement event={events.currentEvent} />
      )}
    </>
  );
}
