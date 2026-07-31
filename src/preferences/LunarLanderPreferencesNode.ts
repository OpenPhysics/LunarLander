/**
 * LunarLanderPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound to
 * LunarLanderPreferencesModel Properties (initial values from query parameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import LunarLanderColors from "../LunarLanderColors.js";
import LunarLanderNamespace from "../LunarLanderNamespace.js";
import type { LunarLanderPreferencesModel } from "./LunarLanderPreferencesModel.js";

export class LunarLanderPreferencesNode extends VBox {
  public constructor(preferencesModel: LunarLanderPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // Preferences dialog is always white — use control-surface colors, not textColorProperty.
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: LunarLanderColors.controlSurfaceTextColorProperty,
    });

    const showVectorsCheckbox = new Checkbox(
      preferencesModel.showVectorsProperty,
      new Text(prefStrings.showVectorsStringProperty, {
        font: new PhetFont(14),
        fill: LunarLanderColors.controlSurfaceTextColorProperty,
      }),
      {
        spacing: 8,
        checkboxColor: LunarLanderColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: LunarLanderColors.controlSurfaceColorProperty,
        ...(tandem && { tandem: tandem.createTandem("showVectorsCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, showVectorsCheckbox],
    });
  }
}

LunarLanderNamespace.register("LunarLanderPreferencesNode", LunarLanderPreferencesNode);
