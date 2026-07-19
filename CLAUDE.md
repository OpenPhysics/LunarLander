# CLAUDE.md — Lunar Lander

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack port of the classic PhET Flash Lunar Lander. Pilot the module with thrust and tilt; score zone landings; avoid boulders and high-speed crashes.

## Key files

| Area | Files |
|---|---|
| Model | `LunarLanderModel.ts`, `Lander.ts`, `Terrain.ts`, `TerrainData.ts`, `ScoreKeeper.ts`, `CrashState.ts` |
| Constants | `LunarLanderConstants.ts` — physics, layout, scoring (matches original ActionScript) |
| View | `LunarLanderScreenView.ts`, `LanderNode`, `TerrainNode`, `ControlPanel`, instrument nodes |
| Sound | `LunarLanderSoundView.ts` — synthesized tambo oscillators + noise burst |
| Overlays | `StartOverlayNode`, help dialog, on-screen throttle controls |

## Accessibility

Conforms to the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md):
`LunarLanderScreenView` registers `LunarLanderScreenSummaryContent` (structured regions + live
current-details) via the `screenSummaryContent` super-option, orders the PDOM through
`pdomControlAreaNode`, and exposes a11y strings via `StringManager.getA11yStrings()`. This
sim's `ScreenSummaryContent` is the reference example for live model-derived current-details.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | Test environment + `setupFiles` when present; `execArgv: ["--expose-gc"]` with memory-leak suite |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports (when required) |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

- Put unit tests only under root `tests/` (never co-locate or use `__tests__/`).
- Run `npm test`. CI runs the suite when a `test` script is present.
- Expand `memory-leak.test.ts` for components that add/remove nodes or link Properties at runtime (see OpticsLab).

## Physics (port fidelity)

- Lunar gravity `g = 1.6 m/s²`; empty mass `6839 kg`; max thrust `45000 N`; Tsiolkovsky fuel burn
- Fixed `40 ms` integration timestep with real-frame accumulation (matches original tuning)
- Soft landing: < 2 m/s and roughly level; hard: < 6 m/s; crash above that

## Terrain

Hand-designed data in `TerrainData.ts` — flat pads (width inversely related to point value), slopes, boulders. Not procedural.
