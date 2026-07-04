import { GameLoop } from "./runtime/gameLoop";
import { Renderer } from "./presentation/renderer";
import { listenForDirections, listenForRestart } from "./presentation/input";
import type { GameState, Tile } from "./model/types";

const GRID = { width: 20, height: 20 };

function borderWalls(): Tile[] {
  const walls: Tile[] = [];
  for (let x = 0; x < GRID.width; x++) {
    walls.push({ x, y: 0, type: "WALL" });
    walls.push({ x, y: GRID.height - 1, type: "WALL" });
  }
  for (let y = 1; y < GRID.height - 1; y++) {
    walls.push({ x: 0, y, type: "WALL" });
    walls.push({ x: GRID.width - 1, y, type: "WALL" });
  }
  return walls;
}

function initialState(): GameState {
  return {
    grid: GRID,
    grid_tiles: borderWalls(),
    snake_pos: { x: Math.floor(GRID.width / 2), y: Math.floor(GRID.height / 2) },
    snake_next: "UP",
    alive: true,
    score: 0,
  };
}

const canvas = document.querySelector<HTMLCanvasElement>("#board")!;
const scoreEl = document.querySelector<HTMLElement>("#score")!;
const gameOverEl = document.querySelector<HTMLElement>("#game-over")!;

const renderer = new Renderer(canvas, GRID);

let loop: GameLoop;

function render(state: GameState): void {
  renderer.render(state);
  scoreEl.textContent = `Score: ${state.score}`;
  gameOverEl.classList.toggle("visible", !state.alive);
}

function startGame(): void {
  loop = new GameLoop(initialState(), render);
  loop.start();
}

listenForDirections((direction) => loop.queueDirection(direction));
listenForRestart(() => startGame());

startGame();
