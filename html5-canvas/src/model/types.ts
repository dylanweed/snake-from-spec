export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type TileType = "WALL" | "SNAKE_BODY";

export interface Position {
  x: number;
  y: number;
}

export interface Tile extends Position {
  type: TileType;
}

export interface Grid {
  width: number;
  height: number;
}

export interface GameState {
  grid: Grid;
  grid_tiles: Tile[];
  snake_pos: Position;
  snake_next: Direction;
  alive: boolean;
  score: number;
}
