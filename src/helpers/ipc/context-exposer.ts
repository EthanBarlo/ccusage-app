import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeCcusageContext } from "./ccusage/ccusage-context";
import { exposeSettingsContext } from "./settings/settings-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeCcusageContext();
  exposeSettingsContext();
}
