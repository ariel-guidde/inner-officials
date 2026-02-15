import { useState, useCallback, useEffect } from 'react';

export interface QueuedAnimation {
  id: string;
  type: 'projectile' | 'intention' | 'decree' | 'status' | 'particle' | 'tier';
  priority: number;
  data: any;
  duration: number; // milliseconds
}

/**
 * Animation queue with priority-based sequential playback
 *
 * Priority levels:
 * - Tier advancement: 100
 * - Judge decree: 80
 * - Projectile: 65
 * - Opponent intention: 60
 * - Status effect: 40
 * - Particle effect: 20
 */
export function useAnimationQueue() {
  const [queue, setQueue] = useState<QueuedAnimation[]>([]);
  const [current, setCurrent] = useState<QueuedAnimation | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const enqueue = useCallback((animation: QueuedAnimation) => {
    setQueue(prev => {
      const newQueue = [...prev, animation];
      // Sort by priority (highest first)
      newQueue.sort((a, b) => b.priority - a.priority);
      // Cap at 10 animations to prevent performance issues
      return newQueue.slice(0, 10);
    });
  }, []);

  const skip = useCallback(() => {
    setCurrent(null); // Auto-advances to next
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setCurrent(null);
  }, []);

  // Auto-advance when current finishes
  useEffect(() => {
    if (!isPaused && !current && queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrent(next);
    }
  }, [current, queue, isPaused]);

  // Space key to skip current animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && current) {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, skip]);

  return {
    current,
    queue,
    queueLength: queue.length,
    isPlaying: current !== null,
    enqueue,
    skip,
    pause,
    resume,
    clear,
  };
}
