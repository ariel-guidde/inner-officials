import { Element } from '../../types/game';
import { Leaf, Flame, Mountain, Hammer, Droplets } from 'lucide-react';

interface ElementIconProps {
  element: Element;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-12 h-12',
};

const colorMap: Record<Element, string> = {
  wood: 'text-green-500',
  fire: 'text-red-500',
  earth: 'text-amber-600',
  metal: 'text-gray-400',
  water: 'text-blue-400',
};

const iconMap: Record<Element, React.ComponentType<{ className?: string }>> = {
  wood: Leaf,
  fire: Flame,
  earth: Mountain,
  metal: Hammer,
  water: Droplets,
};

export default function ElementIcon({ element, size = 'md' }: ElementIconProps) {
  const Icon = iconMap[element];
  const sizeClass = sizeMap[size];
  const colorClass = colorMap[element];

  return <Icon className={`${sizeClass} ${colorClass}`} />;
}
