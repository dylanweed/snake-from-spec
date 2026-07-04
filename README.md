# snake-from-spec

A clone of the "Snake" arcade game built as an exercise in specification-oriented-development with Claude.

Game mechanics are exhaustively specified and verifiable with tests to ensure correct implementation.  Claude is
given more leeway with the game loop and presentation layer.

Manually Written Specifications:
 - spec-runtime.md: Game Loop and Presentation Layer
 - spec-step.md: World model and step function

Claude-generated (but manually reviewed) functional tests:
 - spec-step.cases.json: Functional Test Cases for Step

## Artifacts

Each subdirectory is a separate implementation ("artifact") of the same specification, so the specs can be exercised in different stacks side by side.

- `html5/`: TypeScript + Canvas implementation, built with Vite. `step()` is tested directly against `spec-step.cases.json`.

Pushing to `main` runs `scripts/build-artifacts.mjs`, which builds every artifact directory and publishes them to GitHub Pages, each under its own subpath (e.g. `html5/`).

