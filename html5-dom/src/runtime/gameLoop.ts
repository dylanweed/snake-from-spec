import { step } from "../model/step";
import type { Direction, GameState } from "../model/types";

const TICK_INTERVAL_MS = 150;

export class GameLoop {
  private state: GameState;
  private pendingDirection: Direction | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    initialState: GameState,
    private readonly onTick: (state: GameState) => void,
  ) {
    this.state = initialState;
  }

  start(): void {
    this.stop();
    this.onTick(this.state);
    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  queueDirection(direction: Direction): void {
    this.pendingDirection = direction;
  }

  private tick(): void {
    this.state = step(this.state, this.pendingDirection);
    this.pendingDirection = null;
    this.onTick(this.state);

    if (!this.state.alive) {
      this.stop();
    }
  }
}
