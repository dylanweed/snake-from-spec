import type { Direction, GameState, Position } from "./types";

function inBounds(pos: Position, grid: GameState["grid"]): boolean {
  return pos.x >= 0 && pos.x < grid.width && pos.y >= 0 && pos.y < grid.height;
}

function tileAt(state: GameState, pos: Position) {
  return state.grid_tiles.find((t) => t.x === pos.x && t.y === pos.y);
}

function validate(state: GameState): void {
  for (const tile of state.grid_tiles) {
    if (!inBounds(tile, state.grid)) {
      throw new Error(`grid_tiles entry (${tile.x}, ${tile.y}) is out of bounds`);
    }
  }
  if (!inBounds(state.snake_pos, state.grid)) {
    throw new Error(`snake_pos (${state.snake_pos.x}, ${state.snake_pos.y}) is out of bounds`);
  }
  if (state.alive && tileAt(state, state.snake_pos)) {
    throw new Error("snake_pos coincides with an existing tile while alive");
  }
}

function shift(pos: Position, direction: Direction): Position {
  switch (direction) {
    case "UP":
      return { x: pos.x, y: pos.y - 1 };
    case "DOWN":
      return { x: pos.x, y: pos.y + 1 };
    case "LEFT":
      return { x: pos.x - 1, y: pos.y };
    case "RIGHT":
      return { x: pos.x + 1, y: pos.y };
  }
}

export function step(state: GameState): GameState {
  validate(state);

  if (!state.alive) {
    return state;
  }

  const candidate = shift(state.snake_pos, state.snake_next);

  if (!inBounds(candidate, state.grid) || tileAt(state, candidate)) {
    return {
      ...state,
      alive: false,
    };
  }

  return {
    ...state,
    grid_tiles: [...state.grid_tiles, { ...state.snake_pos, type: "SNAKE_BODY" }],
    snake_pos: candidate,
    score: state.score + 1,
  };
}
