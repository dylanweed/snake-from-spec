# snake-from-spec

A clone of the "Snake" arcade game built as an exercise in specification-oriented-development with Claude.

## Deployed At
  - https://dylanweed.github.io/snake-from-spec/html5-canvas/
  - https://dylanweed.github.io/snake-from-spec/html5-dom/
  - https://dylanweed.github.io/snake-from-spec/nes/

## Specifications

Game mechanics are exhaustively specified and verifiable with tests to ensure correct implementation.  Claude is
given more leeway with the game loop and presentation layer.

Manually Written Specifications:
 - spec-runtime.md: Game Loop and Presentation Layer
 - spec-step.md: World model and step function

Claude-generated (but manually reviewed) functional tests:
 - spec-step.cases.json: Functional Test Cases for Step

## Implementations

Each subdirectory is a separate implementation of the same specification, so the specs can be exercised in different stacks side by side.

- `html5-canvas/`: TypeScript + Canvas implementation, built with Vite. `step()` is tested directly against `spec-step.cases.json`. (One-shotted.)
- `html5-dom/`: TypeScript + DOM (no canvas) implementation, built with Vite. Same `step()` and test cases as `html5-canvas/`; each grid tile is rendered as its own styled `<div>` instead of drawn on a canvas.
- `nes/`: an actual NES implementation. Game state, `step()`, timing, controller input, and PPU rendering are written in C and compiled with cc65's `nes` target (`ca65`/`ld65` under the hood) into a real 6502 iNES ROM (`rom/main.c`, `rom/chr.s`), which runs in the browser via the [jsnes](https://github.com/bfirsh/jsnes) emulator.

## Deployment Mechanics

Pushing to `main` runs `scripts/build-implementations.mjs`, which builds every implementation directory and publishes them to GitHub Pages, each under its own subpath (e.g. `html5-canvas/`).

