import { STATUS_TRIGGER } from '../types/game';
import { StatusTemplate } from '../types/statuses';

const templates: StatusTemplate[] = [
  // ==================== WOOD STATUS TEMPLATES ====================
  {
    id: 'growing_roots',
    name: 'Growing Roots',
    description: 'Gain 5 Standing at end of turn',
    trigger: STATUS_TRIGGER.TURN_END,
    defaultDuration: 3,
    modifiers: [],
    triggeredEffects: [{ type: 'gain_standing', value: 5 }],
    isPositive: true,
    tags: ['wood'],
  },
  {
    id: 'thick_bark',
    name: 'Thick Bark',
    description: 'Gain 5 Composure at the end of turn',
    trigger: STATUS_TRIGGER.TURN_END,
    defaultDuration: 3,
    modifiers: [],
    triggeredEffects: [{ type: 'gain_poise', value: 5 }],
    isPositive: true,
    tags: ['wood'],
  },
  {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Heal 3 Face at start of turn',
    trigger: STATUS_TRIGGER.TURN_START,
    defaultDuration: 4,
    modifiers: [],
    triggeredEffects: [{ type: 'heal_face', value: 3 }],
    isPositive: true,
    tags: ['wood'],
  },

  // ==================== METAL STATUS TEMPLATES ====================
  {
    id: 'keen_insight',
    name: 'Keen Insight',
    description: 'Reveal next intention(s)',
    trigger: STATUS_TRIGGER.PASSIVE,
    defaultDuration: -1,
    defaultTriggerCount: 1,
    modifiers: [],
    isPositive: false,
    tags: ['revealed'],
  },
];

const templateMap = new Map<string, StatusTemplate>();
for (const t of templates) {
  templateMap.set(t.id, t);
}

export function getStatusTemplate(id: string): StatusTemplate | undefined {
  return templateMap.get(id);
}

export function getAllStatusTemplates(): StatusTemplate[] {
  return templates;
}
