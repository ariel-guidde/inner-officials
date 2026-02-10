# Architecture

## Overview

Inner Officials is a single-player card-based debate game set in the imperial court of ancient China. Players use cards aligned to the five elements (Wuxing) to build standing with a judge, defend their composure, and outlast opponents in rhetorical combat.

The game is a React SPA with all game logic running client-side. There is no server — state is managed through React hooks with an immutable functional update pattern.

## Project Structure

```
src/
├── types/
│   ├── game.ts          # All core game types (GameState, Card, Opponent, Status, etc.)
│   ├── effects.ts       # EffectDef union type, ComputedValueDef, EffectContext
│   ├── statuses.ts      # StatusTemplate, StatusInstance types
│   └── character.ts     # Character customization types
├── data/
│   ├── cards.ts         # Card definitions (DEBATE_DECK) with data-driven effects
│   ├── badCards.ts      # Penalty cards generated at low face
│   ├── opponents.ts     # Opponent templates and flustered effects
│   ├── judges.ts        # Judge templates with tier structures and actions
│   └── statusTemplates.ts # Status template registry
├── lib/
│   ├── combat/
│   │   ├── CombatEngine.ts        # Core turn processing (processTurn, processEndTurn, processStartTurn)
│   │   ├── constants.ts           # HARMONY_THRESHOLD, DEFAULT_JUDGE_EFFECTS
│   │   ├── index.ts               # Public combat API re-exports
│   │   ├── playability.ts         # Card playability checks
│   │   ├── engine/
│   │   │   ├── effectResolver.ts  # Resolves EffectDef[] against state
│   │   │   └── costCalculator.ts  # Unified cost calculation pipeline
│   │   ├── modules/
│   │   │   ├── harmony.ts         # Wuxing cycle flow calculations
│   │   │   ├── statuses.ts        # Status CRUD, trigger processing, modifier aggregation
│   │   │   ├── standing.ts        # Tier advancement and standing math
│   │   │   ├── opponent.ts        # Multi-opponent action execution
│   │   │   ├── judge.ts           # Judge decree triggers
│   │   │   ├── victory.ts         # Victory condition checks
│   │   │   ├── coreArguments.ts   # Core argument trigger processing
│   │   │   ├── coreArgumentStatuses.ts # Convert passive modifiers to statuses
│   │   │   └── events.ts          # Game event emission
│   │   └── services/
│   │       ├── deckService.ts     # Pure deck functions (draw, discard, burn)
│   │       ├── targetingService.ts # Targeting resolution for card effects
│   │       └── flusteredService.ts # Flustered mechanic (opponent face break)
│   └── debug/
│       └── combatLogger.ts        # Injectable CombatLog interface + CombatLogger class
├── hooks/
│   ├── useGameLogic.ts  # Main battle orchestration hook
│   ├── useGameState.ts  # State history and undo
│   ├── useDeck.ts       # Thin wrapper over deckService
│   ├── useTurnFlow.ts   # Turn phase management
│   ├── useTargeting.ts  # Card targeting UI state
│   └── useEventQueue.ts # Event queue processing
└── components/
    ├── game/             # Battle UI components
    └── menu/             # Menu screens including HowToPlay
```

## Game State

All game state lives in a single `GameState` object, updated immutably through functional updates in `useGameState`. Key properties:

- **`player`** — Face (HP), standing (tier progress), poise (shield), hand/deck/discard
- **`opponents[]`** — Array of opponents, each with face, standing, intentions, and per-opponent statuses
- **`judge`** — Current judge with effects, tier structure, and decree tracking
- **`patience`** — Shared resource that decreases each turn; game ends when it reaches 0
- **`statuses[]`** — Active status effects (buffs/debuffs) with modifiers and triggers
- **`nextId`** — Monotonic counter for deterministic ID generation (no `Date.now()` in game IDs)

## Combat Engine Pipeline

The `CombatEngine` class in `CombatEngine.ts` orchestrates all combat. A turn has three phases:

### `processTurn(state, card, drawCards)` — Card Play

1. **Flow Calculation** — Determine element relationship (balanced/neutral/dissonant/chaos)
2. **Cost Deduction** — Calculate effective costs through the cost pipeline, deduct patience and face
3. **Effect Execution** — Resolve `card.effects` via `resolveEffects()`. If chaos flow, numeric effect values are multiplied by 1.5x
4. **Standing Modifiers** — Apply judge and status multipliers to any standing gained
5. **Core Argument Triggers** — Fire `on_card_play` and `on_tier_advance` triggers
6. **State Update** — Update last element, harmony streak
7. **Flustered Check** — If any opponent's face hit 0, apply flustered mechanic
8. **Victory Check** — Check win/loss conditions

### `processEndTurn(state)` — End of Turn

1. **End Turn Cost** — Deduct patience (base cost from judge effects)
2. **Opponent Actions** — All opponents execute their current intention, then advance to next
3. **Judge Trigger** — Check if patience threshold met for next judge decree
4. **Status Processing** — Fire `turn_end` status triggers
5. **Core Argument Triggers** — Fire `on_turn_end` triggers
6. **Tick Statuses** — Decrement `turnsRemaining`, remove expired statuses
7. **Reset Poise** — Poise resets to 0 at end of turn

### `processStartTurn(state)` — Start of Turn

1. **Status Processing** — Fire `turn_start` status triggers (healing, poise gain)
2. **Core Argument Triggers** — Fire `on_turn_start` triggers

## Data-Driven Effect System

Cards define effects as plain data objects (`EffectDef[]`), resolved by `effectResolver.ts`. This replaces the legacy closure-based `effect` function.

### EffectDef Types

