import { useState, useCallback, useEffect, useRef } from 'react';
import { Screen, CoreArgument } from './types/game';
import MainMenu from './components/menu/MainMenu';
import DeckView from './components/menu/DeckView';
import HowToPlay from './components/menu/HowToPlay';
import Settings from './components/menu/Settings';
import PreBattle from './components/menu/PreBattle';
import BattleArena from './components/game/BattleArena';
import BattleSummary from './components/game/BattleSummary';
import CampaignMenu from './components/menu/CampaignMenu';
import CampaignScreen from './components/campaign/CampaignScreen';
import AvatarBuilder from './components/menu/AvatarBuilder';
import { useGameLogic, BattleConfig } from './hooks/useGameLogic';
import { useSession } from './hooks/useSession';
import { useAudio } from './hooks/useAudio';
import { usePlayerSave } from './hooks/usePlayerSave';
import { useCampaign } from './hooks/useCampaign';
import { OPPONENTS } from './data/opponents';

const DEFAULT_CAMPAIGN_BATTLES = 3;

function pickRandomOpponentIndices(): number[] {
  const count = Math.random() < 0.5 ? 1 : 2;
  const indices: number[] = [];
  const available = Array.from({ length: OPPONENTS.length }, (_, i) => i);
  for (let i = 0; i < count && available.length > 0; i++) {
    const pick = Math.floor(Math.random() * available.length);
    indices.push(available[pick]);
    available.splice(pick, 1);
  }
  return indices;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [isCampaignBattle, setIsCampaignBattle] = useState(false);
  const [preBattleOpponentIndices, setPreBattleOpponentIndices] = useState<number[]>([0]);
  const campaignBattleEventRef = useRef<string | null>(null);

  const playerSave = usePlayerSave();
  const {
    session,
    lastBattleResult,
    startSession,
    recordBattleResult,
    advanceToNextBattle,
  } = useSession(DEFAULT_CAMPAIGN_BATTLES);

  // Campaign state
  const {
    campaign,
    startNewCampaign,
    performAction,
    makeEventChoice,
    skipEvent,
    canSkipEvent,
    canAffordChoice,
    resolveEvent,
    dismissOutcomeMessage,
    selectDay,
    restUntilDawn,
    isActionAvailable,
    clearPendingBattle,
    recordCampaignBattleResult,
    isCampaignOver,
    segmentsRemainingToday,
    currentPeriod,
    isNightTime,
  } = useCampaign();

  // Track if there's an active campaign (day > 1 or segment > 0 means started)
  const hasSavedCampaign = campaign.currentDay > 1 || campaign.currentSegment > 0;

  // Battle config based on session state and active deck (with campaign bonuses)
  const battleConfig: BattleConfig = {
    playerStartingFace: session.playerFaceCarryOver,
    opponentIndex: session.currentBattle - 1,
    deckCardIds: playerSave.activeDeck?.cardIds,
    // Campaign bonuses applied when in campaign battle
    ...(isCampaignBattle && {
      startingFavor: campaign.battleBonuses.startingFavor,
      startingPatience: campaign.battleBonuses.patienceBonus,
      opponentStartingShame: campaign.battleBonuses.opponentShame,
    }),
  };

  const { state, playCard, endTurn, startNewBattle, getBattleResult, debug, targeting, events } = useGameLogic(battleConfig);
  const { playBattleMusic, stopMusic } = useAudio();

  // Handle battle music
  useEffect(() => {
    if (currentScreen === 'battle') {
      playBattleMusic(session.currentBattle);
    } else {
      stopMusic();
    }
  }, [currentScreen, session.currentBattle, playBattleMusic, stopMusic]);

  // Watch for battle end to record result
  useEffect(() => {
    if (state.isGameOver && currentScreen === 'battle') {
      const result = getBattleResult();
      if (result) {
        if (isCampaignBattle && campaignBattleEventRef.current) {
          // Record campaign battle result
          recordCampaignBattleResult(result.won, campaignBattleEventRef.current);
          campaignBattleEventRef.current = null;
          setIsCampaignBattle(false);
          setCurrentScreen('campaign');
        } else {
          // Regular battle session
          recordBattleResult(result);
          setCurrentScreen('battle-summary');
        }
      }
    }
  }, [state.isGameOver, currentScreen, getBattleResult, recordBattleResult, isCampaignBattle, recordCampaignBattleResult]);

  // Handle pending campaign battles
  useEffect(() => {
    if (campaign.pendingBattle && currentScreen === 'campaign') {
      const { opponentIndex, eventId } = campaign.pendingBattle;
      campaignBattleEventRef.current = eventId;
      setIsCampaignBattle(true);
      clearPendingBattle();

      // Start battle with campaign bonuses
      startSession(1); // Single battle
      startNewBattle({
        playerStartingFace: 60,
        opponentIndex,
        deckCardIds: playerSave.activeDeck?.cardIds,
        startingStanding: campaign.battleBonuses.startingFavor, // Now starting standing
        startingPatience: campaign.battleBonuses.patienceBonus,
        opponentStartingShame: campaign.battleBonuses.opponentShame,
      });
      setCurrentScreen('battle');
    }
  }, [campaign.pendingBattle, currentScreen, clearPendingBattle, startSession, startNewBattle, playerSave.activeDeck, campaign.battleBonuses]);

  const handleNavigate = (screen: 'deck' | 'how-to-play' | 'settings' | 'battle' | 'campaign-menu' | 'avatar-builder') => {
    if (screen === 'battle') {
      // Quick battle: go to pre-battle screen first
      setIsCampaignBattle(false);
      setPreBattleOpponentIndices(pickRandomOpponentIndices());
      setCurrentScreen('pre-battle');
      return;
    }
    setCurrentScreen(screen);
  };

  const handleStartBattle = (coreArgument: CoreArgument) => {
    startSession(DEFAULT_CAMPAIGN_BATTLES);
    startNewBattle({
      playerStartingFace: 60,
      opponentIndices: preBattleOpponentIndices,
      deckCardIds: playerSave.activeDeck?.cardIds,
      playerCoreArgument: coreArgument,
    });
    setCurrentScreen('battle');
  };

  const handleStartNewCampaign = () => {
    startNewCampaign();
    setCurrentScreen('campaign');
  };

  const handleResumeCampaign = () => {
    setCurrentScreen('campaign');
  };

  const handleBack = () => {
    setCurrentScreen('menu');
  };

  const handleCampaignMenuBack = () => {
    setCurrentScreen('menu');
  };

  const handleCampaignBack = () => {
    setCurrentScreen('campaign-menu');
  };

  const handleContinueBattleSession = useCallback(() => {
    advanceToNextBattle();
    startNewBattle({
      playerStartingFace: session.playerFaceCarryOver,
      opponentIndex: session.currentBattle,
      deckCardIds: playerSave.activeDeck?.cardIds,
    });
    setCurrentScreen('battle');
  }, [advanceToNextBattle, startNewBattle, session.playerFaceCarryOver, session.currentBattle, playerSave.activeDeck]);

  switch (currentScreen) {
    case 'menu':
      return <MainMenu onNavigate={handleNavigate} />;
    case 'deck':
      return <DeckView playerSave={playerSave} onBack={handleBack} />;
    case 'how-to-play':
      return <HowToPlay onBack={handleBack} />;
    case 'settings':
      return <Settings onBack={handleBack} />;
    case 'pre-battle':
      return (
        <PreBattle
          opponentIndices={preBattleOpponentIndices}
          onStartBattle={handleStartBattle}
          onBack={handleBack}
        />
      );
    case 'battle':
      return (
        <BattleArena
          onBack={isCampaignBattle ? () => setCurrentScreen('campaign') : handleBack}
          session={session}
          state={state}
          playCard={playCard}
          endTurn={endTurn}
          debug={debug}
          targeting={targeting}
          events={events}
        />
      );
    case 'battle-summary':
      return lastBattleResult ? (
        <BattleSummary
          result={lastBattleResult}
          session={session}
          onContinue={handleContinueBattleSession}
          onReturnToMenu={handleBack}
        />
      ) : (
        <MainMenu onNavigate={handleNavigate} />
      );
    case 'campaign-menu':
      return (
        <CampaignMenu
          onBack={handleCampaignMenuBack}
          onNewCampaign={handleStartNewCampaign}
          onContinueCampaign={handleResumeCampaign}
          hasSavedCampaign={hasSavedCampaign}
        />
      );
    case 'avatar-builder':
      return <AvatarBuilder onBack={handleBack} />;
    case 'campaign':
      return (
        <CampaignScreen
          campaign={campaign}
          onBack={handleCampaignBack}
          onPerformAction={performAction}
          onMakeEventChoice={makeEventChoice}
          onResolveEvent={resolveEvent}
          onSkipEvent={skipEvent}
          onDismissMessage={dismissOutcomeMessage}
          onSelectDay={selectDay}
          onRestUntilDawn={restUntilDawn}
          isActionAvailable={isActionAvailable}
          canAffordChoice={canAffordChoice}
          canSkipEvent={canSkipEvent}
          isCampaignOver={isCampaignOver}
          segmentsRemainingToday={segmentsRemainingToday}
          currentPeriod={currentPeriod}
          isNightTime={isNightTime}
        />
      );
    default:
      return <MainMenu onNavigate={handleNavigate} />;
  }
}

export default App
