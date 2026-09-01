import { colors } from "./colors";
import { gradients } from "./gradients";
import { radius } from "./radius";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { animations } from "./animations";
import { shadows } from "./shadows";
import { glass } from "./glass";
import { layout } from "./layout";
import { icons } from "./icons";
import { zIndex } from "./zIndex";
import { motion } from "./motion";

export const theme = {
  colors,
  gradients,
  radius,
  typography,
  spacing,
  animations,
  shadows,
  glass,
  layout,
  icons,
  zIndex,
  motion,
};

export type Theme = typeof theme;
export default theme;