| Type | Description |
|------|-------------|
| `gain_standing` | Add standing to player or opponent |
| `deal_shame` | Reduce opponent face |
| `draw_cards` | Draw cards from deck |
| `gain_poise` | Add poise (composure) |
| `heal_face` | Restore face (capped at max) |
| `drain_patience` | Reduce patience |
| `add_status` | Add a status from template registry |
| `remove_status` | Remove statuses matching a tag |
| `reveal_intention` | Reveal opponent's next intention |
| `burn_card` | Remove a card from the game |
| `discard_card` | Move a card to discard pile |
| `computed` | Compute value dynamically (e.g., `target_patience_cost`) |

### Resolution

`resolveEffects(state, effects, context, drawCards)` iterates through the array and applies each effect immutably. The `EffectContext` carries `targetOpponentId` and `selectedCards` for targeted effects.

## Wuxing Harmony

The five elements follow a cycle: **Wood → Fire → Earth → Metal → Water → Wood**.

The relationship between the last played element and the current card determines the flow type:

| Flow Type | Cycle Distance | Effect |
|-----------|---------------|--------|
| **Balanced** | +1 (next in cycle) | -1 patience cost |
| **Neutral** | 0 (same element or first card) | No change |
| **Dissonant** | +3 or +4 | +1 patience cost, +1 face cost |
| **Chaos** | +2 (skip one) | +2 patience cost, +2 face cost, effect values x1.5 (floor) |

## Status & Template System

### Status Templates

Defined in `statusTemplates.ts` as a registry. Each template specifies:
- `trigger` — When it fires (turn_start, turn_end, passive, etc.)
- `defaultDuration` — Turns until expiry (-1 = permanent)
- `modifiers` — Stat modifiers (standing_gain, patience_cost, etc.)
- `triggeredEffects` — `EffectDef[]` that fire when the status triggers

### Status Instances

Created via `addStatusFromTemplate(state, templateId, opts)`. Each instance gets a unique ID from `state.nextId`.

### Modifier Aggregation

When reading a stat modifier, the system aggregates all matching status modifiers in order:
1. **ADD** — Sum all additive modifiers
2. **MULTIPLY** — Apply each multiplier sequentially
3. **SET** — If any SET modifier exists, the last one wins (overrides ADD/MULTIPLY)

### Status Lifecycle

- `processStatusTrigger(state, trigger)` — Fires all matching statuses, resolves their triggered effects, decrements `triggersRemaining`
- `tickStatuses(state)` — Decrements `turnsRemaining` on all non-permanent statuses, removes expired ones

## Cost Calculation

The cost pipeline in `costCalculator.ts`:

1. **Base Cost** — Card's `patienceCost` and `faceCost`
2. **Judge Element Modifier** — Per-element patience adjustment from judge effects
3. **Status Reductions** — Additive modifiers from statuses (core arguments, etc.)
4. **Harmony Modifier** — Applied last:
   - Balanced: -1 patience (minimum 0)
   - Dissonant: +1 patience, +1 face
   - Chaos: +2 patience, +2 face
5. **Poise Absorption** — Face cost is absorbed by poise first via `deductFaceCost()`

## Multi-Opponent System

The `state.opponents[]` array supports multiple simultaneous opponents. Each opponent has:
- Independent face, standing, and intentions
- Per-opponent statuses (e.g., reveal status stored on `opponent.statuses[]`)
- Core arguments converted to permanent modifier statuses

At end of turn, `executeAllOpponentActions()` iterates through all opponents, executing each one's current intention and advancing to the next.

## Judge System

Judges define the rules of engagement via `JudgeEffects`:
- `endTurnPatienceCost` — Base patience cost per end turn
- `elementCostModifier` — Per-element patience adjustments
- `favorGainModifier` — Multiplier for all standing gains
- `damageModifier` — Multiplier for opponent attack damage
- `activeDecrees` — History of applied judge actions

**Trigger Mechanism:** The judge tracks `patienceSpent`. When it reaches `patienceThreshold`, a decree triggers — modifying the judge effects for the remainder of the battle.

**Tier Structure:** Each judge defines a `tierStructure` — an array of `TierDefinition` objects specifying how much favor is needed to advance through each tier.

## Core Arguments

Core arguments are passive abilities selected before battle. Their `passiveModifiers` are converted into permanent `Status` objects at battle start via `createCoreArgumentStatuses()`. This keeps all modifier logic in the unified status system.

Available modifier types:
- Standing gain bonus/multiplier
- Element cost reduction
- Patience cost reduction
- Starting poise per turn
- Opponent standing damage bonus

## Victory Conditions

- **Face ≤ 0** — Player loses immediately (opponent wins)
- **Patience ≤ 0** — Compare tiers: player must have a strictly higher tier than all opponents to win. Ties go to the opponent.

## Service Layer

- **deckService** — Pure functions for draw, discard, burn, shuffle. Handles bad card generation at low face.
- **targetingService** — Resolves card targeting (hand card selection, opponent selection, random selection)
- **flusteredService** — When an opponent's face reaches 0, resets their face to half max and replaces their current intention with a flustered (no-op) action
- **combatLogger** — Injectable `CombatLog` interface. Engine functions accept an optional `log` parameter, defaulting to the singleton `combatLogger`. Enables silent logging in tests.

## Hook Architecture

- **useGameLogic** — Main battle orchestration. Creates initial state, wires up card play, end turn, targeting, and event processing.
- **useGameState** — Manages state history for undo/debug. Provides `updateState` with immutable functional updates.
- **useDeck** — Thin wrapper over `deckService` providing `drawCards`, `discardHand`, `removeFromHand` as callbacks.
- **useTurnFlow** — Turn phase state machine and turn number tracking.
- **useTargeting** — UI state for card/opponent targeting mode.
- **useEventQueue** — Processes pending game events (judge decrees, opponent actions) for UI display.
