import type { GameState } from "../model/types";

export class Renderer {
  private readonly cells: HTMLDivElement[];
  private readonly width: number;

  constructor(
    private readonly board: HTMLElement,
    grid: { width: number; height: number },
  ) {
    this.width = grid.width;
    this.board.style.setProperty("--grid-width", String(grid.width));
    this.board.style.setProperty("--grid-height", String(grid.height));

    this.cells = [];
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        this.board.appendChild(cell);
        this.cells.push(cell);
      }
    }
  }

  render(state: GameState): void {
    for (const cell of this.cells) {
      cell.className = "cell";
    }

    for (const tile of state.grid_tiles) {
      const cell = this.cells[tile.y * this.width + tile.x];
      cell.classList.add(tile.type === "WALL" ? "wall" : "body");
    }

    const headCell = this.cells[state.snake_pos.y * this.width + state.snake_pos.x];
    headCell.classList.add(state.alive ? "head" : "head-dead");
  }
}
