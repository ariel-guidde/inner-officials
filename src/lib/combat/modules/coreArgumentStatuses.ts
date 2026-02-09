import { CoreArgument, Status, STATUS_TRIGGER, MODIFIER_STAT, MODIFIER_OP, Element } from '../../../types/game';

let coreArgStatusCounter = 0;

function generateId(): string {
  return `ca_status_${Date.now()}_${coreArgStatusCounter++}`;
}

/**
 * Convert a CoreArgument's passive modifiers into permanent Status objects.
 * These are applied at battle start and persist for the entire combat.
 */
export function createCoreArgumentStatuses(
  coreArgument: CoreArgument,
  owner: 'player' | 'opponent'
): Status[] {
  const statuses: Status[] = [];
  const passives = coreArgument.passiveModifiers;
  if (!passives) return statuses;

  // Standing gain bonus -> add modifier
  if (passives.standingGainBonus && passives.standingGainBonus > 0) {
    statuses.push({
      id: generateId(),
      name: `${coreArgument.name}: Standing Bonus`,
      description: `+${passives.standingGainBonus} standing on gain`,
      owner,
      trigger: STATUS_TRIGGER.PASSIVE,
      turnsRemaining: -1,
      modifiers: [{
        stat: MODIFIER_STAT.STANDING_GAIN,
        op: MODIFIER_OP.ADD,
        value: passives.standingGainBonus,
      }],
      isPositive: true,
      tags: ['core_argument'],
    });
  }

  // Standing gain multiplier -> multiply modifier
  if (passives.standingGainMultiplier && passives.standingGainMultiplier !== 1) {
    statuses.push({
      id: generateId(),
      name: `${coreArgument.name}: Standing Multiplier`,
      description: `${Math.round((passives.standingGainMultiplier - 1) * 100)}% standing gains`,
      owner,
      trigger: STATUS_TRIGGER.PASSIVE,
      turnsRemaining: -1,
      modifiers: [{
        stat: MODIFIER_STAT.FAVOR_GAIN_MULTIPLIER,
        op: MODIFIER_OP.MULTIPLY,
        value: passives.standingGainMultiplier,
      }],
      isPositive: passives.standingGainMultiplier > 1,
      tags: ['core_argument'],
    });
  }

  // Element cost reductions
  if (passives.elementCostReduction) {
    for (const [element, reduction] of Object.entries(passives.elementCostReduction)) {
      if (reduction && reduction > 0) {
        statuses.push({
          id: generateId(),
          name: `${coreArgument.name}: ${element} Discount`,
          description: `${element} cards cost -${reduction} patience`,
          owner,
          trigger: STATUS_TRIGGER.PASSIVE,
          turnsRemaining: -1,
          modifiers: [{
            stat: MODIFIER_STAT.ELEMENT_COST,
            op: MODIFIER_OP.ADD,
            value: -reduction,
            element: element as Element,
          }],
          isPositive: true,
          tags: ['core_argument'],
        });
      }
    }
  }

  // Patience cost reduction
  if (passives.patienceCostReduction && passives.patienceCostReduction > 0) {
    statuses.push({
      id: generateId(),
      name: `${coreArgument.name}: Patience Reduction`,
      description: `-${passives.patienceCostReduction} patience costs`,
      owner,
      trigger: STATUS_TRIGGER.PASSIVE,
      turnsRemaining: -1,
      modifiers: [{
        stat: MODIFIER_STAT.PATIENCE_COST,
        op: MODIFIER_OP.ADD,
        value: -passives.patienceCostReduction,
      }],
      isPositive: true,
      tags: ['core_argument'],
    });
  }

  // Starting poise -> applied at turn start via apply function
  if (passives.startingPoise && passives.startingPoise > 0) {
    const poiseAmount = passives.startingPoise;
    statuses.push({
      id: generateId(),
      name: `${coreArgument.name}: Starting Poise`,
      description: `Start each turn with +${poiseAmount} poise`,
      owner,
      trigger: STATUS_TRIGGER.TURN_START,
      turnsRemaining: -1,
      modifiers: [{
        stat: MODIFIER_STAT.POISE,
        op: MODIFIER_OP.ADD,
        value: poiseAmount,
      }],
      apply: (state) => {
        if (owner === 'player') {
          return {
            ...state,
            player: {
              ...state.player,
              poise: state.player.poise + poiseAmount,
            },
          };
        }
        return state;
      },
      isPositive: true,
      tags: ['core_argument'],
    });
  }

  // Opponent standing damage bonus
  if (passives.opponentStandingDamageBonus && passives.opponentStandingDamageBonus > 0) {
    statuses.push({
      id: generateId(),
      name: `${coreArgument.name}: Standing Damage`,
      description: `+${passives.opponentStandingDamageBonus} when damaging opponent standing`,
      owner,
      trigger: STATUS_TRIGGER.PASSIVE,
      turnsRemaining: -1,
      modifiers: [{
        stat: MODIFIER_STAT.DAMAGE_MODIFIER,
        op: MODIFIER_OP.ADD,
        value: passives.opponentStandingDamageBonus,
      }],
      isPositive: true,
      tags: ['core_argument'],
    });
  }

  return statuses;
}
