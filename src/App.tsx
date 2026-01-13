import { useState } from 'react';
import { Screen } from './types/game';
import MainMenu from './components/menu/MainMenu';
import DeckView from './components/menu/DeckView';
import HowToPlay from './components/menu/HowToPlay';
import BattleArena from './components/game/BattleArena';
import { useGameLogic } from './hooks/useGameLogic';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const { state } = useGameLogic();

  const handleNavigate = (screen: 'deck' | 'how-to-play' | 'battle') => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('menu');
  };

  switch (currentScreen) {
    case 'menu':
      return <MainMenu onNavigate={handleNavigate} />;
    case 'deck':
      return <DeckView gameState={state} onBack={handleBack} />;
    case 'how-to-play':
      return <HowToPlay onBack={handleBack} />;
    case 'battle':
      return <BattleArena onBack={handleBack} />;
    default:
      return <MainMenu onNavigate={handleNavigate} />;
  }
}

export default App
