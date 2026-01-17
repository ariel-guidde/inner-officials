interface GameOverOverlayProps {
  winner: 'player' | 'opponent' | null;
  onBack: () => void;
}

export default function GameOverOverlay({ winner, onBack }: GameOverOverlayProps) {
  return (
    <div className="fixed inset-0 bg-stone-950/90 flex items-center justify-center z-50 backdrop-blur-xl">
      <div className="text-center">
        <h1 className="text-6xl text-amber-100 mb-4">
          {winner === 'player' ? 'VICTORY' : 'DEFEAT'}
        </h1>
        <p className="text-stone-400 mb-8">The judges have reached a verdict.</p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-500 transition-colors"
        >
          Return to Palace
        </button>
      </div>
    </div>
  );
}
