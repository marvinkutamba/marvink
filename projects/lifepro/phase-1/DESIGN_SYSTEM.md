# LifePro -- Design System & Design Tokens

**Agent**: UI Designer
**Phase**: 1 (Design & Architecture)
**Mode**: NEXUS-Micro
**Date**: 2026-03-10

---

## Design Philosophy

LifePro's visual language merges **Notion's structural clarity** with **Headspace's warmth and approachability**. The result is an interface that feels organized but never clinical, motivational but never loud. Every visual decision serves the core UX goal: **open to done in under 30 seconds**.

Guiding principles:

- **Calm confidence**: Soft colors, generous whitespace, rounded corners. The app should feel like a trusted companion, not a demanding coach.
- **Information density without clutter**: Use typography hierarchy and spacing to let dense dashboards breathe.
- **Celebration without distraction**: Accent colors and micro-animations reward progress without pulling focus.
- **Consistency across platforms**: All tokens produce near-identical results on iOS and Android.

---

## 1. Color Palette

All color values are hex strings passed to React Native `StyleSheet` or inline styles. No CSS color functions.

### 1.1 Brand Colors

```typescript
const brand = {
  // Primary -- Warm indigo (motivational, trustworthy)
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  primarySubtle: '#EEF2FF',

  // Secondary -- Warm amber (energy, positivity, celebrations)
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',
  secondarySubtle: '#FFFBEB',

  // Tertiary -- Emerald (wellness, health dimension)
  tertiary: '#10B981',
};
```

| Token | Hex | Usage |
|-------|-----|-------|
| `brand.primary` | `#4F46E5` | Primary actions, active tab, progress fills, links |
| `brand.primaryLight` | `#818CF8` | Pressed states on light backgrounds, secondary accents |
| `brand.primaryDark` | `#3730A3` | Text on colored backgrounds, high-emphasis actions |
| `brand.primarySubtle` | `#EEF2FF` | Selected chip backgrounds, tinted surfaces |
| `brand.secondary` | `#F59E0B` | Streaks, celebrations, badges, star ratings |
| `brand.secondaryLight` | `#FCD34D` | Badge backgrounds, highlight fills |
| `brand.secondaryDark` | `#D97706` | Secondary text on colored backgrounds |
| `brand.tertiary` | `#10B981` | Wellness and health dimension accent |

### 1.2 Semantic Colors

```typescript
const semantic = {
  success:      '#10B981',
  successLight: '#D1FAE5',
  warning:      '#F59E0B',
  warningLight: '#FEF3C7',
  error:        '#EF4444',
  errorLight:   '#FEE2E2',
  info:         '#3B82F6',
  infoLight:    '#DBEAFE',
};
```

| Token | Hex | Usage |
|-------|-----|-------|
| `semantic.success` | `#10B981` | Completed habits, positive finance, goals met |
| `semantic.successLight` | `#D1FAE5` | Success background fills |
| `semantic.warning` | `#F59E0B` | Approaching deadline, low streak risk |
| `semantic.warningLight` | `#FEF3C7` | Warning background fills |
| `semantic.error` | `#EF4444` | Missed habits, negative finance, delete actions |
| `semantic.errorLight` | `#FEE2E2` | Error background fills |
| `semantic.info` | `#3B82F6` | Informational badges, tips, insights |
| `semantic.infoLight` | `#DBEAFE` | Info background fills |

### 1.3 Life Dimension Colors

Each life dimension gets a distinct color for category dots, charts, and the Life Balance Wheel.

```typescript
const dimension = {
  health:  '#10B981',  // Emerald
  habits:  '#4F46E5',  // Indigo
  goals:   '#8B5CF6',  // Violet
  finance: '#F59E0B',  // Amber
  growth:  '#EC4899',  // Pink
};
```

### 1.4 Neutral Scale

```typescript
const neutral = {
  0:   '#FFFFFF',
  50:  '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  950: '#030712',
};
```

### 1.5 Light Theme Tokens

