# Model - Lunar Lander

This document describes the model (the underlying physics, math, and behavior) for the simulation,
in terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation models piloting a **rocket-powered lunar module** to the Moon's surface under
**constant gravity** with **variable thrust** and **tilt**. Students manage limited fuel, adjust
thrust and orientation, and attempt a gentle touchdown on narrow scoring pads while avoiding
**boulders** and high-speed impacts.

The activity connects Newton's second law, the **Tsiolkovsky rocket equation** (fuel burn reduces
mass), and 2-D kinematics — vertical descent with lateral steering via tilted thrust.

Key ideas a student should take away:

- Thrust must counter gravity; running out of fuel leaves only gravity acting.
- Tilt redirects thrust horizontally — landing on a distant pad requires planning lateral motion,
  not just slowing the fall.
- Touchdown speed **and** orientation determine success; narrow pads score more but are harder
  targets.

## Quantities and units

| Quantity | Symbol | Units | Value / range |
|---|---|---|---|
| Lunar gravity | g | m/s² | 1.6 (downward) |
| Empty (dry) mass | m₀ | kg | 6839 |
| Initial fuel | — | kg | 816.5 |
| Maximum thrust | F_max | N | 45000 |
| Thrust setting | F | N | 0 – F_max (throttle) |
| Specific impulse (effective) | I_sp | m/s | 3050 (fuel burn model) |
| Position / velocity | **r**, **v** | m, m/s | 2-D absolute coordinates |
| Altitude (readout) | h | m | Clearance above terrain at current x |
| Integration step | Δt | s | Fixed 40 ms |

## Governing equations

**Newton's second law** with gravity and engine thrust along the lander's axis (angle θ from
vertical):

```
a_x = (F/m) sin θ
a_y = (F/m) cos θ − g
```

where m = m₀ + m_fuel. When fuel is exhausted, F = 0.

The state is advanced each fixed step with a **position-Verlet-style** update matching the
original Flash sim:

```
x ← x + v_x Δt + ½ a_x Δt² ,   v_x ← v_x + a_x Δt
y ← y + v_y Δt + ½ a_y Δt² ,   v_y ← v_y + a_y Δt
```

**Fuel burn** (Tsiolkovsky):

```
Δm_fuel = − F · Δt / I_sp
```

Thrust is cut to zero when the tank is empty.

**Landing classification** at terrain contact (requires roughly level attitude, |θ| ≲ 11°):

| Outcome | Speed | Result |
|---|---|---|
| Soft landing | < 2 m/s | Success + score if on a pad |
| Hard landing | < 6 m/s | Survivable, lower celebration |
| Crash | ≥ 6 m/s (or bad angle) | Explosion, fuel lost |
| Boulder strike | any | Crash |

**Scoring** — flat landing zones have point values inversely related to pad width (narrower =
more points). Each zone scores at most once per game.

## Simplifications and assumptions

- **Uniform gravity** — no altitude-dependent g or orbital mechanics.
- **No atmosphere** — no drag (appropriate for the Moon).
- **Rigid lander as point mass** with orientation for thrust direction only.
- **Hand-designed terrain** — slopes, pads, and boulders from fixed data, not procedural generation.
- **Fixed 40 ms timestep** with frame accumulation — reproduces original Flash tuning regardless
  of display frame rate.

## References

- Newtonian mechanics and the rocket equation, introductory texts (e.g. Halliday, Resnick & Walker;
  Sutton & Biblarz, *Rocket Propulsion Elements*, for Tsiolkovsky).
- PhET Interactive Simulations, [*Lunar Lander*](https://phet.colorado.edu/en/simulations/lunar-lander)
  (University of Colorado) — classic Flash simulation; physics constants match the original
  ActionScript.
