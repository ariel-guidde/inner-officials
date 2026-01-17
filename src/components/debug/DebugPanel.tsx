import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X } from 'lucide-react';
import { GameState, StateHistoryEntry } from '../../types/game';
import { combatLogger } from '../../lib/debug/combatLogger';
import StateInspector from './StateInspector';
import LogViewer from './LogViewer';
import HistoryTimeline from './HistoryTimeline';

type Tab = 'state' | 'log' | 'history';

interface DebugPanelProps {
  state: GameState;
  deckInfo: { deck: number; hand: number; discard: number };
  history: StateHistoryEntry[];
}

export default function DebugPanel({ state, deckInfo, history }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('state');

  const handleExportJSON = () => {
    const json = combatLogger.exportToJSON();
    downloadFile(json, 'combat-log.json', 'application/json');
  };

  const handleExportCSV = () => {
    const csv = combatLogger.exportToCSV();
    downloadFile(csv, 'combat-log.csv', 'text/csv');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'state', label: 'State' },
    { id: 'log', label: 'Log' },
    { id: 'history', label: 'History' },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 p-3 bg-stone-800 hover:bg-stone-700 rounded-full shadow-lg border border-stone-700 transition-colors"
        title="Toggle Debug Panel"
      >
        <Bug className="w-5 h-5 text-amber-400" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 bottom-0 w-96 bg-stone-900 border-l border-stone-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <h3 className="text-lg font-bold text-amber-400">Debug Panel</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-stone-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-4">
              {activeTab === 'state' && <StateInspector state={state} deckInfo={deckInfo} />}
              {activeTab === 'log' && (
                <LogViewer onExportJSON={handleExportJSON} onExportCSV={handleExportCSV} />
              )}
              {activeTab === 'history' && <HistoryTimeline history={history} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