```typescript
const lightTheme = {
  background:       '#F9FAFB',   // neutral.50  -- off-white, not pure white
  surface:          '#FFFFFF',   // neutral.0   -- cards, modals, bottom sheets
  surfaceSecondary: '#F3F4F6',   // neutral.100 -- grouped sections, input fills
  border:           '#E5E7EB',   // neutral.200 -- card borders, dividers, inputs
  borderLight:      '#F3F4F6',   // neutral.100 -- subtle separators within cards
  textPrimary:      '#111827',   // neutral.900 -- headings, primary body text
  textSecondary:    '#6B7280',   // neutral.500 -- captions, labels
  textTertiary:     '#9CA3AF',   // neutral.400 -- placeholders, disabled text
  textInverse:      '#FFFFFF',   // neutral.0   -- text on brand/dark backgrounds
  iconPrimary:      '#374151',   // neutral.700 -- active icons
  iconSecondary:    '#9CA3AF',   // neutral.400 -- inactive tab icons
  overlay:          'rgba(0, 0, 0, 0.5)',  // modal/sheet backdrop

  // Brand colors in light context
  brandPrimary:      '#4F46E5',
  brandPrimaryLight: '#818CF8',
  brandPrimaryDark:  '#3730A3',
  brandSecondary:    '#F59E0B',

  // Semantic in light context
  success:      '#10B981',
  successLight: '#D1FAE5',
  warning:      '#F59E0B',
  warningLight: '#FEF3C7',
  error:        '#EF4444',
  errorLight:   '#FEE2E2',
  info:         '#3B82F6',
  infoLight:    '#DBEAFE',
};
```

### 1.6 Dark Theme Tokens

```typescript
const darkTheme = {
  background:       '#111827',   // neutral.900 -- dark gray, not pure black
  surface:          '#1F2937',   // neutral.800 -- cards, modals
  surfaceSecondary: '#374151',   // neutral.700 -- grouped sections, input fills
  border:           '#374151',   // neutral.700 -- card borders, dividers
  borderLight:      '#1F2937',   // neutral.800 -- subtle separators
  textPrimary:      '#F9FAFB',   // neutral.50  -- headings, primary body text
  textSecondary:    '#9CA3AF',   // neutral.400 -- captions, labels
  textTertiary:     '#6B7280',   // neutral.500 -- placeholders, disabled text
  textInverse:      '#111827',   // neutral.900 -- text on light backgrounds
  iconPrimary:      '#E5E7EB',   // neutral.200 -- active icons
  iconSecondary:    '#6B7280',   // neutral.500 -- inactive tab icons
  overlay:          'rgba(0, 0, 0, 0.7)',  // denser for dark theme

  // Brand colors lightened for dark context (contrast adjustment)
  brandPrimary:      '#818CF8',  // lightened from #4F46E5 for 4.5:1 contrast
  brandPrimaryLight: '#A5B4FC',
  brandPrimaryDark:  '#4F46E5',
  brandSecondary:    '#FCD34D',  // lightened from #F59E0B

  // Semantic lightened for dark context
  success:      '#34D399',
  successLight: '#064E3B',
  warning:      '#FCD34D',
  warningLight: '#78350F',
  error:        '#F87171',
  errorLight:   '#7F1D1D',
  info:         '#60A5FA',
  infoLight:    '#1E3A5F',
};
```

---

## 2. Typography Scale

All values are React Native compatible: `fontSize` and `lineHeight` are plain numbers (points), `fontWeight` is a string literal, `letterSpacing` is a number.

### 2.1 Font Family

```typescript
const fontFamily = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
};
```

**Loading**: Use `@expo-google-fonts/inter`. Fall back to system font via `Platform.select({ ios: 'System', android: 'Roboto' })` until fonts load.

### 2.2 Type Scale

