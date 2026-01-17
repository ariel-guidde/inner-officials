import { CombatLogEntry, GameState } from '../../types/game';

type LogEventCallback = (entry: CombatLogEntry) => void;

class CombatLogger {
  private entries: CombatLogEntry[] = [];
  private listeners: Set<LogEventCallback> = new Set();
  private currentTurn = 1;
  private idCounter = 0;

  private generateId(): string {
    return `log_${Date.now()}_${this.idCounter++}`;
  }

  setTurn(turn: number): void {
    this.currentTurn = turn;
  }

  log(
    actor: CombatLogEntry['actor'],
    action: string,
    details: Record<string, unknown> = {},
    stateDelta?: CombatLogEntry['stateDelta']
  ): CombatLogEntry {
    const entry: CombatLogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      turn: this.currentTurn,
      actor,
      action,
      details,
      stateDelta,
    };

    this.entries.push(entry);
    this.broadcast(entry);

    return entry;
  }

  logCardPlayed(
    cardName: string,
    element: string,
    costs: { patience: number; face: number },
    flowType: 'balanced' | 'chaos' | 'neutral',
    beforeState: GameState,
    afterState: GameState
  ): CombatLogEntry {
    return this.log(
      'player',
      `Played ${cardName}`,
      {
        cardName,
        element,
        patienceCost: costs.patience,
        faceCost: costs.face,
        flowType,
      },
      {
        playerFace: afterState.player.face - beforeState.player.face,
        playerFavor: afterState.player.favor - beforeState.player.favor,
        playerPoise: afterState.player.poise - beforeState.player.poise,
        opponentFace: afterState.opponent.face - beforeState.opponent.face,
        opponentFavor: afterState.opponent.favor - beforeState.opponent.favor,
        patience: afterState.patience - beforeState.patience,
      }
    );
  }

  logAIAction(
    intentionName: string,
    intentionType: string,
    value: number,
    beforeState: GameState,
    afterState: GameState
  ): CombatLogEntry {
    return this.log(
      'opponent',
      `${intentionName}`,
      {
        intentionType,
        value,
      },
      {
        playerFace: afterState.player.face - beforeState.player.face,
        playerFavor: afterState.player.favor - beforeState.player.favor,
        playerPoise: afterState.player.poise - beforeState.player.poise,
        patience: afterState.patience - beforeState.patience,
      }
    );
  }

  logSystemEvent(action: string, details: Record<string, unknown> = {}): CombatLogEntry {
    return this.log('system', action, details);
  }

  subscribe(callback: LogEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private broadcast(entry: CombatLogEntry): void {
    this.listeners.forEach((callback) => callback(entry));
  }

  getEntries(): CombatLogEntry[] {
    return [...this.entries];
  }

  getEntriesByTurn(turn: number): CombatLogEntry[] {
    return this.entries.filter((e) => e.turn === turn);
  }

  clear(): void {
    this.entries = [];
    this.idCounter = 0;
  }

  exportToJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  exportToCSV(): string {
    if (this.entries.length === 0) return '';

    const headers = ['id', 'timestamp', 'turn', 'actor', 'action', 'details', 'stateDelta'];
    const rows = this.entries.map((entry) => [
      entry.id,
      new Date(entry.timestamp).toISOString(),
      entry.turn.toString(),
      entry.actor,
      entry.action,
      JSON.stringify(entry.details),
      entry.stateDelta ? JSON.stringify(entry.stateDelta) : '',
    ]);

    return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join(
      '\n'
    );
  }
}

// Singleton instance
export const combatLogger = new CombatLogger();
