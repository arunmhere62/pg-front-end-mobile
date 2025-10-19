// Main theme export - Import this in your components
import Colors, { withOpacity } from './colors';
import Spacing from './spacing';
import Typography from './typography';

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  withOpacity,
};

export { Colors, Spacing, Typography, withOpacity };
export default Theme;
