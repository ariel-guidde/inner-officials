import { useState, useCallback, useEffect } from 'react';
import { Screen } from './types/game';
import MainMenu from './components/menu/MainMenu';
import DeckView from './components/menu/DeckView';
import HowToPlay from './components/menu/HowToPlay';
import Settings from './components/menu/Settings';
import BattleArena from './components/game/BattleArena';
import BattleSummary from './components/game/BattleSummary';
import { useGameLogic, BattleConfig } from './hooks/useGameLogic';
import { useSession } from './hooks/useSession';
import { useAudio } from './hooks/useAudio';

const DEFAULT_CAMPAIGN_BATTLES = 3;

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const {
    session,
    lastBattleResult,
    startSession,
    recordBattleResult,
    advanceToNextBattle,
  } = useSession(DEFAULT_CAMPAIGN_BATTLES);

  // Battle config based on session state
  const battleConfig: BattleConfig = {
    playerStartingFace: session.playerFaceCarryOver,
    opponentIndex: session.currentBattle - 1,
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
        recordBattleResult(result);
        setCurrentScreen('battle-summary');
      }
    }
  }, [state.isGameOver, currentScreen, getBattleResult, recordBattleResult]);

  const handleNavigate = (screen: 'deck' | 'how-to-play' | 'settings' | 'battle') => {
    if (screen === 'battle') {
      // Start new campaign
      startSession(DEFAULT_CAMPAIGN_BATTLES);
      startNewBattle({
        playerStartingFace: 60,
        opponentIndex: 0,
      });
    }
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('menu');
  };

  const handleContinueCampaign = useCallback(() => {
    advanceToNextBattle();
    startNewBattle({
      playerStartingFace: session.playerFaceCarryOver,
      opponentIndex: session.currentBattle, // This will be incremented after advanceToNextBattle
    });
    setCurrentScreen('battle');
  }, [advanceToNextBattle, startNewBattle, session.playerFaceCarryOver, session.currentBattle]);

  switch (currentScreen) {
    case 'menu':
      return <MainMenu onNavigate={handleNavigate} />;
    case 'deck':
      return <DeckView gameState={state} onBack={handleBack} />;
    case 'how-to-play':
      return <HowToPlay onBack={handleBack} />;
    case 'settings':
      return <Settings onBack={handleBack} />;
    case 'battle':
      return (
        <BattleArena
          onBack={handleBack}
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
          onContinue={handleContinueCampaign}
          onReturnToMenu={handleBack}
        />
      ) : (
        <MainMenu onNavigate={handleNavigate} />
      );
    default:
      return <MainMenu onNavigate={handleNavigate} />;
  }
}

export default App
