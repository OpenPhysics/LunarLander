import { afterEach, describe, expect, it } from "vitest";
import { CrashState } from "../../../src/lunar-lander/model/CrashState.js";
import LunarLanderConstants from "../../../src/lunar-lander/model/LunarLanderConstants.js";
import { LunarLanderModel } from "../../../src/lunar-lander/model/LunarLanderModel.js";
import { LunarLanderPreferencesModel } from "../../../src/preferences/LunarLanderPreferencesModel.js";

const { FIXED_DT } = LunarLanderConstants;

describe("LunarLanderModel", () => {
  let model: LunarLanderModel;

  afterEach(() => {
    model.reset();
  });

  it("falls under gravity with zero thrust after startGame", () => {
    const preferences = new LunarLanderPreferencesModel();
    model = new LunarLanderModel(preferences);

    const yBefore = model.lander.positionProperty.value.y;
    expect(model.lander.thrustProperty.value).toBeCloseTo(0, 6);

    model.startGame();
    model.step(FIXED_DT);

    expect(model.lander.positionProperty.value.y).toBeLessThan(yBefore);
    expect(model.crashStateProperty.value).toBe(CrashState.IN_FLIGHT);
  });

  it("reset restores IN_FLIGHT crash state", () => {
    const preferences = new LunarLanderPreferencesModel();
    model = new LunarLanderModel(preferences);
    model.crashStateProperty.value = CrashState.CRASH_LANDED;

    model.reset();

    expect(model.crashStateProperty.value).toBe(CrashState.IN_FLIGHT);
    expect(model.hasStartedProperty.value).toBe(false);
  });

  it("full thrust falls slower than free fall", () => {
    const preferences = new LunarLanderPreferencesModel();
    const freeFall = new LunarLanderModel(preferences);
    const thrusting = new LunarLanderModel(preferences);

    freeFall.startGame();
    thrusting.startGame();
    thrusting.setThrust(LunarLanderConstants.MAX_THRUST);

    for (let i = 0; i < 10; i++) {
      freeFall.step(FIXED_DT);
      thrusting.step(FIXED_DT);
    }

    expect(thrusting.lander.positionProperty.value.y).toBeGreaterThan(freeFall.lander.positionProperty.value.y);
    freeFall.reset();
    thrusting.reset();
    model = freeFall;
  });
});
