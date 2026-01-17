import React from 'react';
import ProgressBar from './ProgressBar';

interface ResourceDisplayProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  color: string;
}

export default function ResourceDisplay({ icon, label, current, max, color }: ResourceDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-tighter text-stone-400">
        {icon} <span>{label}</span> <span className="ml-auto font-mono text-stone-200">{current}/{max}</span>
      </div>
      <ProgressBar value={current} max={max} color={color} />
    </div>
  );
}