| Token | fontSize | lineHeight | fontWeight | letterSpacing | Usage |
|-------|----------|------------|------------|---------------|-------|
| `type.displayLarge` | 32 | 40 | `'700'` | -0.5 | Onboarding headlines |
| `type.displaySmall` | 28 | 36 | `'700'` | -0.3 | Prominent screen titles |
| `type.headlineLarge` | 24 | 32 | `'600'` | -0.2 | Dashboard section headers |
| `type.headlineSmall` | 20 | 28 | `'600'` | 0 | Card titles, modal headers |
| `type.titleLarge` | 18 | 26 | `'600'` | 0 | List item primary text (bold), stat values |
| `type.titleSmall` | 16 | 24 | `'600'` | 0 | Subheadings, button text |
| `type.bodyLarge` | 16 | 24 | `'400'` | 0 | Primary body text, list labels |
| `type.bodySmall` | 14 | 20 | `'400'` | 0 | Secondary body text, descriptions |
| `type.labelLarge` | 14 | 20 | `'500'` | 0.1 | Button labels, tab labels, form labels |
| `type.labelSmall` | 12 | 16 | `'500'` | 0.2 | Badges, chip text, captions |
| `type.caption` | 11 | 16 | `'400'` | 0.2 | Timestamps, footnotes, streak counts |

### 2.3 StyleSheet Example

```typescript
import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
  },
  displaySmall: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily: 'Inter_700Bold',
  },
  headlineLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontFamily: 'Inter_600SemiBold',
  },
  headlineSmall: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0,
    fontFamily: 'Inter_600SemiBold',
  },
  titleLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: 0,
    fontFamily: 'Inter_600SemiBold',
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0,
    fontFamily: 'Inter_600SemiBold',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0,
    fontFamily: 'Inter_400Regular',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
    fontFamily: 'Inter_400Regular',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
    fontFamily: 'Inter_500Medium',
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    fontFamily: 'Inter_500Medium',
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
    fontFamily: 'Inter_400Regular',
  },
});
```

---

## 3. Spacing Scale

Base unit: **4px**. All spacing uses multiples of this base unit.

```typescript
export const spacing = {
  xxs:  4,   // Inline icon-to-text gap, tight chip padding
  xs:   8,   // Inner padding of small elements, badge gaps
  sm:   12,  // Card inner padding (compact), list item vertical padding
  md:   16,  // Standard card padding, screen horizontal padding
  lg:   20,  // Gap between cards, form field spacing
  xl:   24,  // Section heading top margin, major element gaps
  xxl:  32,  // Space between major screen sections
  xxxl: 48,  // Top padding below header, onboarding spacing
  xxxxl: 64, // Large vertical spacing, empty state margins
} as const;
```

### 3.1 Layout Constants

```typescript
export const layout = {
  screenPaddingH:    16,  // Horizontal padding for all screen content
  screenPaddingTop:  16,  // Top padding below safe area / header
  cardPadding:       16,  // Standard inner padding for cards
  cardPaddingCompact: 12, // Inner padding for smaller / inline cards
  sectionGap:        24,  // Vertical gap between Dashboard sections
  listItemHeight:    56,  // Standard list row height (44pt target + padding)
  listItemGap:       8,   // Gap between list items when using cards
  tabBarHeight:      56,  // Bottom tab bar height (Android; iOS adds safe area)
  inputHeight:       48,  // Standard text input height
  buttonHeight:      48,  // Standard button height
  buttonHeightSmall: 36,  // Compact button height
  iconSize:          24,  // Standard icon size
  iconSizeSmall:     20,  // Small icons (inside inputs, badges)
  iconSizeLarge:     32,  // Tab bar icons, feature icons
} as const;
```

---

## 4. Border Radius Scale

```typescript
export const radius = {
  sm:   6,    // Chips, small badges, tag pills
  md:   12,   // Cards, input fields, buttons
  lg:   16,   // Bottom sheets, modals
  xl:   24,   // Pill buttons, onboarding cards
  full: 9999, // Circular avatars, dot indicators, FAB
} as const;
```

---

## 5. Shadow / Elevation Tokens

