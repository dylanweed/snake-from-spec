import type { Direction } from "../model/types";

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  w: "UP",
  s: "DOWN",
  a: "LEFT",
  d: "RIGHT",
};

export function listenForDirections(onDirection: (direction: Direction) => void): void {
  window.addEventListener("keydown", (event) => {
    const direction = KEY_MAP[event.key];
    if (direction) {
      event.preventDefault();
      onDirection(direction);
    }
  });
}

export function listenForRestart(onRestart: () => void): void {
  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      onRestart();
    }
  });
}
