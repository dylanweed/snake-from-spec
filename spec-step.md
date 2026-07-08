# Snake — World Model & Step Function Spec

## Overview

This document covers the pure, testable core of the Snake game:

1. **World Model** — represents game state.
2. **Step Function** — validates a state and derives the next state from it.

The runtime layer (game loop and presentation) is specified separately in `spec-runtime.md` and depends on `step()` defined here.

Snake growth is unbounded by design: the snake never shrinks and there is no food mechanic. Every successful move permanently adds one `SNAKE_BODY` tile.

Test vectors for `step()` live alongside this spec in `spec-step.cases.json`.

---

## World Model

### Behavior

The world model captures everything needed to describe the game at a single instant. It splits that state into two conceptually different things: `grid_tiles`, the set of hazards the snake can collide with (walls and its own trailing body), and `snake_pos`, the snake's own current position — who it is, not something it could hit. The head is deliberately excluded from `grid_tiles` for this reason: it isn't a hazard to itself. This also means a collision check is a single uniform lookup — "is `candidate_pos` in `grid_tiles`?" — with no special case needed to exclude the head's own square, and no need to scan the whole `grid_tiles` list to find and skip it.

**Notes / open questions:**
- Score only increments on successful moves (see Step Function below) — a move that results in death does not increment it. Confirm this matches intent.

### Spec

```json
{
  "grid": { "width": 20, "height": 20 },
  "grid_tiles": [
    { "x": 2, "y": 0, "type": "WALL" },
    { "x": 0, "y": 1, "type": "SNAKE_BODY" }
  ],
  "snake_pos": { "x": 0, "y": 0 },
  "snake_next": "UP",
  "alive": true,
  "score": 0
}
```

| Field | Type | Description |
|---|---|---|
| `grid` | `{width, height}` | Dimensions of the game grid. |
| `grid_tiles` | list of `{x, y, type}` | Every hazard square — anything the snake's head would die by moving into. `type` is `"WALL"` or `"SNAKE_BODY"`. Excludes the head's own square; see Behavior above. |
| `snake_pos` | `{x, y}` | Position of the snake's head — the snake's own identity, not a hazard tile. |
| `snake_next` | `"UP" \| "DOWN" \| "LEFT" \| "RIGHT"` | Direction the snake will move on the next step. Carried forward unchanged from step to step unless a new_direction overrides it (see Step Function below). |
| `alive` | `bool` | Whether the snake is still alive. |
| `score` | `int` | Starts at 0. Incremented by 1 on each successful move. |

---

## Step Function

### Behavior

`step` is a pure function: it never mutates the state it's given, only returns a new one. The input state is left completely untouched, so past states remain valid, inspectable, and reusable (e.g. for replays, undo, or test fixtures) no matter how many further steps are taken from them.

Given a game state and an optional new_direction, the step function first checks that the state is internally consistent, then advances it by one step: if a new_direction was supplied, it becomes the snake's direction of travel for this step, overriding whatever `snake_next` already held; if no new_direction was supplied, the snake continues in its existing direction. The snake then attempts to move in that direction, and either dies (bounds violation or collision) or moves forward, grows by one tile, and scores a point.

**Open question:** should a new_direction in the *opposite* direction of current travel be rejected (classic Snake behavior, since reversing directly into your own neck is otherwise an instant, unavoidable death) or applied as-is? Not currently specified.

### Spec

**Signature:** `step(state, new_direction) -> state`

`new_direction` is optional and input-mode-agnostic — it represents "a direction was requested since the last step," however that request originated (keyboard, D-pad, touch swipe, etc.); it is not tied to a keyboard specifically. Pass one of `"UP" | "DOWN" | "LEFT" | "RIGHT"` to request a new direction; pass `null` (or the empty/nil value idiomatic to the host language) — or omit the argument entirely, if the language supports it — to indicate that no new direction has arrived since the last step, in which case the snake keeps moving in its current direction.

#### 1. Validation

Given an input state and new_direction, assert all of the following hold. If any fail, raise an assertion error (do not attempt recovery):

- Every tile in `grid_tiles` has `x` and `y` within `[0, grid.width)` and `[0, grid.height)`.
- `snake_pos` is within the same bounds.
- If `alive` is `true`, `snake_pos` does not coincide with any tile in `grid_tiles`.
- If `new_direction` is provided (not `null`/empty), it is one of `"UP"`, `"DOWN"`, `"LEFT"`, `"RIGHT"`.

#### 2. Transformation

Given a valid state and new_direction, produce the next state, leaving the input state unmodified:

0. **If `alive` is `false`, return the state unchanged.** A dead snake is never revived — `step` never evaluates new_direction, movement, growth, or collisions once `alive` is `false`.
1. **If `new_direction` is provided (not `null`/empty), set `snake_next` to `new_direction`.** Otherwise `snake_next` keeps its existing value.
2. Compute `candidate_pos` = `snake_pos` shifted one unit in the direction of `snake_next` (as resolved in step 1).
3. **If `candidate_pos` is out of grid bounds, or coincides with an existing `WALL` or `SNAKE_BODY` tile:**
   - `snake_pos` is unchanged.
   - `grid_tiles` is unchanged.
   - `alive` is set to `false`.
4. **Otherwise:**
   - Append a `SNAKE_BODY` tile at the snake's *current* (pre-move) `snake_pos`.
   - Update `snake_pos` to `candidate_pos`.
   - Increment `score` by 1.
   - `alive` remains `true`.

`snake_next` in the returned state reflects step 1: it is `new_direction` if one was supplied and the snake is alive, or the input state's `snake_next` otherwise. This is now the only mechanism by which `snake_next` changes.