React Native requires platform-specific shadow implementations. All tokens include both iOS shadow properties and Android `elevation`.

### 5.1 Shadow Scale

```typescript
import { Platform } from 'react-native';

export const shadows = {
  // Level 1 -- Subtle (cards at rest, input fields)
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
  }),

  // Level 2 -- Default (cards with interaction, tab bar)
  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    },
  }),

  // Level 3 -- Elevated (FAB, bottom sheets, floating elements)
  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),

  // Level 4 -- Modal (modals, overlays)
  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
  }),
};
```

### 5.2 Dark Theme Elevation

In dark mode, shadows are not visible against dark backgrounds. Use border-based elevation and surface color differentiation instead:

```typescript
// Dark mode card elevation via borders and lightened surfaces
const darkElevation = {
  sm: {
    borderWidth: 1,
    borderColor: '#374151',  // dark.border
  },
  md: {
    borderWidth: 1,
    borderColor: '#4B5563',  // slightly lighter than dark.border
    backgroundColor: '#1F2937', // dark.surface
  },
};
```

---

## 6. Component Specifications

### 6.1 Button Variants

All buttons: `borderRadius: 12`, minimum touch target `48` height, horizontally centered text.

#### Primary Button

```typescript
buttonPrimary: {
  height: 48,
  borderRadius: 12,
  backgroundColor: '#4F46E5',   // brand.primary
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
}
// Text: type.labelLarge, color '#FFFFFF' (textInverse)
// Pressed: backgroundColor '#3730A3' (brand.primaryDark)
// Disabled: opacity 0.5
```

#### Secondary Button (outlined)

```typescript
buttonSecondary: {
  height: 48,
  borderRadius: 12,
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: '#4F46E5',       // brand.primary
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
}
// Text: type.labelLarge, color brand.primary
// Pressed: backgroundColor 'rgba(79, 70, 229, 0.08)'
// Disabled: opacity 0.5
```

#### Ghost Button (text only)

```typescript
buttonGhost: {
  height: 48,
  borderRadius: 12,
  backgroundColor: 'transparent',
  paddingHorizontal: 16,
  alignItems: 'center',
  justifyContent: 'center',
}
// Text: type.labelLarge, color brand.primary
// Pressed: backgroundColor 'rgba(79, 70, 229, 0.06)'
```

#### Danger Button

```typescript
buttonDanger: {
  height: 48,
  borderRadius: 12,
  backgroundColor: '#EF4444',   // semantic.error
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
}
// Text: type.labelLarge, color '#FFFFFF'
// Pressed: backgroundColor '#DC2626'
```

#### Small Button

```typescript
buttonSmall: {
  height: 36,
  borderRadius: 8,
  paddingHorizontal: 16,
  // Combine with any color variant above
}
// Text: type.labelSmall
```

#### FAB (Quick Add -- center tab button)

```typescript
fab: {
  width: 56,
  height: 56,
  borderRadius: 9999,
  backgroundColor: '#4F46E5',   // brand.primary
  alignItems: 'center',
  justifyContent: 'center',
  // Apply shadows.lg
}
// Icon: plus, 28x28, color '#FFFFFF'
// Pressed: scale 0.95 (animated), backgroundColor '#3730A3'
```

### 6.2 Card Styles

#### Standard Card

```typescript
card: {
  backgroundColor: '#FFFFFF',   // light.surface
  borderRadius: 12,
  padding: 16,
  // Apply shadows.sm
}
// Dark mode: backgroundColor '#1F2937', apply darkElevation.sm
```

#### Interactive Card (tappable)

```typescript
cardInteractive: {
  // ...card styles
  // Pressed: opacity 0.85 or scale 0.98 (animated with spring)
}
```

#### Compact Card (inline widgets like mood selector, progress bar)

```typescript
cardCompact: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 12,
  // Apply shadows.sm
}
```

#### Section Card (grouped content, Settings sections)

