import type { GameState } from "../model/types";

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly cellSize: number;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    grid: { width: number; height: number },
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2d canvas context unavailable");
    }
    this.ctx = ctx;
    this.cellSize = canvas.width / grid.width;
  }

  render(state: GameState): void {
    const { ctx, cellSize } = this;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const tile of state.grid_tiles) {
      ctx.fillStyle = tile.type === "WALL" ? "#666" : "#3c9d3c";
      ctx.fillRect(tile.x * cellSize, tile.y * cellSize, cellSize, cellSize);
    }

    ctx.fillStyle = state.alive ? "#7ee87e" : "#c94b4b";
    ctx.fillRect(
      state.snake_pos.x * cellSize,
      state.snake_pos.y * cellSize,
      cellSize,
      cellSize,
    );
  }
}
