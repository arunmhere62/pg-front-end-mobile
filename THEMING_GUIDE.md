# Theming Guide - Professional App Theming System

## 🎨 Overview

Your app now has a **centralized theming system** like professional apps (Instagram, Twitter, GitHub). Change colors in ONE place and they apply everywhere!

## 📁 Theme Structure

```
src/theme/
├── colors.ts      # All color definitions
├── spacing.ts     # Spacing/padding values
├── typography.ts  # Font sizes and weights
└── index.ts       # Main export
```

## 🚀 How to Use

### 1. Import the Theme

```typescript
import { Theme } from '../../theme';
// or
import { Colors, Spacing, Typography } from '../../theme';
```

### 2. Use Theme Values

```typescript
<View style={{ 
  backgroundColor: Theme.colors.primary,
  padding: Theme.spacing.lg,
}}>
  <Text style={{
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
  }}>
    Hello World
  </Text>
</View>
```

## 🎨 Available Colors

### Primary Colors
```typescript
Theme.colors.primary         // #0969DA - GitHub blue
Theme.colors.primaryLight    // #54A3FF
Theme.colors.primaryDark     // #0550AE

Theme.colors.secondary       // #1F883D - GitHub green
Theme.colors.danger          // #CF222E - GitHub red
Theme.colors.warning         // #BF8700 - GitHub yellow
```

### Text Colors
```typescript
Theme.colors.text.primary    // Main text
Theme.colors.text.secondary  // Secondary text
Theme.colors.text.inverse    // White text on dark backgrounds
Theme.colors.text.link       // Link color
```

### Background Colors
```typescript
Theme.colors.background.primary    // #FFFFFF
Theme.colors.background.secondary  // #F6F8FA
Theme.colors.statusBar            // Status bar color
```

### Component Colors
```typescript
Theme.colors.card.background
Theme.colors.button.primary
Theme.colors.input.border
```

## 📏 Spacing System

```typescript
Theme.spacing.xs    // 4
Theme.spacing.sm    // 8
Theme.spacing.md    // 16
Theme.spacing.lg    // 24
Theme.spacing.xl    // 32
Theme.spacing.xxl   // 48
Theme.spacing.xxxl  // 64
```

**Usage:**
```typescript
padding: Theme.spacing.lg,        // 24
marginBottom: Theme.spacing.xl,   // 32
```

## 📝 Typography System

### Font Sizes
```typescript
Theme.typography.fontSize.xs      // 12
Theme.typography.fontSize.sm      // 14
Theme.typography.fontSize.base    // 16
Theme.typography.fontSize.lg      // 18
Theme.typography.fontSize.xl      // 20
Theme.typography.fontSize['2xl']  // 24
Theme.typography.fontSize['3xl']  // 30
Theme.typography.fontSize['4xl']  // 36
```

### Font Weights
```typescript
Theme.typography.fontWeight.normal    // '400'
Theme.typography.fontWeight.medium    // '500'
Theme.typography.fontWeight.semibold  // '600'
Theme.typography.fontWeight.bold      // '700'
```

**Usage:**
```typescript
fontSize: Theme.typography.fontSize['2xl'],
fontWeight: Theme.typography.fontWeight.bold,
```

## 🎭 Opacity Helper

Add opacity to any color:

```typescript
Theme.withOpacity(Theme.colors.primary, 0.5)  // 50% opacity
Theme.withOpacity('#FFFFFF', 0.8)             // 80% opacity
```

**Usage:**
```typescript
backgroundColor: Theme.withOpacity(Theme.colors.canvas, 0.2),
color: Theme.withOpacity(Theme.colors.text.inverse, 0.8),
```

## 🔄 How to Change Theme

### Change to a Different Color Scheme

Edit `src/theme/colors.ts`:

```typescript
// Example: Change to Purple Theme
export const Colors = {
  primary: '#8B5CF6',        // Purple
  secondary: '#10B981',      // Keep green
  statusBar: '#8B5CF6',      // Purple status bar
  // ... rest stays the same
};
```

### Change to Dark Mode

```typescript
export const Colors = {
  primary: '#3B82F6',
  dark: '#FFFFFF',           // White text in dark mode
  light: '#1F2937',          // Dark background
  canvas: '#111827',         // Dark cards
  text: {
    primary: '#FFFFFF',      // White text
    secondary: '#9CA3AF',    // Gray text
    inverse: '#000000',      // Black text on light
  },
  background: {
    primary: '#111827',      // Dark background
    secondary: '#1F2937',    // Darker background
  },
};
```

## 📱 Example: Complete Screen

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Theme } from '../../theme';

export const MyScreen = () => {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Theme.colors.background.primary,
      padding: Theme.spacing.lg,
    }}>
      {/* Header */}
      <Text style={{
        fontSize: Theme.typography.fontSize['3xl'],
        fontWeight: Theme.typography.fontWeight.bold,
        color: Theme.colors.text.primary,
        marginBottom: Theme.spacing.md,
      }}>
        Welcome
      </Text>

      {/* Button */}
      <TouchableOpacity style={{
        backgroundColor: Theme.colors.primary,
        padding: Theme.spacing.md,
        borderRadius: 8,
      }}>
        <Text style={{
          color: Theme.colors.text.inverse,
          fontSize: Theme.typography.fontSize.base,
          fontWeight: Theme.typography.fontWeight.semibold,
          textAlign: 'center',
        }}>
          Click Me
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 🎯 Benefits

✅ **Change once, apply everywhere** - Update colors in one file
✅ **Consistent design** - Same spacing/colors across the app
✅ **Easy dark mode** - Just swap the color values
✅ **Professional** - Industry standard approach
✅ **Type-safe** - TypeScript autocomplete for all values
✅ **Maintainable** - Easy to update and scale

## 🔧 Quick Theme Changes

### Want Blue Theme?
```typescript
primary: '#3B82F6'
statusBar: '#3B82F6'
```

### Want Green Theme?
```typescript
primary: '#10B981'
statusBar: '#10B981'
```

### Want Red Theme?
```typescript
primary: '#EF4444'
statusBar: '#EF4444'
```

### Want Purple Theme?
```typescript
primary: '#8B5CF6'
statusBar: '#8B5CF6'
```

Just change these two values in `src/theme/colors.ts` and your entire app updates! 🎨

## 📚 Pro Tips

1. **Always use theme values** - Never hardcode colors like `'#3B82F6'`
2. **Use spacing system** - Never hardcode padding like `padding: 24`
3. **Use typography system** - Never hardcode font sizes
4. **Test theme changes** - Change primary color and see it everywhere
5. **Document custom colors** - Add comments for custom additions

---

**Now you have a professional theming system! Change the theme in `src/theme/colors.ts` and watch your entire app transform!** 🚀
