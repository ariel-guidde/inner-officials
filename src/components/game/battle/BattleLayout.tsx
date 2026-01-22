import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BattleLayoutProps {
  onBack: () => void;
  // Top left
  wuxingIndicator: React.ReactNode;
  // Top right
  opponentPanel: React.ReactNode;
  // Center
  judgePanel: React.ReactNode;
  // Bottom left
  playerPanel: React.ReactNode;
  // Bottom center-left (deck info)
  deckDisplay: React.ReactNode;
  // Bottom center
  hand: React.ReactNode;
  actionBar: React.ReactNode;
  // Campaign progress indicator
  campaignProgress?: React.ReactNode;
  // Debug panel
  debugPanel?: React.ReactNode;
  // Active effects display
  activeEffectsDisplay?: React.ReactNode;
}

export default function BattleLayout({
  onBack,
  wuxingIndicator,
  opponentPanel,
  judgePanel,
  playerPanel,
  deckDisplay,
  hand,
  actionBar,
  campaignProgress,
  debugPanel,
  activeEffectsDisplay,
}: BattleLayoutProps) {
  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-100 font-serif overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 to-stone-950" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-4">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-8">
          {/* Top Left: Back button + Wuxing */}
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {wuxingIndicator}
          </div>

          {/* Top Center: Campaign Progress */}
          {campaignProgress && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              {campaignProgress}
            </div>
          )}

          {/* Top Right: Opponent */}
          <div>{opponentPanel}</div>
        </div>

        {/* Center: Judge Panel */}
        <div className="flex justify-center mb-8">
          {judgePanel}
        </div>

        {/* Bottom Left: Player Info (fixed position) */}
        <div className="fixed bottom-4 left-4 z-20">
          {playerPanel}
        </div>

        {/* Active Effects Display (below player panel) */}
        {activeEffectsDisplay && (
          <div className="fixed bottom-40 left-4 z-20 w-64">
            {activeEffectsDisplay}
          </div>
        )}

        {/* Bottom: Deck/Discard display (above hand area) */}
        <div className="fixed bottom-52 left-1/2 -translate-x-1/2 z-20">
          {deckDisplay}
        </div>

        {/* Bottom Right: End Turn (fixed position, above hand area) */}
        <div className="fixed bottom-52 right-4 z-20">
          {actionBar}
        </div>
      </div>

      {/* Hand - fixed at bottom center */}
      {hand}

      {/* Debug Panel */}
      {debugPanel}
    </div>
  );
}
