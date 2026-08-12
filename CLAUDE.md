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

- **Nested constants:** `src/LunarLanderConstants.ts` — Flash-port physics constants kept next to the lander model.


### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. LightPropagation keeps a higher `three` pin — do not force 0.125 there. |
| `brace-expansion` | `~5.0.9` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895). |

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

`npm run release` intentionally skips `npm test` in some sims — append `&& npm test` before the version bump so a release cannot ship a failing suite.

## Development notes

- Camera zoom follows altitude (zoom out near ground). Throttle and tilt respond to keyboard and on-screen controls; game pauses until Start is pressed.