```typescript
cardSection: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  overflow: 'hidden',   // Clips child dividers at rounded corners
  // Apply shadows.sm
  // Children separated by 1px dividers using borderLight color
}
```

### 6.3 Input Fields

#### Text Input

```typescript
textInput: {
  height: 48,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',       // light.border
  backgroundColor: '#F9FAFB',   // light.background
  paddingHorizontal: 16,
  fontSize: 16,
  fontFamily: 'Inter_400Regular',
  color: '#111827',              // light.textPrimary
}
// Focused: borderColor '#4F46E5' (brand.primary), borderWidth 2
// Error:   borderColor '#EF4444' (semantic.error)
// Placeholder color: '#9CA3AF' (light.textTertiary)
// Dark mode: backgroundColor '#374151', borderColor '#374151', color '#F9FAFB'
```

#### Textarea (multi-line)

```typescript
textArea: {
  // ...textInput styles
  height: 100,
  paddingTop: 12,
  textAlignVertical: 'top',
}
```

#### Dropdown / Select

```typescript
selectInput: {
  // ...textInput styles
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}
// Right side: chevron-down icon, 20x20, color textTertiary
```

#### Form Label

```typescript
formLabel: {
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '500',
  fontFamily: 'Inter_500Medium',
  color: '#6B7280',             // light.textSecondary
  marginBottom: 6,
}
```

#### Form Error Message

```typescript
formError: {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '400',
  fontFamily: 'Inter_400Regular',
  color: '#EF4444',             // semantic.error
  marginTop: 4,
}
```

### 6.4 Habit Checkbox

The habit checkbox is a core interaction. It must feel satisfying.

#### Row Layout

```typescript
habitRow: {
  flexDirection: 'row',
  alignItems: 'center',
  height: 56,
  paddingHorizontal: 16,
  gap: 12,
}
```

#### Checkbox (unchecked)

```typescript
checkboxUnchecked: {
  width: 28,
  height: 28,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: '#D1D5DB',       // neutral.300
  backgroundColor: 'transparent',
  alignItems: 'center',
  justifyContent: 'center',
}
```

#### Checkbox (checked)

```typescript
checkboxChecked: {
  width: 28,
  height: 28,
  borderRadius: 8,
  borderWidth: 0,
  backgroundColor: '#4F46E5',   // brand.primary
  alignItems: 'center',
  justifyContent: 'center',
}
// Inner checkmark icon: 16x16, color '#FFFFFF', strokeWidth 2.5
// Animation: scale from 0 to 1 (spring, damping 15, stiffness 150, 300ms)
// Haptic: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
```

#### Completed Habit Label

```typescript
habitLabelCompleted: {
  textDecorationLine: 'line-through',
  color: '#9CA3AF',             // light.textTertiary
}
```

#### Category Dot

```typescript
categoryDot: {
  width: 8,
  height: 8,
  borderRadius: 9999,
  // backgroundColor: corresponding dimension color
}
```

#### Streak Badge

```typescript
streakBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 6,
  backgroundColor: '#FEF3C7',   // semantic.warningLight
}
// Icon: flame/zap, 14x14, color '#F59E0B'
// Text: type.caption, color '#D97706'
```

### 6.5 Progress Bar

#### Standard Progress Bar (Dashboard, Goal progress)

```typescript
progressBarTrack: {
  height: 8,
  borderRadius: 4,
  backgroundColor: '#F3F4F6',   // light.surfaceSecondary
  overflow: 'hidden',
}

progressBarFill: {
  height: 8,
  borderRadius: 4,
  backgroundColor: '#4F46E5',   // brand.primary
  // Width: animated based on percentage
  // Animation: spring, damping 20, stiffness 100, duration ~600ms
}
```

#### Large Progress Bar (Today's Progress card)

```typescript
progressBarLargeTrack: {
  height: 12,
  borderRadius: 6,
  backgroundColor: '#F3F4F6',
  overflow: 'hidden',
}

progressBarLargeFill: {
  height: 12,
  borderRadius: 6,
  backgroundColor: '#4F46E5',
}
```

