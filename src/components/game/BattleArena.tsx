import { useState, useCallback, useEffect, useRef } from 'react';
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
// import EventAnnouncement from './battle/EventAnnouncement'; // Removed - animations show everything now
import ActiveEffectsDisplay from './battle/ActiveEffectsDisplay';
import PileViewerModal, { PileType } from './battle/PileViewerModal';
import { ElementParticlesContainer } from '../effects/ElementParticles';
import { IntentionAnimationContainer } from '../effects/IntentionAnimation';
import { JudgeDecreeAnimationContainer } from '../effects/JudgeDecreeAnimation';
import { StatusEffectAnimationContainer } from '../effects/StatusEffectAnimation';
import { TierAdvancementAnimationContainer } from '../effects/TierAdvancementAnimation';
import { GameState, Card, SessionState, TargetRequirement, GameEvent } from '../../types/game';
import { DebugInterface } from '../../hooks/useGameLogic';
import { useBattleEffects } from '../../hooks/useBattleEffects';

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

export default function BattleArena({ onBack, session, state, playCard, endTurn, debug, targeting }: BattleArenaProps) {
  // const isBlocking = events?.isBlocking ?? false; // Removed - animations are non-blocking now
  const [pileViewer, setPileViewer] = useState<{ type: PileType; isOpen: boolean }>({
    type: 'deck',
    isOpen: false,
  });

  const battleEffects = useBattleEffects();
  const previousOpponentsRef = useRef(state.opponents);
  const previousDecreesRef = useRef(state.judge.effects.activeDecrees);
  const previousStatusesRef = useRef(state.statuses);
  const previousPlayerTierRef = useRef(state.player.standing.currentTier);

  // Watch for player tier advancement
  useEffect(() => {
    const prevTier = previousPlayerTierRef.current;
    const currentTier = state.player.standing.currentTier;

    if (currentTier > prevTier) {
      // Player advanced a tier!
      const tierDef = state.judge.tierStructure.find(t => t.tierNumber === currentTier);
      if (tierDef && tierDef.tierName) {
        battleEffects.triggerTierAdvancement(currentTier, tierDef.tierName);
      }
    }

    previousPlayerTierRef.current = currentTier;
  }, [state.player.standing.currentTier, state.judge.tierStructure, battleEffects]);

  // Watch for new statuses being added
  useEffect(() => {
    const prevStatuses = previousStatusesRef.current;
    const currentStatuses = state.statuses;

    // Check for new statuses
    if (currentStatuses.length > prevStatuses.length) {
      // Find newly added statuses
      const newStatuses = currentStatuses.filter(
        curr => !prevStatuses.some(prev => prev.id === curr.id)
      );

      // Trigger animation for each new status
      newStatuses.forEach(status => {
        // Determine if positive (buff) or negative (debuff)
        // Check if any modifier has positive add operation
        const isPositive = status.modifiers?.some(
          m => m.op === 'add' && m.value > 0
        ) ?? false;
        battleEffects.triggerStatusEffect(status.name, status.owner, isPositive);
      });
    }

    previousStatusesRef.current = currentStatuses;
  }, [state.statuses, battleEffects]);

  // Watch for new judge decrees
  useEffect(() => {
    const prevDecrees = previousDecreesRef.current;
    const currentDecrees = state.judge.effects.activeDecrees;

    // Check if a new decree was added
    if (currentDecrees.length > prevDecrees.length) {
      const newDecree = currentDecrees[currentDecrees.length - 1];
      battleEffects.triggerJudgeDecree(newDecree.name, newDecree.description);
    }

    previousDecreesRef.current = currentDecrees;
  }, [state.judge.effects.activeDecrees, battleEffects]);

  // Watch for opponent intention changes (when they act)
  useEffect(() => {
    const prevOpponents = previousOpponentsRef.current;
    const currentOpponents = state.opponents;

    // Check if any opponent's current intention changed
    for (let i = 0; i < currentOpponents.length; i++) {
      const prev = prevOpponents[i];
      const curr = currentOpponents[i];

      if (prev && curr && prev.currentIntention && curr.currentIntention) {
        // If current intention changed, they just acted
        if (prev.currentIntention.name !== curr.currentIntention.name) {
          battleEffects.triggerIntentionAnimation(
            prev.currentIntention.name,
            prev.currentIntention.type,
            prev.currentIntention.value,
            curr.name
          );
        }
      }
    }

    previousOpponentsRef.current = currentOpponents;
  }, [state.opponents, battleEffects]);

  // Wrap playCard to trigger visual effects
  const handlePlayCard = useCallback((card: Card) => {
    // Trigger particle effect from center-bottom (hand position)
    const x = window.innerWidth / 2;
    const y = window.innerHeight - 100; // Above the hand
    battleEffects.triggerCardEffect(card, x, y);
    playCard(card);
  }, [playCard, battleEffects]);

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
            onPlayCard={handlePlayCard}
            disabled={targeting?.isTargeting ?? false}
          />
        }
        actionBar={
          <ActionBar
            onEndTurn={endTurn}
            disabled={state.isGameOver || (targeting?.isTargeting ?? false)}
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

      {/* Event Announcement - REMOVED: Animations show everything now */}
      {/* {events && (
        <EventAnnouncement event={events.currentEvent} />
      )} */}

      {/* Pile Viewer Modal */}
      <PileViewerModal
        isOpen={pileViewer.isOpen}
        pileType={pileViewer.type}
        cards={getPileCards(pileViewer.type)}
        onClose={closePileViewer}
      />

      {/* Particle Effects */}
      <ElementParticlesContainer
        effects={battleEffects.particleEffects}
        onEffectComplete={battleEffects.removeParticleEffect}
      />

      {/* Intention Animations */}
      <IntentionAnimationContainer
        animations={battleEffects.intentionAnimations}
        onAnimationComplete={battleEffects.removeIntentionAnimation}
      />

      {/* Judge Decree Animations */}
      <JudgeDecreeAnimationContainer
        animations={battleEffects.judgeDecreeAnimations}
        onAnimationComplete={battleEffects.removeJudgeDecreeAnimation}
      />

      {/* Status Effect Animations */}
      <StatusEffectAnimationContainer
        animations={battleEffects.statusEffectAnimations}
        onAnimationComplete={battleEffects.removeStatusEffectAnimation}
      />

      {/* Tier Advancement Animation */}
      <TierAdvancementAnimationContainer
        animation={battleEffects.tierAdvancementAnimation}
        onAnimationComplete={battleEffects.removeTierAdvancementAnimation}
      />
    </>
  );
}
