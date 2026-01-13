import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Hourglass, Shield, ArrowLeft } from 'lucide-react';
import { useGameLogic } from '../../hooks/useGameLogic';
import ElementIcon from './ElementIcon';
import WuxingCompass from './WuxingCompass';

interface BattleArenaProps {
  onBack: () => void;
}

export default function BattleArena({ onBack }: BattleArenaProps) {
  const { state, playCard, endTurn } = useGameLogic();

  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-100 p-6 font-serif overflow-hidden">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 p-2 hover:bg-stone-800 rounded-lg transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Top Bar: Resources */}
      <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
        <ResourceDisplay 
          icon={<Heart className="text-rose-500" />} 
          label="Face" 
          current={state.player.face} 
          max={state.player.maxFace} 
          color="bg-rose-500" 
        />
        <ResourceDisplay 
          icon={<Shield className="text-blue-500" />} 
          label="Composure" 
          current={state.player.poise} 
          max={100} 
          color="bg-blue-500" 
        />
        <ResourceDisplay 
          icon={<Hourglass className="text-amber-500" />} 
          label="Patience" 
          current={state.patience} 
          max={40} 
          color="bg-amber-500" 
        />
        <ResourceDisplay 
          icon={<Sparkles className="text-purple-500" />} 
          label="Favor" 
          current={state.player.favor} 
          max={100} 
          color="bg-purple-500" 
        />
      </div>

      {/* Opponent Section */}
      <div className="max-w-2xl mx-auto text-center mt-8 mb-16 p-8 bg-stone-900/40 border border-stone-800 rounded-3xl backdrop-blur-md">
        <h2 className="text-3xl text-amber-100 mb-4">{state.opponent.name}</h2>
        
        {/* Opponent Face */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="text-sm uppercase tracking-widest text-stone-500">Composure</div>
          <div className="text-xl font-mono text-rose-400">{state.opponent.face} / {state.opponent.maxFace}</div>
        </div>

        {/* Opponent Favor */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-tighter text-stone-400 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Opponent Favor</span>
            <span className="ml-auto font-mono text-stone-200">{state.opponent.favor}/100</span>
          </div>
          <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(state.opponent.favor / 100) * 100}%` }}
              className="h-full bg-purple-500"
            />
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={state.opponent.currentIntention?.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-block px-6 py-2 rounded-full border ${state.opponent.isShocked > 0 ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-red-500/50 text-red-400 bg-red-500/5'}`}
          >
            {state.opponent.isShocked > 0 ? "Shocked: Stammering..." : `Intention: ${state.opponent.currentIntention?.name}`}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Wuxing Compass */}
      <div className="max-w-xl mx-auto mb-12">
        <WuxingCompass lastElement={state.lastElement} />
      </div>

      {/* Hand / Cards */}
      <div className="fixed bottom-24 left-0 right-0 px-8 overflow-x-auto overflow-y-visible">
        <div className="flex justify-center items-end min-h-[280px] pb-4">
          {state.player.hand.length === 0 ? (
            <div className="text-stone-500 text-center py-8">
              No cards in hand. Click "End Turn" to draw a new hand.
            </div>
          ) : (
            <div className="relative flex justify-center items-end" style={{ width: `${Math.max(300, state.player.hand.length * 60)}px` }}>
              {state.player.hand.map((card, index) => {
                const canAfford = state.patience >= card.patienceCost && state.player.face >= card.faceCost;
                const totalCards = state.player.hand.length;
                const centerIndex = (totalCards - 1) / 2;
                const offset = (index - centerIndex) * 60;
                const rotation = (index - centerIndex) * 8;
                const zIndex = totalCards - Math.abs(index - centerIndex);
                
                return (
                  <motion.button
                    key={card.id}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={canAfford ? { y: -40, scale: 1.1, zIndex: 100 } : {}}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                    onClick={() => canAfford && playCard(card)}
                    disabled={!canAfford}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${offset}px)`,
                      transform: `translateX(-50%) rotate(${rotation}deg)`,
                      zIndex: zIndex,
                    }}
                    className={`relative w-48 h-64 bg-stone-900 border rounded-2xl p-4 text-left shadow-2xl flex flex-col justify-between group overflow-hidden transition-all origin-bottom ${
                      canAfford 
                        ? 'border-stone-800 hover:border-amber-600 cursor-pointer' 
                        : 'border-stone-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <ElementIcon element={card.element} size="sm" />
                      <div className="text-xs text-stone-500 font-mono">
                        {card.patienceCost}P / {card.faceCost}F
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg leading-tight mb-2 group-hover:text-amber-200 transition-colors">{card.name}</h3>
                      <p className="text-xs text-stone-400 italic font-sans leading-relaxed">{card.description}</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <ElementIcon element={card.element} size="lg" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* End Turn Button */}
      <div className="fixed bottom-6 left-0 right-0 px-8 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endTurn}
          disabled={state.isGameOver || state.player.hand.length === 0}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
            state.isGameOver || state.player.hand.length === 0
              ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-500'
          }`}
        >
          End Turn
        </motion.button>
      </div>

      {/* Game Over Overlay */}
      {state.isGameOver && (
        <div className="fixed inset-0 bg-stone-950/90 flex items-center justify-center z-50 backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-6xl text-amber-100 mb-4">{state.winner === 'player' ? 'VICTORY' : 'DEFEAT'}</h1>
            <p className="text-stone-400 mb-8">The judges have reached a verdict.</p>
            <button 
              onClick={onBack}
              className="px-8 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-500 transition-colors"
            >
              Return to Palace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ResourceDisplayProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  color: string;
}

function ResourceDisplay({ icon, label, current, max, color }: ResourceDisplayProps) {
  const percent = (current / max) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-tighter text-stone-400">
        {icon} <span>{label}</span> <span className="ml-auto font-mono text-stone-200">{current}/{max}</span>
      </div>
      <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}