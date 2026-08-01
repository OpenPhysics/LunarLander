/**
 * LunarLanderPanel.ts
 *
 * A pre-themed Panel that automatically uses LunarLanderColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { LunarLanderPanel } from "../../common/LunarLanderPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new LunarLanderPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new LunarLanderPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new LunarLanderPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import LunarLanderColors from "../LunarLanderColors.js";
import { PANEL_CORNER_RADIUS } from "../LunarLanderConstants.js";

export type LunarLanderPanelOptions = PanelOptions;

export class LunarLanderPanel extends Panel {
  public constructor(content: Node, providedOptions?: LunarLanderPanelOptions) {
    const options = optionize<LunarLanderPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: LunarLanderColors.panelBackgroundColorProperty,
        stroke: LunarLanderColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
