// Centralized color theme - Change colors here and they apply everywhere!
// Clean white theme with professional blue accents

export const Colors = {
  // Primary Colors - Professional Blue
  primary: '#2563EB',        // Modern blue - Main brand color
  primaryLight: '#60A5FA',   // Lighter blue for hover/active states
  primaryDark: '#1D4ED8',    // Darker blue for pressed states
  
  // Secondary Colors
  secondary: '#10B981',      // Success green
  secondaryLight: '#34D399', // Lighter green
  secondaryDark: '#059669',  // Darker green
  
  // Status Colors
  danger: '#EF4444',         // Red - Errors/destructive actions
  dangerLight: '#F87171',    // Lighter red
  dangerDark: '#DC2626',     // Darker red
  
  warning: '#F59E0B',        // Amber - Warnings
  warningLight: '#FBBF24',   // Lighter amber
  warningDark: '#D97706',    // Darker amber
  
  info: '#2563EB',           // Info messages (same as primary)
  
  // Neutral Colors
  dark: '#1F2937',           // Dark gray - Primary text
  darkSecondary: '#4B5563',  // Secondary text
  darkTertiary: '#6B7280',   // Tertiary text/disabled
  
  light: '#F9FAFB',          // Very light gray - Backgrounds
  lightSecondary: '#F3F4F6', // Secondary backgrounds
  
  canvas: '#FFFFFF',         // Pure white - Cards/surfaces
  border: '#E5E7EB',         // Light borders
  
  // Status Bar & Navigation
  statusBar: '#2563EB',      // Blue status bar background
  statusBarText: '#FFFFFF',  // Status bar text/icons
  
  // Text Colors
  text: {
    primary: '#1F2937',      // Main text
    secondary: '#4B5563',    // Secondary text
    tertiary: '#6B7280',     // Disabled/placeholder text
    inverse: '#FFFFFF',      // Text on dark backgrounds
    link: '#2563EB',         // Links
  },
  
  // Background Colors - White theme
  background: {
    primary: '#FFFFFF',      // Pure white main background
    secondary: '#F9FAFB',    // Very light gray secondary background
    tertiary: '#F3F4F6',     // Light gray tertiary background
    blue: '#2563EB',         // Blue background (primary brand color)
    blueLight: '#EFF6FF',    // Very light blue background
    blueMedium: '#DBEAFE',   // Light blue background
    blueDark: '#1D4ED8',     // Dark blue background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
  },
  
  // Component Specific
  card: {
    background: '#FFFFFF',
    border: '#E5E7EB',
    shadow: 'rgba(37, 99, 235, 0.08)',
  },
  
  button: {
    primary: '#2563EB',      // Blue buttons
    primaryText: '#FFFFFF',
    secondary: '#F9FAFB',
    secondaryText: '#1F2937',
    disabled: '#F3F4F6',
    disabledText: '#9CA3AF',
  },
  
  input: {
    background: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#2563EB',  // Blue border on focus
    text: '#1F2937',
    placeholder: '#9CA3AF',
  },
  
  // Additional Colors
  textSecondary: '#57606A',
  
  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
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
