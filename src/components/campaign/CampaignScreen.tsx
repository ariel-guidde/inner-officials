import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, Crown, Star, Swords, TrendingUp } from 'lucide-react';
import { CampaignState, BattleBonuses, TimePeriod, CampaignResources } from '../../types/campaign';
import ResourceBar from './ResourceBar';
import ChineseCalendar from './ChineseCalendar';
import ActionPanel from './ActionPanel';
import EventModal from './EventModal';
import TimeCircle from './TimeCircle';
import DayInfoModal from './DayInfoModal';

interface CampaignScreenProps {
  campaign: CampaignState;
  onBack: () => void;
  onPerformAction: (actionId: string) => void;
  onMakeEventChoice: (eventId: string, choiceId: string) => void;
  onResolveEvent: (eventId: string) => void;
  onSkipEvent: (eventId: string) => void;
  onDismissMessage: () => void;
  onSelectDay: (day: number | null) => void;
  onRestUntilDawn: () => void;
  isActionAvailable: (actionId: string) => boolean;
  canAffordChoice: (choice: { resourceCost?: Partial<CampaignResources>; faceCost?: number }) => boolean;
  canSkipEvent: (eventId: string) => boolean;
  isCampaignOver: boolean;
  segmentsRemainingToday: number;
  currentPeriod: TimePeriod;
  isNightTime: boolean;
}

function formatBonusSummary(bonuses: BattleBonuses): string[] {
  const result: string[] = [];
  if (bonuses.startingFavor > 0) result.push(`+${bonuses.startingFavor} Favor`);
  if (bonuses.opponentShame > 0) result.push(`+${bonuses.opponentShame} Shame`);
  if (bonuses.patienceBonus > 0) result.push(`+${bonuses.patienceBonus} Patience`);
  if (bonuses.extraCards.length > 0) result.push(`+${bonuses.extraCards.length} Cards`);
  return result;
}