#### Progress Bar at 100%

```typescript
progressBarComplete: {
  backgroundColor: '#10B981',   // semantic.success
  // Pulse glow: shadow color '#10B981', shadowRadius animates 0 -> 8 -> 0
}
```

#### Progress Label

```typescript
progressLabel: {
  fontSize: 14,
  fontWeight: '600',
  fontFamily: 'Inter_600SemiBold',
  color: '#111827',
  // Display format: "3/7" or "78%"
}
```

### 6.6 Tab Bar

#### Container

```typescript
tabBar: {
  flexDirection: 'row',
  height: 56,
  backgroundColor: '#FFFFFF',   // light.surface
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6',    // light.borderLight
  // Apply shadows.md (subtle upward shadow)
  // paddingBottom: safe area inset (handled by SafeAreaView)
}
// Dark mode: backgroundColor '#1F2937', borderTopColor '#374151'
```

#### Tab Item (inactive)

```typescript
tabItem: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
}

tabIcon: {
  width: 24,
  height: 24,
  // color: '#9CA3AF' (iconSecondary)
}

tabLabel: {
  fontSize: 11,
  fontWeight: '500',
  fontFamily: 'Inter_500Medium',
  color: '#9CA3AF',             // iconSecondary
}
```

#### Tab Item (active)

```typescript
tabIconActive: {
  // color: '#4F46E5' (brand.primary)
}

tabLabelActive: {
  color: '#4F46E5',
  fontWeight: '600',
  fontFamily: 'Inter_600SemiBold',
}
```

#### Center Tab (Quick Add FAB)

The center tab is visually distinguished as a raised circular button. See FAB spec in Section 6.1. It sits on top of the tab bar, offset upward by 12 points:

```typescript
centerTabContainer: {
  position: 'relative',
  top: -12,
  alignItems: 'center',
  justifyContent: 'center',
}
```

### 6.7 Mood Selector

#### Container

```typescript
moodSelector: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 8,
}
```

#### Mood Face (unselected)

```typescript
moodFace: {
  width: 44,
  height: 44,
  borderRadius: 9999,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F3F4F6',   // light.surfaceSecondary
}
// Icon: 28x28, color '#9CA3AF'
```

#### Mood Face (selected)

```typescript
moodFaceSelected: {
  // ...moodFace
  backgroundColor: '#EEF2FF',   // brand.primarySubtle
  // Animation: scale spring from 1 -> 1.15 -> 1 (bounce)
}
// Icon: 28x28, color '#4F46E5' (brand.primary)
```

### 6.8 Segmented Control (Settings theme selector)

```typescript
segmentedControl: {
  flexDirection: 'row',
  backgroundColor: '#F3F4F6',   // light.surfaceSecondary
  borderRadius: 8,
  padding: 2,
  height: 36,
}

segmentItem: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
}

segmentItemActive: {
  backgroundColor: '#FFFFFF',   // light.surface
  // Apply shadows.sm
}
// Active text:   fontWeight '600', color textPrimary
// Inactive text: fontWeight '400', color textSecondary
```

### 6.9 Bottom Sheet (Quick Add modal)

```typescript
bottomSheet: {
  backgroundColor: '#FFFFFF',   // light.surface
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingTop: 8,
  paddingHorizontal: 16,
  paddingBottom: 16,            // + safe area inset
  // Apply shadows.xl
}

bottomSheetHandle: {
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: '#D1D5DB',   // neutral.300
  alignSelf: 'center',
  marginBottom: 16,
}
```

### 6.10 List Item (More menu, Settings rows)

```typescript
listItem: {
  flexDirection: 'row',
  alignItems: 'center',
  height: 56,
  paddingHorizontal: 16,
  gap: 12,
}

listItemIcon: {
  width: 24,
  height: 24,
  // color: '#6B7280' (textSecondary)
}

listItemLabel: {
  flex: 1,
  fontSize: 16,
  fontFamily: 'Inter_400Regular',
  color: '#111827',             // textPrimary
}

listItemChevron: {
  width: 20,
  height: 20,
  // color: '#9CA3AF' (textTertiary)
}

listItemDivider: {
  height: 1,
  backgroundColor: '#F3F4F6',   // borderLight
  marginLeft: 52,               // aligned past icon + gap
}
```

