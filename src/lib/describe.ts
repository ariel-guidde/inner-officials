import { DescriptionPart } from '../types/game';

export function renderDescription(parts: DescriptionPart[], chaos = false): string {
  return parts.map(part => {
    if (typeof part === 'string') return part;
    const val = chaos && !part.noDouble ? part.value * 2 : part.value;
    return String(val);
  }).join('');
}
