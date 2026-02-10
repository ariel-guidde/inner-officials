import { useState } from 'react';
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
import PileViewerModal, { PileType } from './battle/PileViewerModal';
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
  // Opponent targeting
  isOpponentTargeting?: boolean;
  selectableOpponentIds?: string[];
  targetOpponentId?: string | null;
  selectOpponent?: (opponentId: string) => void;
  confirmOpponentTarget?: (opponentId: string) => void;
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
  const [pileViewer, setPileViewer] = useState<{ type: PileType; isOpen: boolean }>({
    type: 'deck',
    isOpen: false,
  });

  const openPileViewer = (type: PileType) => {
    setPileViewer({ type, isOpen: true });
  };

  const closePileViewer = () => {
    setPileViewer({ type: 'deck', isOpen: false });
  };

  const getPileCards = (type: PileType): Card[] => {
    switch (type) {
      case 'deck':
        return state.player.deck;
      case 'discard':
        return state.player.discard;
      case 'removed':
        return state.player.removedFromGame;
    }
  };

  return (
    <>
      <BattleLayout
        onBack={onBack}
        backgroundClass={state.battleTheme?.background}
        wuxingIndicator={<WuxingIndicator lastElement={state.lastElement} harmonyStreak={state.harmonyStreak ?? 0} />}
        opponentPanel={
          <OpponentInfoPanel
            opponents={state.opponents}
            tierStructure={state.judge.tierStructure}
            judgeEffects={state.judge.effects}
            selectableOpponentIds={targeting?.isOpponentTargeting ? targeting.selectableOpponentIds : undefined}
            selectedOpponentId={targeting?.targetOpponentId ?? undefined}
            onOpponentClick={targeting?.isOpponentTargeting ? (id: string) => {
              targeting.confirmOpponentTarget?.(id);
            } : undefined}
          />
        }
        judgePanel={
          <JudgePanel
            judgeName={state.judge.name}
            patience={state.patience}
            maxPatience={40}
            playerStanding={state.player.standing}
            opponentStanding={state.opponents[0]?.standing ?? { currentTier: 0, favorInCurrentTier: 0 }}
            opponents={state.opponents}
            tierStructure={state.judge.tierStructure}
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
            removedCount={state.player.removedFromGame.length}
            onDeckClick={() => openPileViewer('deck')}
            onDiscardClick={() => openPileViewer('discard')}
            onRemovedClick={() => openPileViewer('removed')}
          />
        }
        hand={
          <HandDisplay
            cards={state.player.hand}
            patience={state.patience}
            playerFace={state.player.face}
            playerPoise={state.player.poise}
            gameState={state}
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
            statuses={state.statuses.filter(s => s.owner === 'player')}
          />
        }
      />

      {/* Targeting Overlay (only for hand card targeting, not opponent targeting) */}
      {targeting && !targeting.isOpponentTargeting && (
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

      {/* Opponent targeting banner */}
      {targeting?.isOpponentTargeting && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
          <div className="bg-red-900/90 border-2 border-red-500/50 rounded-xl px-6 py-3 backdrop-blur-sm shadow-2xl text-center">
            <div className="text-red-200 font-medium">
              Choose an opponent to target
            </div>
            {targeting.pendingCard && (
              <div className="text-xs text-red-400 mt-1">
                Playing: {targeting.pendingCard.name}
              </div>
            )}
            <button
              onClick={targeting.cancelTargeting}
              className="mt-2 px-4 py-1 text-xs bg-stone-700 text-stone-200 rounded-full hover:bg-stone-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Event Announcement */}
      {events && (
        <EventAnnouncement event={events.currentEvent} />
      )}

      {/* Pile Viewer Modal */}
      <PileViewerModal
        isOpen={pileViewer.isOpen}
        pileType={pileViewer.type}
        cards={getPileCards(pileViewer.type)}
        onClose={closePileViewer}
      />
    </>
  );
}
