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

The world model captures everything needed to describe the game at a single instant: the grid dimensions, every wall and snake-body tile, the snake's head position and pending direction, whether the snake is still alive, and the current score.

**Notes / open questions:**
- The head's own position is *not* listed in `grid_tiles`; only trailing body and walls are. Worth confirming this is intended, since collision checks need to treat the head specially.
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
| `grid_tiles` | list of `{x, y, type}` | All occupied squares. `type` is `"WALL"` or `"SNAKE_BODY"`. |
| `snake_pos` | `{x, y}` | Position of the snake's head. |
| `snake_next` | `"UP" \| "DOWN" \| "LEFT" \| "RIGHT"` | Direction the snake will move on the next step. |
| `alive` | `bool` | Whether the snake is still alive. |
| `score` | `int` | Starts at 0. Incremented by 1 on each successful move. |

---

## Step Function

### Behavior

Given a game state, the step function first checks that the state is internally consistent, then advances it by one step: the snake attempts to move in its pending direction, and either dies (bounds violation or collision) or moves forward, grows by one tile, and scores a point. Direction changes themselves are not this function's concern — that's the game loop's job.

### Spec

**Signature:** `step(state) -> state`

#### 1. Validation

Given an input state, assert all of the following hold. If any fail, raise an assertion error (do not attempt recovery):

- Every tile in `grid_tiles` has `x` and `y` within `[0, grid.width)` and `[0, grid.height)`.
- `snake_pos` is within the same bounds.
- If `alive` is `true`, `snake_pos` does not coincide with any tile in `grid_tiles`.

#### 2. Transformation

Given a valid state, produce the next state:

0. **If `alive` is `false`, return the state unchanged.** A dead snake is never revived — `step` never evaluates movement, growth, or collisions once `alive` is `false`.
1. Compute `candidate_pos` = `snake_pos` shifted one unit in the direction of `snake_next`.
2. **If `candidate_pos` is out of grid bounds, or coincides with an existing `WALL` or `SNAKE_BODY` tile:**
   - `snake_pos` is unchanged.
   - `grid_tiles` is unchanged.
   - `alive` is set to `false`.
3. **Otherwise:**
   - Append a `SNAKE_BODY` tile at the snake's *current* (pre-move) `snake_pos`.
   - Update `snake_pos` to `candidate_pos`.
   - Increment `score` by 1.
   - `alive` remains `true`.

`snake_next` is not modified by this function — only the game loop updates it, in response to keypresses.