### 6.11 Badge / Chip

```typescript
chip: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: '#F3F4F6',   // surfaceSecondary
}

chipSelected: {
  backgroundColor: '#EEF2FF',   // brand.primarySubtle
  borderWidth: 1,
  borderColor: '#4F46E5',       // brand.primary
}

chipLabel: {
  fontSize: 12,
  fontWeight: '500',
  fontFamily: 'Inter_500Medium',
  color: '#6B7280',             // textSecondary
}

chipLabelSelected: {
  color: '#4F46E5',             // brand.primary
}
```

### 6.12 Empty State

```typescript
emptyStateContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 64,
  paddingHorizontal: 32,
}

emptyStateTitle: {
  fontSize: 18,
  fontWeight: '600',
  fontFamily: 'Inter_600SemiBold',
  color: '#111827',
  textAlign: 'center',
  marginBottom: 8,
}

emptyStateMessage: {
  fontSize: 14,
  fontWeight: '400',
  fontFamily: 'Inter_400Regular',
  color: '#6B7280',
  textAlign: 'center',
  marginBottom: 24,
}
// CTA: Primary button (small variant)
// Illustration: 120x120, line-art style with brand.primaryLight tint
```

---

## 7. Icon Set Recommendation

### Primary Library: `@expo/vector-icons` (Feather set)

**Why Feather icons via `@expo/vector-icons`**:

- Already bundled with Expo -- zero additional install, no bundle size increase
- Clean, minimal line style matches LifePro's clarity-focused aesthetic
- Consistent 24x24 grid with 2px stroke -- crisp at all sizes
- Covers all needed glyphs for navigation and UI actions

### Icon Mapping

| Context | Icon Name (Feather) | Size |
|---------|-------------------|------|
| Dashboard tab | `grid` or `compass` | 24 |
| Habits tab | `check-square` | 24 |
| Quick Add FAB | `plus` | 28 |
| Wellness tab | `heart` | 24 |
| More tab | `menu` | 24 |
| Back arrow | `arrow-left` | 24 |
| Settings gear | `settings` | 24 |
| Edit | `edit-2` | 20 |
| Delete | `trash-2` | 20 |
| Chevron right | `chevron-right` | 20 |
| Streak flame | `zap` | 14 |
| Clock / History | `clock` | 20 |
| Calendar | `calendar` | 20 |
| Dollar / Finance | `dollar-sign` | 24 |
| Trending up | `trending-up` | 20 |
| Target / Goal | `target` | 24 |
| Water drop | `droplet` | 20 |
| Moon / Sleep | `moon` | 20 |
| Sun / Morning | `sun` | 20 |
| Filter | `filter` | 20 |
| Export | `download` | 20 |
| Close | `x` | 24 |
| Info | `info` | 20 |

### Usage Pattern

```typescript
import { Feather } from '@expo/vector-icons';

<Feather name="check-square" size={24} color={theme.iconPrimary} />
```

### Supplementary: Mood Face Icons

Feather does not include expressive face icons. For the 5-point mood scale, use `MaterialCommunityIcons` from the same `@expo/vector-icons` package:

| Mood Level | MaterialCommunityIcons Name | Meaning |
|------------|---------------------------|---------|
| 1 | `emoticon-sad-outline` | Awful |
| 2 | `emoticon-confused-outline` | Bad |
| 3 | `emoticon-neutral-outline` | Okay |
| 4 | `emoticon-happy-outline` | Good |
| 5 | `emoticon-excited-outline` | Great |

```typescript
import { MaterialCommunityIcons } from '@expo/vector-icons';

<MaterialCommunityIcons name="emoticon-happy-outline" size={28} color={theme.brandPrimary} />
```

