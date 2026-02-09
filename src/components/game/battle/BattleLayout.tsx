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
  // Status bar components
  playerPanel: React.ReactNode;
  deckDisplay: React.ReactNode;
  actionBar: React.ReactNode;
  // Bottom
  hand: React.ReactNode;
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
    <div className="relative h-screen bg-stone-950 text-stone-100 font-serif overflow-hidden flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 to-stone-950 pointer-events-none" />

      {/* Top Row */}
      <div className="relative z-10 flex items-start justify-between p-4 pb-0 shrink-0">
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

      {/* Center: Judge Panel (flex-1 to fill available space) */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 min-h-0">
        {judgePanel}
      </div>

      {/* Status Bar: Player Info | Active Effects | Deck | End Turn */}
      {/* pb-48 creates space for the fixed-position hand below */}
      <div className="relative z-20 shrink-0 px-4 pb-48">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Player info + active effects */}
          <div className="flex items-center gap-3">
            {playerPanel}
            {activeEffectsDisplay}
          </div>

          {/* Center: Deck info */}
          <div className="flex-shrink-0">
            {deckDisplay}
          </div>

          {/* Right: End turn */}
          <div className="flex-shrink-0">
            {actionBar}
          </div>
        </div>
      </div>

      {/* Hand - fixed at bottom center */}
      {hand}

      {/* Debug Panel */}
      {debugPanel}
    </div>
  );
}
