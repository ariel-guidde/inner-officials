import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Crown, Sparkles, BookOpen, Swords, CheckCircle } from 'lucide-react';
import { CalendarEvent, formatHour } from '../../types/campaign';

interface DayInfoModalProps {
  day: number;
  currentDay: number;
  events: CalendarEvent[];
  bossEvent: CalendarEvent;
  bossIntel: string[];
  onClose: () => void;
}

function getEventIcon(type: CalendarEvent['type']) {
  switch (type) {
    case 'boss':
      return <Crown className="w-5 h-5 text-red-400" />;
    case 'opportunity':
      return <Sparkles className="w-5 h-5 text-amber-400" />;
    case 'story':
      return <BookOpen className="w-5 h-5 text-purple-400" />;
    case 'battle':
      return <Swords className="w-5 h-5 text-blue-400" />;
  }
}

export default function DayInfoModal({
  day,
  currentDay,
  events,
  bossEvent,
  bossIntel,
  onClose,
}: DayInfoModalProps) {
  const dayEvents = events.filter(e => e.day === day);
  const isBossDay = bossEvent.day === day;
  const isPast = day < currentDay;
  const isToday = day === currentDay;

  if (isBossDay) {
    dayEvents.push(bossEvent);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-stone-900 rounded-xl border border-stone-700 max-w-lg w-full mx-4 p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold
              ${isToday ? 'bg-amber-900/60 text-amber-200 ring-2 ring-amber-500' :
                isPast ? 'bg-stone-800 text-stone-500' :
                'bg-stone-800 text-stone-300'}
            `}>
              {day}
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-100">Day {day}</h2>
              <p className="text-stone-400 text-sm">
                {isToday ? 'Today' : isPast ? 'Past' : `${day - currentDay} days away`}
              </p>
            </div>
          </div>

          {/* Events for this day */}
          {dayEvents.length > 0 ? (
            <div className="space-y-3 mb-4">
              <h3 className="text-amber-200 font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </h3>
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`
                    p-3 rounded-lg border
                    ${event.resolved
                      ? 'bg-stone-800/50 border-stone-700 opacity-60'
                      : event.type === 'boss'
                        ? 'bg-red-900/20 border-red-700/50'
                        : 'bg-stone-800 border-stone-700'}
                  `}
                >
                  <div className="flex items-start gap-2">
                    {getEventIcon(event.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-200 font-medium">{event.name}</span>
                        {event.resolved && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      {event.hour && (
                        <div className="text-stone-500 text-xs flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatHour(event.hour)}
                        </div>
                      )}
                      <p className="text-stone-400 text-sm mt-1">{event.description}</p>

                      {/* Show notes/intel about this event */}
                      {event.notes && event.notes.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-stone-700">
                          <div className="text-xs text-amber-400 mb-1">What you know:</div>
                          <ul className="space-y-1">
                            {event.notes.map((note, i) => (
                              <li key={i} className="text-xs text-stone-400 flex items-start gap-1">
                                <span className="text-amber-500">•</span>
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Show choice made if resolved */}
                      {event.resolved && event.selectedChoiceId && event.choices && (
                        <div className="mt-2 pt-2 border-t border-stone-700">
                          <div className="text-xs text-green-400">
                            Choice made: {event.choices.find(c => c.id === event.selectedChoiceId)?.label}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-stone-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No events scheduled for this day.</p>
            </div>
          )}

          {/* Boss intel for boss day */}
          {isBossDay && bossIntel.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-700">
              <h3 className="text-amber-200 font-semibold mb-2">Intelligence Gathered</h3>
              <ul className="space-y-1">
                {bossIntel.map((intel, i) => (
                  <li key={i} className="text-sm text-stone-300 flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {intel}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-4 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-lg text-stone-300 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