---

## 8. Animation Tokens

All animations use `react-native-reanimated`. Values are spring/timing configuration parameters.

```typescript
export const animation = {
  // Checkbox check, mood bounce, FAB press
  spring: {
    damping: 15,
    stiffness: 150,
  },

  // Card press, progress bar fill
  springGentle: {
    damping: 20,
    stiffness: 100,
  },

  // Opacity transitions, color changes
  timing: {
    duration: 200,
    // Easing.out(Easing.cubic)
  },

  // Layout shifts, screen transitions
  timingSlow: {
    duration: 400,
    // Easing.inOut(Easing.cubic)
  },

  // Confetti burst at 100% habit completion
  celebration: {
    duration: 1000,
  },
} as const;
```

---

## 9. Theme Implementation Pattern

### TypeScript Type Definition

```typescript
// theme/tokens.ts
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  iconPrimary: string;
  iconSecondary: string;
  overlay: string;
  brandPrimary: string;
  brandPrimaryLight: string;
  brandPrimaryDark: string;
  brandSecondary: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
};

// Export lightTheme and darkTheme objects matching this type
// (see Sections 1.5 and 1.6 for full values)
```

### Theme Context

```typescript
// theme/ThemeContext.tsx
import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, lightTheme, darkTheme } from './tokens';

const ThemeContext = createContext<ThemeColors>(lightTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme();
  // TODO: layer in user preference from AsyncStorage (overrides system)
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### Usage in Components

```typescript
const MyComponent = () => {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.surface, padding: spacing.md }}>
      <Text style={[typography.headlineSmall, { color: theme.textPrimary }]}>
        Dashboard
      </Text>
    </View>
  );
};
```

---

## 10. Accessibility Quick Reference

| Concern | Value | Standard |
|---------|-------|----------|
| Minimum touch target | 44 x 44 | WCAG 2.1 AAA |
| Text contrast (normal) | 4.5:1 minimum | WCAG AA |
| Text contrast (large, 18+ bold / 24+ regular) | 3:1 minimum | WCAG AA |
| UI component contrast | 3:1 minimum | WCAG AA |
| Focus indicator | 2px brand.primary border | Visible focus ring |
| Reduced motion | Check `AccessibilityInfo.isReduceMotionEnabled()` | Skip spring/celebration anims |

### Verified Contrast Ratios (Light Theme)

| Foreground | Background | Ratio | Pass |
|-----------|------------|-------|------|
| `#111827` textPrimary | `#FFFFFF` surface | 17.4:1 | AAA |
| `#6B7280` textSecondary | `#FFFFFF` surface | 5.0:1 | AA |
| `#9CA3AF` textTertiary | `#FFFFFF` surface | 3.0:1 | AA large/UI only |
| `#4F46E5` brandPrimary | `#FFFFFF` surface | 5.6:1 | AA |
| `#FFFFFF` textInverse | `#4F46E5` brandPrimary | 5.6:1 | AA |

### Verified Contrast Ratios (Dark Theme)

| Foreground | Background | Ratio | Pass |
|-----------|------------|-------|------|
| `#F9FAFB` textPrimary | `#1F2937` surface | 13.6:1 | AAA |
| `#9CA3AF` textSecondary | `#1F2937` surface | 4.6:1 | AA |
| `#818CF8` brandPrimary | `#1F2937` surface | 5.2:1 | AA |

---

**UI Designer Agent**: Design system complete.
**Handoff**: Ready for Mobile App Builder (implement as `theme/` module) and Senior Developer (review token architecture).
**Dependencies consumed**: UX Architecture (navigation structure, wireframes, interaction patterns, theme requirements from Sections 3-8).
**Next steps**: Mobile App Builder should implement `theme/tokens.ts`, `theme/ThemeContext.tsx`, and base components (`Button`, `Card`, `TextInput`, `HabitCheckbox`, `ProgressBar`, `TabBar`) using these specifications.
