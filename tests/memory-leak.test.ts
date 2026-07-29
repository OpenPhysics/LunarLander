/**
 * Fleet-standard memory-leak regression suite.
 * LunarLanderModel is created, started, stepped, reset, and dropped for GC.
 */

import { describe, expect, it } from "vitest";
import LunarLanderConstants from "../src/LunarLanderConstants.js";
import { LunarLanderModel } from "../src/lunar-lander/model/LunarLanderModel.js";
import { LunarLanderPreferencesModel } from "../src/preferences/LunarLanderPreferencesModel.js";

const FIXED_DT: number = LunarLanderConstants.FIXED_DT;

async function forceGC(earlyExitRef?: WeakRef<object>): Promise<void> {
  for (let i = 0; i < 15; i++) {
    globalThis.gc?.();
    await new Promise<void>((r) => setTimeout(r, 50));
    if (earlyExitRef !== undefined && earlyExitRef.deref() === undefined) {
      return;
    }
    if (earlyExitRef !== undefined) {
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }
}

function createAndDropModel(): WeakRef<object> {
  const preferences = new LunarLanderPreferencesModel();
  const model = new LunarLanderModel(preferences);
  model.startGame();
  model.step(FIXED_DT);
  model.reset();
  return new WeakRef<object>(model);
}

describe("Memory leak regression", () => {
  it("global.gc is available (--expose-gc)", () => {
    expect(globalThis.gc).toBeDefined();
  });

  it("sanity: plain object is collected", async () => {
    const ref = (() => new WeakRef({ hello: "world" }))();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("LunarLanderModel is collected after drop", async () => {
    const ref = createAndDropModel();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("repeated create/drop cycles leave no survivors", async () => {
    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 10; i++) {
      refs.push(createAndDropModel());
    }
    await forceGC();
    expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
  });
});
