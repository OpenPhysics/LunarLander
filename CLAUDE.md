# CLAUDE.md — Lunar Lander

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack port of the classic PhET Flash *Lunar Lander*. Single screen: pilot the module with thrust and tilt; score zone landings; avoid boulders and high-speed crashes.

Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Key files

| Area | Location |
|---|---|
| Screen | `src/lunar-lander/LunarLanderScreen.ts` |
| Model | `model/LunarLanderModel.ts`, `Lander.ts`, `Terrain.ts`, `TerrainData.ts`, `ScoreKeeper.ts`, `CrashState.ts`, `LunarLanderConstants.ts` |
| View | `view/LunarLanderScreenView.ts`, `LanderNode.ts`, `TerrainNode.ts`, `ControlPanel.ts`, `VectorsNode.ts`, `ThrottleControlNode.ts`, `StartOverlayNode.ts`, `LunarLanderScreenSummaryContent.ts` |
| Sound | `view/LunarLanderSoundView.ts` — synthesized tambo oscillators + noise burst |
| Colors / strings | `LunarLanderColors.ts`, `src/i18n/StringManager.ts` |

## Model

`LunarLanderModel implements TModel`. The lander's `positionProperty` is its **absolute** location `(x, yAbs)` in model metres; terrain elevation is `terrain.surfaceY(x)`; altitude readout is clearance `yAbs − surfaceY(x)`.

| Property | Type | Meaning |
|---|---|---|
| `lander.{position,velocity,angle,fuel}Property` | various | lander kinematics, tilt, remaining fuel |
| `crashStateProperty` | `Property<CrashState>` | in-flight / soft / hard / crash |
| `isPlayingProperty` | `BooleanProperty` | play/pause after Start |
| `hasStartedProperty` | `BooleanProperty` | Start overlay dismissed |
| `showVectorsProperty` | `BooleanProperty` | velocity/acceleration overlays |
| `altitudeProperty` / `rangeProperty` | derived | clearance and horizontal distance |
| `lowFuelProperty` | derived | fuel below warning threshold |

### Stepping & numerics

- Lunar gravity `g = 1.6 m/s²`; empty mass `6839 kg`; max thrust `45000 N`; Tsiolkovsky fuel burn (`ISP`).
- **Fixed `40 ms` integration timestep** with real-frame accumulator (`FIXED_DT`, `MAX_CATCHUP_STEPS`) — matches original Flash tuning.
- Soft landing: < 2 m/s and roughly level; hard: < 6 m/s; crash above that. Boulder overlap sets `hitBoulderProperty`.
- Terrain is hand-designed data in `TerrainData.ts` — flat pads (width inversely related to point value), slopes, boulders; not procedural.

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`LunarLanderScreenView` registers `LunarLanderScreenSummaryContent` (structured regions + live
current-details) via the `screenSummaryContent` super-option, orders the PDOM through
`pdomControlAreaNode`, and exposes a11y strings via `StringManager.getA11yStrings()`. This sim's
`ScreenSummaryContent` is the reference example for live model-derived current-details.

## Compliance carve-outs

- **Nested constants:** `src/lunar-lander/model/LunarLanderConstants.ts` — Flash-port physics constants kept next to the lander model.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment, `setupFiles`, `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

Actual specs:

- `tests/lunar-lander/model/LunarLanderModel.test.ts`
- `tests/memory-leak.test.ts`

Run `npm test`. CI runs the suite when a `test` script is present.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
```

## Development notes

- Camera zoom follows altitude (zoom out near ground). Throttle and tilt respond to keyboard and on-screen controls; game pauses until Start is pressed.
