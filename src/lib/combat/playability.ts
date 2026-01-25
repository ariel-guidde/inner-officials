import { Card, GameState } from '../../types/game';

function getValidTargets(card: Card, state: GameState): Card[] {
  if (!card.targetRequirement || card.targetRequirement.type === 'none') {
    return [];
  }

  const req = card.targetRequirement;

  // Determine valid targets from hand (excluding the card being played)
  let targets = state.player.hand.filter((c) => c.id !== card.id);

  // Apply filter if provided
  if (req.filter) {
    targets = targets.filter((c) => req.filter!(c, state));
  }

  return targets;
}

export function isCardPlayable(
  card: Card,
  state: GameState,
  playerPoise: number = 0
): {
  playable: boolean;
  reason?: string;
} {
  if (state.patience < card.patienceCost) {
    return {
      playable: false,
      reason: `Not enough Patience (need ${card.patienceCost}, have ${state.patience})`,
    };
  }

  const effectiveFacePool = playerPoise + state.player.face;
  if (effectiveFacePool < card.faceCost) {
    return {
      playable: false,
      reason: `Not enough Face/Poise (need ${card.faceCost}, have ${effectiveFacePool})`,
    };
  }

  if (card.targetRequirement?.isPlayRequirement) {
    const validTargets = getValidTargets(card, state);
    if (validTargets.length === 0) {
      return {
        playable: false,
        reason: card.targetRequirement.prompt || 'No valid targets for required effect',
      };
    }
  }

  return { playable: true };
}
