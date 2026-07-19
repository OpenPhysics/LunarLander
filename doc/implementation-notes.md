# Implementation Notes - Lunar Lander

Developer-facing notes on the architecture. The physics itself is documented for educators in
[model.md](./model.md).

## Architecture Overview

Lunar Lander is a single-screen SceneryStack port of the classic PhET Flash *Lunar Lander*, with
physics constants and integration formulas taken verbatim from the ActionScript source.

```
src/
  main.ts, brand.ts, splash.ts, assert.ts, init.ts
  LunarLanderColors.ts, LunarLanderNamespace.ts
  i18n/StringManager.ts, strings_*.json
  preferences/
  lunar-lander/
    LunarLanderScreen.ts
    model/
      LunarLanderModel.ts           TModel: step, controls, landing/collision
      Lander.ts                       position, velocity, angle, thrust, fuel, mass
      Terrain.ts, TerrainData.ts      hand-designed surface, zones, boulders
      ScoreKeeper.ts                  per-zone scoring
      CrashState.ts                   IN_FLIGHT | SOFT | HARD | CRASH
      LunarLanderConstants.ts
    view/
      LunarLanderScreenView.ts        camera zoom, keyboard, world assembly
      StarfieldNode.ts, TerrainNode.ts, LanderNode.ts
      VectorsNode.ts, ExplosionNode.ts, MessageNode.ts
      ControlPanel.ts, ReadoutsNode.ts, FuelGaugeNode.ts
      AttitudeIndicatorNode.ts, ScoreReadoutNode.ts
      ThrottleControlNode.ts, StartOverlayNode.ts
      LunarLanderSoundView.ts         synthesized tambo audio
      LunarLanderScreenSummaryContent.ts, LunarLanderKeyboardHelpContent.ts
```

Data flows Model → View through AXON `Property` objects and one-shot `Emitter`s (`tiltEmitter`,
`explosionEmitter`).

## Key design decisions

- **Flash-fidelity physics.** `stepInternal` uses the original position-Verlet update, `GRAVITY`
  = 1.6, `MASS_EMPTY` = 6839, `MAX_THRUST` = 45000, `ISP` = 3050, fuel burn Δm = F·Δt/ISP.
  Do not "modernize" integrator or constants without an explicit fidelity break.
- **Absolute coordinates.** `Lander.positionProperty` is (x, y_abs) in model metres. Altitude
  readout = y_abs − `terrain.surfaceY(x)`. Landing test: y_abs ≤ surfaceY(x).
- **Fixed timestep.** `FIXED_DT` = 0.04 s, `MAX_CATCHUP_STEPS` = 5. Game paused until
  `startGame()` sets `hasStartedProperty` and `isPlayingProperty`.
- **CrashState terminal.** `CRASH_LANDED` stops physics until Reset All. Boulder hit zeros fuel,
  fires `explosionEmitter`.
- **Level attitude test.** `|angle| < LEVEL_ANGLE_TOLERANCE` (0.2 rad) required for soft/hard
  (symmetric improvement over Flash's signed-only test).
- **Terrain.** `TerrainData.ts` encodes pads, slopes, boulders; `ScoreKeeper` uses zone index and
  `SPOT_SCORES` palette (width ↔ points inverse relationship in data).
- **Camera.** View zooms from `ZOOM_START_ALTITUDE` toward `ZOOM_MAX` at touchdown; pans with
  dead zone — see `LunarLanderConstants.ts`.
- **Nested constants.** `src/LunarLanderConstants.ts`.

## View components

- **LunarLanderScreenView** — inverted-Y `ModelViewTransform2`, dynamic camera on `worldNode`,
  keyboard (↑↓ thrust, ←→ tilt, Space full thrust, P pause/help, R reset).
- **LanderNode**, **TerrainNode**, **StarfieldNode** — scene inside zoomable world.
- **Instrument cluster** — fuel gauge, attitude indicator, altitude/range/speed readouts, score.
- **ThrottleControlNode** — on-screen touch buttons mirroring keyboard.
- **StartOverlayNode** — gates play until Start pressed.
- **LunarLanderSoundView** — procedural thrust, RCS puff, low-fuel alarm, explosion (tambo
  oscillators + noise).

`LunarLanderScreenSummaryContent` is the fleet reference for live model-derived current-details in
screen summaries.

## Disposal conventions

Single-screen, session-lifetime nodes. `LunarLanderSoundView` generators register with sound
manager for sim lifetime. No dynamic entity add/remove.

## Testing

`npm test` (vitest):

- `tests/lunar-lander/model/LunarLanderModel.test.ts` — gravity fall with zero thrust,
  reset restores `IN_FLIGHT`, start gate
- `tests/memory-leak.test.ts` — WeakRef/GC regression suite

CI gate: `npm run lint && npm run check && npm run build`.

## Multi-screen simulations

Single-screen.
