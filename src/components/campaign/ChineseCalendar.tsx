import { motion } from 'framer-motion';
import { CalendarEvent } from '../../types/campaign';
import { Crown, Sparkles, BookOpen, Swords, CheckCircle } from 'lucide-react';

interface ChineseCalendarProps {
  currentDay: number;
  maxDay: number;
  events: CalendarEvent[];
  bossEvent: CalendarEvent;
  onSelectDay: (day: number) => void;
}

function getEventIcon(type: CalendarEvent['type']) {
  switch (type) {
    case 'boss':
      return <Crown className="w-3 h-3" />;
    case 'opportunity':
      return <Sparkles className="w-3 h-3" />;
    case 'story':
      return <BookOpen className="w-3 h-3" />;
    case 'battle':
      return <Swords className="w-3 h-3" />;
    default:
      return null;
  }
}

function getEventColor(type: CalendarEvent['type'], resolved: boolean) {
  if (resolved) return 'text-stone-600';
  switch (type) {
    case 'boss':
      return 'text-red-400';
    case 'opportunity':
      return 'text-amber-400';
    case 'story':
      return 'text-purple-400';
    case 'battle':
      return 'text-blue-400';
    default:
      return 'text-stone-400';
  }
}

function getEventBorder(type: CalendarEvent['type'], resolved: boolean) {
  if (resolved) return 'border-stone-700';
  switch (type) {
    case 'boss':
      return 'border-red-500/50';
    case 'opportunity':
      return 'border-amber-500/50';
    case 'story':
      return 'border-purple-500/50';
    case 'battle':
      return 'border-blue-500/50';
    default:
      return 'border-stone-600';
  }
}

export default function ChineseCalendar({
  currentDay,
  maxDay,
  events,
  bossEvent,
  onSelectDay,
}: ChineseCalendarProps) {
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  // Create a map of day to events (can have multiple)
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const event of events) {
    if (event.day > 0) {
      const existing = eventsByDay.get(event.day) || [];
      eventsByDay.set(event.day, [...existing, event]);
    }
  }
  // Add boss event
  const bossEvents = eventsByDay.get(bossEvent.day) || [];
  eventsByDay.set(bossEvent.day, [...bossEvents, bossEvent]);

  return (
    <div className="bg-stone-900/60 backdrop-blur rounded-xl border border-stone-700 p-4">
      <h3 className="text-amber-200 text-lg font-semibold mb-3 text-center">
        Lunar Month Calendar
      </h3>
      <p className="text-stone-500 text-xs text-center mb-3">
        Click a day to view details
      </p>
      <div className="grid grid-cols-6 gap-1">
        {days.map((day) => {
          const isPassed = day < currentDay;
          const isCurrent = day === currentDay;
          const dayEvents = eventsByDay.get(day) || [];
          const hasUnresolvedEvent = dayEvents.some(e => !e.resolved);
          const primaryEvent = dayEvents[0];

          return (
            <motion.button
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.01 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDay(day)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                transition-all duration-200 cursor-pointer
                ${isPassed ? 'bg-stone-800/40 text-stone-600' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}
                ${isCurrent ? 'ring-2 ring-amber-500 bg-amber-900/40 text-amber-100' : ''}
                ${primaryEvent && hasUnresolvedEvent ? 'border ' + getEventBorder(primaryEvent.type, false) : ''}
              `}
            >
              <span className={`font-medium ${isCurrent ? 'text-amber-200' : ''}`}>
                {day}
              </span>

              {/* Event indicators */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <span
                      key={i}
                      className={`${getEventColor(event.type, event.resolved)}`}
                    >
                      {event.resolved ? (
                        <CheckCircle className="w-2.5 h-2.5" />
                      ) : (
                        getEventIcon(event.type)
                      )}
                    </span>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-stone-500 text-[8px]">+{dayEvents.length - 2}</span>
                  )}
                </div>
              )}

              {/* Current day pulse */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-amber-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-stone-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-900/40 ring-1 ring-amber-500" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <Crown className="w-3 h-3 text-red-400" />
          <span>Boss</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-stone-500" />
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
}
