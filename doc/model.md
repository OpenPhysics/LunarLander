# Model - Lunar Lander

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation models piloting a rocket-powered descent module to the lunar surface under **constant
gravity with variable thrust**. Students manage limited fuel, control thrust (and tilt), and try to land
softly inside a scoring zone while avoiding boulders and high-speed impacts. It reinforces Newton's
second law, the trade-off between thrust and fuel, and the kinematics of vertical (and lateral) motion.

## Quantities and units

| Quantity | Symbol | Units | Value / range |
|---|---|---|---|
| Lunar gravity | g | m/s² | 1.6 (downward) |
| Empty (dry) mass | m₀ | kg | 6839 |
| Maximum thrust | F_max | N | 45000 |
| Thrust setting | F | N | 0 – F_max (throttle) |
| Position / velocity | r, v | m, m/s | 2-D state of the lander |
| Fuel | — | kg | Depletes as thrust is used (Tsiolkovsky burn) |
| Integration step | Δt | s | Fixed 40 ms with real-frame accumulation |

## Governing equations

**Newton's second law** with gravity and engine thrust:

```
a = (F_thrust + m·g) / m
```

where `F_thrust` acts along the lander's orientation and `g` points down. The state is advanced each
fixed step:

```
v ← v + a · Δt        r ← r + v · Δt
```

**Fuel burn** follows the rocket (Tsiolkovsky) relation: firing the engine expends fuel in proportion to
thrust, so the lander's mass decreases over the burn, and running out of fuel removes thrust entirely.

**Landing outcome** is decided at contact by the touchdown speed and orientation: a **soft landing**
requires speed below ~2 m/s and a roughly level attitude; an impact below ~6 m/s is a **hard landing**;
anything faster is a **crash**. The flat landing pads are scored inversely to their width (narrower pads
are worth more).

## Simplifications and assumptions

- Uniform gravitational field; no orbital mechanics or altitude-dependent gravity.
- No atmosphere — no drag or aerodynamic effects (appropriate for the Moon).
- Rigid-body lander treated as a point mass with an orientation for thrust direction.
- A fixed 40 ms integration step with frame accumulation reproduces the original sim's tuning, so
  behavior is independent of display frame rate.

## References

- Tsiolkovsky rocket equation and Newtonian mechanics, any introductory mechanics text.
- Port of the classic PhET Flash *Lunar Lander*; physics constants match the original ActionScript.
</content>
