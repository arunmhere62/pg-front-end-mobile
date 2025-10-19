// Centralized color theme - Change colors here and they apply everywhere!
// Based on GitHub's color palette

export const Colors = {
  // Primary Colors
  primary: '#0969DA',        // GitHub blue - Main brand color
  primaryLight: '#54A3FF',   // Lighter blue for hover/active states
  primaryDark: '#0550AE',    // Darker blue for pressed states
  
  // Secondary Colors
  secondary: '#1F883D',      // GitHub green - Success states
  secondaryLight: '#26A641', // Lighter green
  secondaryDark: '#116329',  // Darker green
  
  // Status Colors
  danger: '#CF222E',         // GitHub red - Errors/destructive actions
  dangerLight: '#FF7B72',    // Lighter red
  dangerDark: '#A40E26',     // Darker red
  
  warning: '#BF8700',        // GitHub yellow - Warnings
  warningLight: '#D4A72C',   // Lighter yellow
  warningDark: '#9A6700',    // Darker yellow
  
  info: '#0969DA',           // Info messages (same as primary)
  
  // Neutral Colors
  dark: '#24292F',           // GitHub dark gray - Primary text
  darkSecondary: '#57606A',  // Secondary text
  darkTertiary: '#6E7781',   // Tertiary text/disabled
  
  light: '#F6F8FA',          // GitHub light gray - Backgrounds
  lightSecondary: '#EAEEF2', // Secondary backgrounds
  
  canvas: '#FFFFFF',         // Pure white - Cards/surfaces
  border: '#D0D7DE',         // Borders
  
  // Status Bar & Navigation
  statusBar: '#0969DA',      // Status bar background
  statusBarText: '#FFFFFF',  // Status bar text/icons
  
  // Text Colors
  text: {
    primary: '#24292F',      // Main text
    secondary: '#57606A',    // Secondary text
    tertiary: '#6E7781',     // Disabled/placeholder text
    inverse: '#FFFFFF',      // Text on dark backgrounds
    link: '#0969DA',         // Links
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',      // Main background
    secondary: '#F6F8FA',    // Secondary background
    tertiary: '#EAEEF2',     // Tertiary background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
  },
  
  // Component Specific
  card: {
    background: '#FFFFFF',
    border: '#D0D7DE',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  button: {
    primary: '#0969DA',
    primaryText: '#FFFFFF',
    secondary: '#F6F8FA',
    secondaryText: '#24292F',
    disabled: '#EAEEF2',
    disabledText: '#6E7781',
  },
  
  input: {
    background: '#FFFFFF',
    border: '#D0D7DE',
    borderFocus: '#0969DA',
    text: '#24292F',
    placeholder: '#6E7781',
  },
};

// Opacity helpers
export const withOpacity = (color: string, opacity: number) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Export default theme
export default Colors;