export default function CampaignScreen({
  campaign,
  onBack,
  onPerformAction,
  onMakeEventChoice,
  onResolveEvent,
  onSkipEvent,
  onDismissMessage,
  onSelectDay,
  onRestUntilDawn,
  isActionAvailable,
  canAffordChoice,
  canSkipEvent,
  isCampaignOver,
  segmentsRemainingToday,
  currentPeriod,
  isNightTime,
}: CampaignScreenProps) {
  const handleEventClose = () => {
    if (campaign.activeEvent && !campaign.activeEvent.choices?.length) {
      onResolveEvent(campaign.activeEvent.id);
    }
  };

  const bonusSummary = formatBonusSummary(campaign.battleBonuses);
  const hasBonuses = bonusSummary.length > 0;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-serif">
      {/* Header */}
      <div className="bg-stone-900/80 backdrop-blur border-b border-stone-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-stone-400 hover:text-amber-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Menu</span>
            </button>
            <h1 className="text-xl font-bold text-amber-100">
              Day {campaign.currentDay} of {campaign.maxDay}
            </h1>
            <ResourceBar resources={campaign.resources} face={campaign.face} maxFace={campaign.maxFace} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Outcome Message Toast */}
        <AnimatePresence>
          {campaign.lastOutcomeMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-amber-900/40 border border-amber-600/50 rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <p className="text-amber-200">{campaign.lastOutcomeMessage}</p>
              <button
                onClick={onDismissMessage}
                className="text-amber-400 hover:text-amber-200 text-sm ml-4"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accumulated Bonuses Banner */}
        {hasBonuses && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-gradient-to-r from-amber-900/30 to-purple-900/30 border border-amber-600/30 rounded-lg px-4 py-2 flex items-center gap-3"
          >
            <Star className="w-5 h-5 text-amber-400" />
            <span className="text-amber-200 text-sm">Banquet Bonuses:</span>
            <span className="text-amber-100 text-sm font-medium">
              {bonusSummary.join(' | ')}
            </span>
          </motion.div>
        )}

        {/* Boss Day Arrival */}
        {isCampaignOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-900/30 border border-red-600/50 rounded-xl p-6 text-center"
          >
            <Crown className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-amber-100 mb-2">The Emperor's Banquet Awaits</h2>
            <p className="text-stone-300 mb-4">
              Day 30 has arrived. It is time for the monthly banquet.
              {hasBonuses && (
                <span className="block mt-2 text-amber-200">
                  Your preparation grants you: {bonusSummary.join(', ')}
                </span>
              )}
            </p>
            <button
              onClick={() => onMakeEventChoice(campaign.bossEvent.id, 'enter-banquet')}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <Swords className="w-5 h-5" />
              Enter the Banquet
            </button>
          </motion.div>
        )}

        {/* Time Circle */}
        {!isCampaignOver && (
          <div className="mb-4">
            <TimeCircle
              currentSegment={campaign.currentSegment}
              segmentsRemaining={segmentsRemainingToday}
              currentPeriod={currentPeriod}
              isNightTime={isNightTime}
              mustRest={campaign.mustRest}
              onRestUntilDawn={onRestUntilDawn}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Calendar & Intel */}
          <div className="space-y-4">
            <ChineseCalendar
              currentDay={campaign.currentDay}
              maxDay={campaign.maxDay}
              events={campaign.calendar}
              bossEvent={campaign.bossEvent}
              onSelectDay={onSelectDay}
            />

            {/* Boss Intel Section */}
            {campaign.bossIntel.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900/60 backdrop-blur rounded-xl border border-stone-700 p-4"
              >
                <h3 className="text-amber-200 text-lg font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Banquet Intelligence
                </h3>
                <ul className="space-y-1">
                  {campaign.bossIntel.map((intel, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-stone-300 text-sm flex items-start gap-2"
                    >
                      <span className="text-amber-500">•</span>
                      <span>{intel}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Battle Bonuses Detail */}
            {hasBonuses && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900/60 backdrop-blur rounded-xl border border-amber-700/30 p-4"
              >
                <h3 className="text-amber-200 text-lg font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Accumulated Advantages
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {campaign.battleBonuses.startingFavor > 0 && (
                    <div className="bg-stone-800 rounded-lg p-2">
                      <div className="text-stone-400">Starting Favor</div>
                      <div className="text-green-400 font-bold">+{campaign.battleBonuses.startingFavor}</div>
                    </div>
                  )}
                  {campaign.battleBonuses.opponentShame > 0 && (
                    <div className="bg-stone-800 rounded-lg p-2">
                      <div className="text-stone-400">Opponent Shame</div>
                      <div className="text-red-400 font-bold">+{campaign.battleBonuses.opponentShame}</div>
                    </div>
                  )}
                  {campaign.battleBonuses.patienceBonus > 0 && (
                    <div className="bg-stone-800 rounded-lg p-2">
                      <div className="text-stone-400">Starting Patience</div>
                      <div className="text-blue-400 font-bold">+{campaign.battleBonuses.patienceBonus}</div>
                    </div>
                  )}
                  {campaign.battleBonuses.extraCards.length > 0 && (
                    <div className="bg-stone-800 rounded-lg p-2">
                      <div className="text-stone-400">Special Cards</div>
                      <div className="text-purple-400 font-bold">+{campaign.battleBonuses.extraCards.length}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div>
            <ActionPanel
              actions={campaign.availableActions}
              currentSegment={campaign.currentSegment}
              segmentsRemaining={segmentsRemainingToday}
              isActionAvailable={isActionAvailable}
              onSelectAction={onPerformAction}
              mustRest={campaign.mustRest}
              isNightTime={isNightTime}
              disabled={isCampaignOver}
            />
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={campaign.activeEvent}
        resources={campaign.resources}
        face={campaign.face}
        canAffordChoice={canAffordChoice}
        canSkip={campaign.activeEvent ? canSkipEvent(campaign.activeEvent.id) : false}
        onMakeChoice={onMakeEventChoice}
        onSkipEvent={onSkipEvent}
        onClose={handleEventClose}
      />

      {/* Day Info Modal */}
      {campaign.selectedDay !== null && (
        <DayInfoModal
          day={campaign.selectedDay}
          currentDay={campaign.currentDay}
          events={campaign.calendar}
          bossEvent={campaign.bossEvent}
          bossIntel={campaign.bossIntel}
          onClose={() => onSelectDay(null)}
        />
      )}
    </div>
  );
}
