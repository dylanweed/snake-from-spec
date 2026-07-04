# Snake — Game Loop & Presentation Spec

## Overview

This document covers the runtime layer of the Snake game, built on top of the World Model and Step Function defined in `spec-step.md`:

1. **Game Loop** — keeps time, calls the step function, and passes state/events between it and the presentation layer.
2. **HTML5 Presentation Layer** — renders the world model and translates keypresses into world model events.

---

## Game Loop

### Behavior

The game loop is the conductor: it ticks at a fixed interval, shows the presentation layer the current state, applies the step function, and feeds any pending keypress into the next tick's direction. It also decides when the game has ended.

**Open question:** should a keypress in the *opposite* direction of current travel be rejected (classic Snake behavior, since reversing directly into your own neck is otherwise an instant, unavoidable death) or passed through as-is? Not currently specified.

### Spec

Runs on a fixed tick interval (interval value TBD):

1. Pass the current game state to the presentation layer for rendering.
2. Call `step(state)` to produce the next state, after a fixed per-tick delay.
3. If a directional keypress event has arrived from the presentation layer since the last tick, update `snake_next` to that direction before the next `step` call.
4. Repeat, stopping (or entering a "game over" mode) once `alive` is `false`.

---

## HTML5 Presentation and Rendering Layer

### Behavior

Renders the world model to the screen each tick and translates player input into directional events for the game loop.

### Spec

*Not yet specified.* At minimum this will need to:

- Render the grid, walls, snake body, and head from the world model on each tick.
- Display the current `score`, updating it each tick.
- Capture arrow-key (or WASD) keydown events and forward them to the game loop as directional events.
- Render a game-over state when `alive` becomes `false`.

This is a stub and needs to be fleshed out (canvas vs. DOM rendering, styling, input handling details, etc.).
