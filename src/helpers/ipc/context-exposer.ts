import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeCcusageContext } from "./ccusage/ccusage-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeCcusageContext();
}
