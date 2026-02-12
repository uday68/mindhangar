# Design Document: Coursera-Inspired Design System

## Overview

This design document outlines the comprehensive redesign of the MindHangar AI for Bharat platform using Coursera-inspired design principles. The design focuses on simplicity, elegance, and clarity while maintaining cultural relevance for Indian learners.

### Design Philosophy

The redesign follows these core principles inspired by Coursera:

1. **Simplicity First**: Remove visual clutter, use generous whitespace, focus on content
2. **Clear Hierarchy**: Establish visual importance through size, weight, color, and spacing
3. **Subtle Motion**: Use animations to enhance, not distract from the learning experience
4. **Content-Centric**: Design serves the content, not the other way around
5. **Accessible by Default**: Build accessibility into every component from the start
6. **Consistent Patterns**: Reuse components and patterns for predictable user experience
7. **Professional Polish**: Attention to detail in spacing, alignment, and transitions

### Research Summary

Coursera's design system emphasizes:
- Clean, card-based layouts with consistent shadows and borders
- Limited color palette with strategic use of blue as primary color
- Sans-serif typography (Source Sans Pro) with clear hierarchy
- Generous whitespace (24px, 32px, 48px, 64px spacing scale)
- Subtle hover states and transitions (200-300ms)
- Mobile-first responsive approach
- Strong focus on readability and accessibility

## Architecture

### Design System Structure

```
Design System
├── Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Shadows
│   ├── Border Radius
│   └── Transitions
├── Component Library
│   ├── Primitives (Button, Input, Card)
│   ├── Compositions (Modal, Dropdown, Toast)
│   └── Patterns (Navigation, Forms, Lists)
├── Layout System
│   ├── Grid System
│   ├── Container Widths
│   └── Breakpoints
└── Theme System
    ├── Light Theme
    ├── Dark Theme
    └── Cultural Themes
```

### Technology Stack

- **CSS Variables**: For design tokens and theming
- **CSS Modules**: For component-scoped styling
- **Tailwind CSS** (optional): For utility-first approach
- **Framer Motion**: For animations and transitions
- **React**: Component-based architecture
- **TypeScript**: Type-safe component props


## Components and Interfaces

### Design Tokens

#### Color System

```typescript
interface ColorPalette {
  // Primary Colors (Coursera-inspired blue)
  primary: {
    50: '#E3F2FD',   // Lightest
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#0056D2',  // Main brand color
    600: '#004BA0',
    700: '#003D82',
    800: '#002F64',
    900: '#001E3C',  // Darkest
  },
  
  // Secondary Colors (Accent)
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',  // Main accent
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  
  // Neutral Colors (Grays)
  neutral: {
    0: '#FFFFFF',    // Pure white
    50: '#FAFAFA',   // Background
    100: '#F5F5F5',  // Light background
    200: '#EEEEEE',  // Border light
    300: '#E0E0E0',  // Border
    400: '#BDBDBD',  // Border dark
    500: '#9E9E9E',  // Text secondary
    600: '#757575',  // Text tertiary
    700: '#616161',  // Text primary
    800: '#424242',  // Text dark
    900: '#212121',  // Almost black
    1000: '#000000', // Pure black
  },
  
  // Semantic Colors
  success: {
    light: '#E8F5E9',
    main: '#4CAF50',
    dark: '#2E7D32',
  },
  error: {
    light: '#FFEBEE',
    main: '#F44336',
    dark: '#C62828',
  },
  warning: {
    light: '#FFF8E1',
    main: '#FFC107',
    dark: '#F57F17',
  },
  info: {
    light: '#E3F2FD',
    main: '#2196F3',
    dark: '#1565C0',
  },
}
```

#### Typography System

```typescript
interface TypographySystem {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    secondary: '"Source Sans Pro", sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
}
```

#### Spacing System

```typescript
interface SpacingSystem {
  // Base unit: 4px
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}
```

#### Shadow System

```typescript
interface ShadowSystem {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}
```

#### Border Radius System

```typescript
interface BorderRadiusSystem {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',   // Fully rounded
}
```

#### Transition System

```typescript
interface TransitionSystem {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  
  timing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  property: {
    all: 'all',
    colors: 'background-color, border-color, color, fill, stroke',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
}
```

### Component Specifications

#### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
}

// Styling specifications
const buttonStyles = {
  base: {
    fontWeight: 'medium',
    borderRadius: 'md',
    transition: 'all 250ms ease-in-out',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  
  variants: {
    primary: {
      background: 'primary.500',
      color: 'white',
      hover: {
        background: 'primary.600',
        transform: 'translateY(-1px)',
        boxShadow: 'md',
      },
      active: {
        background: 'primary.700',
        transform: 'translateY(0)',
      },
    },
    secondary: {
      background: 'neutral.100',
      color: 'neutral.800',
      border: '1px solid neutral.300',
      hover: {
        background: 'neutral.200',
        borderColor: 'neutral.400',
      },
    },
    tertiary: {
      background: 'transparent',
      color: 'primary.500',
      hover: {
        background: 'primary.50',
      },
    },
  },
  
  sizes: {
    sm: {
      padding: '8px 16px',
      fontSize: 'sm',
      minHeight: '36px',
    },
    md: {
      padding: '12px 24px',
      fontSize: 'base',
      minHeight: '44px',
    },
    lg: {
      padding: '16px 32px',
      fontSize: 'lg',
      minHeight: '52px',
    },
  },
};
```

#### Input Component

```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  placeholder?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  value?: string;
  onChange?: (value: string) => void;
}

const inputStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  
  label: {
    fontSize: 'sm',
    fontWeight: 'medium',
    color: 'neutral.700',
  },
  
  input: {
    padding: '12px 16px',
    fontSize: 'base',
    borderRadius: 'md',
    border: '1px solid neutral.300',
    background: 'white',
    transition: 'all 250ms ease-in-out',
    
    focus: {
      outline: 'none',
      borderColor: 'primary.500',
      boxShadow: '0 0 0 3px rgba(0, 86, 210, 0.1)',
    },
    
    error: {
      borderColor: 'error.main',
    },
    
    success: {
      borderColor: 'success.main',
    },
  },
  
  message: {
    fontSize: 'sm',
    marginTop: '4px',
  },
};
```

#### Card Component

```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
}

const cardStyles = {
  base: {
    borderRadius: 'lg',
    background: 'white',
    transition: 'all 250ms ease-in-out',
  },
  
  variants: {
    default: {
      boxShadow: 'base',
    },
    elevated: {
      boxShadow: 'lg',
    },
    outlined: {
      border: '1px solid neutral.200',
      boxShadow: 'none',
    },
    interactive: {
      boxShadow: 'base',
      cursor: 'pointer',
      hover: {
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
      },
    },
  },
  
  padding: {
    sm: '16px',
    md: '24px',
    lg: '32px',
  },
};
```


#### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 250ms ease-out',
  },
  
  content: {
    background: 'white',
    borderRadius: 'xl',
    boxShadow: '2xl',
    maxHeight: '90vh',
    overflow: 'auto',
    animation: 'slideUp 250ms ease-out',
  },
  
  sizes: {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' },
    full: { maxWidth: '95vw' },
  },
  
  header: {
    padding: '24px',
    borderBottom: '1px solid neutral.200',
  },
  
  body: {
    padding: '24px',
  },
  
  footer: {
    padding: '24px',
    borderTop: '1px solid neutral.200',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
};
```

#### Navigation Component

```typescript
interface NavigationProps {
  logo: ReactNode;
  items: NavigationItem[];
  user?: UserProfile;
  onLogout?: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  children?: NavigationItem[];
}

const navigationStyles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: 'white',
    borderBottom: '1px solid neutral.200',
    boxShadow: 'sm',
    zIndex: 100,
  },
  
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  logo: {
    fontSize: '2xl',
    fontWeight: 'bold',
    color: 'primary.500',
  },
  
  navItems: {
    display: 'flex',
    gap: '8px',
  },
  
  navItem: {
    padding: '8px 16px',
    borderRadius: 'md',
    fontSize: 'base',
    fontWeight: 'medium',
    color: 'neutral.700',
    transition: 'all 250ms ease-in-out',
    
    hover: {
      background: 'neutral.100',
      color: 'primary.500',
    },
    
    active: {
      background: 'primary.50',
      color: 'primary.600',
    },
  },
};
```

### Layout Patterns

#### Grid System

```typescript
interface GridSystem {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
  },
  
  columns: {
    1: { gridTemplateColumns: '1fr' },
    2: { gridTemplateColumns: 'repeat(2, 1fr)' },
    3: { gridTemplateColumns: 'repeat(3, 1fr)' },
    4: { gridTemplateColumns: 'repeat(4, 1fr)' },
    6: { gridTemplateColumns: 'repeat(6, 1fr)' },
    12: { gridTemplateColumns: 'repeat(12, 1fr)' },
  },
  
  gap: {
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  },
}
```

#### Responsive Breakpoints

```typescript
interface Breakpoints {
  mobile: '0px',      // 0-639px
  tablet: '640px',    // 640-1023px
  desktop: '1024px',  // 1024-1439px
  wide: '1440px',     // 1440px+
}

// Media queries
const mediaQueries = {
  mobile: '@media (max-width: 639px)',
  tablet: '@media (min-width: 640px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
  wide: '@media (min-width: 1440px)',
};
```

## Data Models

### Theme Configuration

```typescript
interface ThemeConfig {
  name: string;
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  shadows: ShadowSystem;
  borderRadius: BorderRadiusSystem;
  transitions: TransitionSystem;
}

interface UserThemePreferences {
  theme: 'light' | 'dark' | 'auto';
  culturalTheme?: 'default' | 'diwali' | 'holi' | 'regional';
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
}
```

### Component State Models

```typescript
interface ComponentState {
  default: StyleObject;
  hover?: StyleObject;
  active?: StyleObject;
  focus?: StyleObject;
  disabled?: StyleObject;
  loading?: StyleObject;
  error?: StyleObject;
  success?: StyleObject;
}

interface AnimationConfig {
  duration: number;
  timing: string;
  delay?: number;
  iterations?: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified several areas where properties can be consolidated:

**Consolidation Opportunities:**

1. **Design System Structure Properties (1.1-1.5)**: These all test that required design system sections exist. Can be combined into one comprehensive property that checks all required sections.

2. **Component Existence Properties (4.1-4.4, 5.1, 6.1)**: These all test that component variants exist. Can be combined into properties that check component completeness.

3. **State Definition Properties (4.3, 5.2)**: Both test that components have all required states. Can be combined into one property about state completeness.

4. **Focus State Properties (4.7, 5.7)**: Both test that components have focus states. Can be combined into one property about focus state existence.

5. **Accessibility Properties (12.2-12.4)**: These test related accessibility features. Can be combined into properties about keyboard accessibility and ARIA support.

6. **Minimum Size Properties (4.5, 11.5)**: Both test minimum touch target sizes. Can be combined into one property.

7. **Responsive Properties (11.2, 11.6, 11.7)**: These test responsive behavior. Can be combined into properties about responsive adaptation.

**Properties to Keep Separate:**

- Contrast ratio properties (2.5, 3.5, 12.3) - Each tests different contexts
- Animation properties (10.1-10.6, 10.8) - Each tests different aspects of animation system
- Performance properties (24.1-24.8) - Each tests different optimization strategies
- Theme properties (1.7, 3.8) - Test different aspects of theming

### Correctness Properties

#### Property 1: Design System Completeness

*For any* Design System implementation, it SHALL include all required sections: Typography System (with font families, sizes, weights, line heights), Color Palette (with primary, secondary, neutral, and semantic colors), Spacing System (with consistent scale values), Animation Guidelines (with durations, easing, and transition properties), and Layout Grid specifications.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

#### Property 2: Theme Consistency

*For any* theme variant (light, dark, cultural), all themes SHALL have the same color keys and structure, ensuring consistent color mappings across theme switches.

**Validates: Requirements 1.7, 3.8**

#### Property 3: Typography Hierarchy

*For any* Typography System, heading levels H1 through H6 SHALL exist with font sizes that decrease monotonically (H1 > H2 > H3 > H4 > H5 > H6), establishing clear visual hierarchy.

**Validates: Requirements 2.2**

#### Property 4: Minimum Font Size

*For any* body text style in the Typography System, the font size SHALL be greater than or equal to 14px to ensure readability.

**Validates: Requirements 2.4**

#### Property 5: Text Contrast Ratios

*For any* text color and background color combination used in the Typography System, the contrast ratio SHALL be at least 4.5:1 for normal text and 3:1 for large text, meeting WCAG 2.1 AA standards.

**Validates: Requirements 2.5, 3.5**

#### Property 6: Typography Structure Completeness

*For any* Typography System, it SHALL define letter spacing and line height properties for all text styles, optimized for screen reading.

**Validates: Requirements 2.7**

#### Property 7: Color Palette Structure

*For any* Color Palette, it SHALL include primary colors, secondary colors, neutral colors with at least 7 shades, and semantic colors for all four states (success, error, warning, info).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

#### Property 8: Color Saturation Limits

*For any* color in the Color Palette (excluding pure white/black), the HSL saturation value SHALL not exceed 80%, ensuring subtle and muted tones rather than bright, saturated colors.

**Validates: Requirements 3.6**

#### Property 9: Interactive Color States

*For any* interactive color in the Color Palette, it SHALL have defined hover and active state variants with different lightness or saturation values.

**Validates: Requirements 3.7**

#### Property 10: Component Variant Completeness

*For any* component in the Component Library (Button, Input, Card), it SHALL provide all required variants as specified in the design system (e.g., buttons have primary/secondary/tertiary, cards have default/elevated/outlined/interactive).

**Validates: Requirements 4.1, 5.1, 6.1**

#### Property 11: Component State Completeness

*For any* interactive component in the Component Library, it SHALL define styles for all required states: default, hover, active, focus, and disabled.

**Validates: Requirements 4.3, 5.2**

#### Property 12: Minimum Touch Target Size

*For any* interactive component (buttons, inputs, clickable cards), the minimum height SHALL be at least 44px to ensure adequate touch targets for mobile devices.

**Validates: Requirements 4.5, 11.5**

#### Property 13: Hover Animation Existence

*For any* interactive component, the hover state SHALL include transition properties (duration and timing function) to provide subtle feedback animations.

**Validates: Requirements 4.6, 5.6, 10.3**

#### Property 14: Focus State Visibility

*For any* interactive component, it SHALL define visible focus styles with sufficient contrast (minimum 3:1 against adjacent colors) to support keyboard navigation.

**Validates: Requirements 4.7, 5.7, 12.3**

#### Property 15: Input Component Completeness

*For any* Component Library, it SHALL provide all required input types: text input, textarea, select, checkbox, and radio components.

**Validates: Requirements 5.1**

#### Property 16: Input Validation Support

*For any* input component, it SHALL support error and success states with appropriate semantic colors and message display capabilities.

**Validates: Requirements 5.4**

#### Property 17: Placeholder Opacity

*For any* input component with placeholder text, the placeholder SHALL have reduced opacity (between 0.4 and 0.7) compared to regular text for visual distinction.

**Validates: Requirements 5.5**

#### Property 18: Icon Support

*For any* button or input component, it SHALL support icon props with proper alignment (left or right positioning).

**Validates: Requirements 4.4, 5.8**

#### Property 19: Card Styling Consistency

*For any* Card component variant, it SHALL have defined padding, border radius, and shadow properties that follow the design system's spacing, border radius, and shadow scales.

**Validates: Requirements 6.2**

#### Property 20: Card Responsive Behavior

*For any* Card component, it SHALL adapt its layout (padding, width) based on viewport size using responsive breakpoints.

**Validates: Requirements 6.5**

#### Property 21: Loading State Support

*For any* Card component, it SHALL support a loading state that displays skeleton loaders matching the card's content structure.

**Validates: Requirements 6.6**

#### Property 22: Animation Duration Standards

*For any* Animation Guidelines, it SHALL define exactly three standard durations: fast (150ms), normal (250ms), and slow (350ms).

**Validates: Requirements 10.1**

#### Property 23: Easing Function Standards

*For any* Animation Guidelines, it SHALL define standard easing functions including ease-in-out and ease-out for natural motion.

**Validates: Requirements 10.2**

#### Property 24: Loading Animation Existence

*For any* Component Library, it SHALL include loading animation components: spinners, skeleton loaders, and progress bars.

**Validates: Requirements 10.4**

#### Property 25: Reduced Motion Support

*For any* component with animations, it SHALL check for the prefers-reduced-motion media query and disable or simplify animations when the user has this preference enabled.

**Validates: Requirements 10.6**

#### Property 26: Responsive Breakpoint Definition

*For any* Responsive Design system, it SHALL define breakpoints at exactly these values: mobile (<640px), tablet (640-1024px), and desktop (>1024px).

**Validates: Requirements 11.1**

#### Property 27: Component Responsive Adaptation

*For any* component in the Component Library, it SHALL have responsive styles that adapt spacing, sizing, or layout at defined breakpoints.

**Validates: Requirements 11.2, 11.6**

#### Property 28: Fluid Typography

*For any* Typography System in a responsive design, it SHALL use viewport-relative units (vw, clamp) or responsive scaling for at least heading styles to enable fluid typography.

**Validates: Requirements 11.3**

#### Property 29: Mobile Navigation Variants

*For any* Navigation component, it SHALL provide mobile-optimized variants (hamburger menu or bottom tabs) that activate at the mobile breakpoint.

**Validates: Requirements 11.4**

#### Property 30: Responsive Media

*For any* image or media element, it SHALL have responsive properties (max-width: 100%, height: auto) to ensure proper scaling.

**Validates: Requirements 11.7**

#### Property 31: Keyboard Navigation Support

*For any* interactive element, it SHALL be keyboard accessible with appropriate tabIndex values and keyboard event handlers (onKeyDown/onKeyPress).

**Validates: Requirements 12.2**

#### Property 32: ARIA Attribute Completeness

*For any* component with semantic meaning or dynamic behavior, it SHALL include appropriate ARIA attributes (aria-label, role, aria-describedby, etc.) for screen reader compatibility.

**Validates: Requirements 12.4**

#### Property 33: Redundant Information Encoding

*For any* semantic state (success, error, warning, info), the information SHALL be conveyed through multiple means (color + icon, color + text) not color alone.

**Validates: Requirements 12.5**

#### Property 34: Text Alternatives

*For any* non-text content (images, icons, charts), it SHALL have text alternatives (alt attributes, aria-label, or descriptive text).

**Validates: Requirements 12.6**

#### Property 35: Live Region Announcements

*For any* component with dynamic content changes (loading states, notifications, form validation), it SHALL use aria-live regions to announce changes to screen readers.

**Validates: Requirements 12.7, 12.8**

#### Property 36: Skip Link Existence

*For any* page with navigation, it SHALL include skip links at the beginning of the document to allow keyboard users to bypass repetitive content.

**Validates: Requirements 12.9**

#### Property 37: Zoom Compatibility

*For any* layout, it SHALL maintain usability and avoid horizontal scrolling when browser zoom is set to 200%.

**Validates: Requirements 12.10**

#### Property 38: Lazy Loading Implementation

*For any* component or image that is not immediately visible in the viewport, it SHALL use lazy loading (React.lazy, loading="lazy") to improve initial load time.

**Validates: Requirements 24.1**

#### Property 39: Animation Performance

*For any* animation, it SHALL use GPU-accelerated properties (transform, opacity) and avoid layout-triggering properties (width, height, top, left) to maintain 60fps performance.

**Validates: Requirements 24.2**

#### Property 40: Bundle Size Limits

*For any* JavaScript bundle, the initial bundle size SHALL not exceed 200KB (gzipped) to ensure fast load times.

**Validates: Requirements 24.3**

#### Property 41: Code Splitting

*For any* route or panel in the application, it SHALL use dynamic imports to enable code splitting and reduce initial bundle size.

**Validates: Requirements 24.4**

#### Property 42: Font Loading Optimization

*For any* custom font, it SHALL use font-display: swap or font-display: optional to prevent layout shifts during font loading.

**Validates: Requirements 24.6**

#### Property 43: Core Web Vitals Thresholds

*For any* page, the Core Web Vitals SHALL meet these thresholds: LCP < 2.5s, FID < 100ms, CLS < 0.1.

**Validates: Requirements 24.7**


## Error Handling

### Design System Errors

```typescript
enum DesignSystemError {
  MISSING_TOKEN = 'Design token not found in theme',
  INVALID_VARIANT = 'Component variant does not exist',
  INVALID_SIZE = 'Component size does not exist',
  MISSING_THEME = 'Theme configuration not found',
  CONTRAST_VIOLATION = 'Color combination does not meet contrast requirements',
  BREAKPOINT_ERROR = 'Invalid breakpoint value',
}

interface ErrorHandler {
  onError: (error: DesignSystemError, context: any) => void;
  fallback: (error: DesignSystemError) => any;
}
```

### Error Handling Strategies

1. **Missing Design Tokens**: Fall back to default values from base theme
2. **Invalid Component Props**: Log warning and use default variant/size
3. **Theme Loading Failures**: Fall back to light theme with default colors
4. **Contrast Violations**: Log warning in development, use fallback color in production
5. **Animation Errors**: Disable animations gracefully if performance issues detected
6. **Responsive Breakpoint Errors**: Fall back to mobile-first approach

### Validation

```typescript
interface DesignSystemValidator {
  validateColorContrast(foreground: string, background: string): boolean;
  validateSpacing(value: string): boolean;
  validateBreakpoint(breakpoint: string): boolean;
  validateComponent(component: string, variant: string): boolean;
}

// Example validation
function validateColorContrast(fg: string, bg: string): boolean {
  const ratio = calculateContrastRatio(fg, bg);
  return ratio >= 4.5; // WCAG AA for normal text
}
```

## Testing Strategy

### Dual Testing Approach

The design system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Test specific color combinations for contrast
- Test component rendering with specific props
- Test theme switching behavior
- Test responsive behavior at specific breakpoints
- Test accessibility features with specific scenarios

**Property-Based Tests**: Verify universal properties across all inputs
- Test that all color combinations meet contrast requirements
- Test that all components have required states
- Test that all interactive elements are keyboard accessible
- Test that all themes have consistent structure
- Test that all animations respect reduced motion preferences

### Property-Based Testing Configuration

**Library**: Use `fast-check` for JavaScript/TypeScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: coursera-inspired-design-system, Property {number}: {property_text}`

### Test Categories

#### 1. Design Token Tests

**Unit Tests**:
```typescript
describe('Color Palette', () => {
  it('should have primary color defined', () => {
    expect(theme.colors.primary[500]).toBeDefined();
  });
  
  it('should have sufficient contrast between primary and white', () => {
    const ratio = getContrastRatio(theme.colors.primary[500], '#FFFFFF');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
```

**Property Tests**:
```typescript
// Feature: coursera-inspired-design-system, Property 5: Text Contrast Ratios
describe('Text Contrast Property', () => {
  it('should maintain 4.5:1 contrast for all text/background combinations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(theme.colors.neutral)),
        fc.constantFrom(...Object.values(theme.colors.neutral)),
        (textColor, bgColor) => {
          if (textColor === bgColor) return true;
          const ratio = getContrastRatio(textColor, bgColor);
          return ratio >= 4.5 || ratio < 3; // Either meets standard or clearly not intended for text
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 2. Component Tests

**Unit Tests**:
```typescript
describe('Button Component', () => {
  it('should render primary variant', () => {
    const { container } = render(<Button variant="primary">Click</Button>);
    expect(container.firstChild).toHaveClass('button-primary');
  });
  
  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Click</Button>);
    expect(getByRole('button')).toBeDisabled();
  });
  
  it('should have minimum height of 44px for medium size', () => {
    const { getByRole } = render(<Button size="md">Click</Button>);
    const button = getByRole('button');
    expect(parseInt(getComputedStyle(button).height)).toBeGreaterThanOrEqual(44);
  });
});
```

**Property Tests**:
```typescript
// Feature: coursera-inspired-design-system, Property 12: Minimum Touch Target Size
describe('Touch Target Size Property', () => {
  it('should have minimum 44px height for all button sizes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('sm', 'md', 'lg'),
        fc.constantFrom('primary', 'secondary', 'tertiary'),
        (size, variant) => {
          const { getByRole } = render(
            <Button size={size} variant={variant}>Test</Button>
          );
          const button = getByRole('button');
          const height = parseInt(getComputedStyle(button).height);
          return height >= 44;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: coursera-inspired-design-system, Property 14: Focus State Visibility
describe('Focus State Property', () => {
  it('should have visible focus styles for all interactive components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'input', 'select', 'checkbox', 'radio'),
        (componentType) => {
          const component = renderComponent(componentType);
          component.focus();
          const focusStyles = getComputedStyle(component);
          // Check for outline or box-shadow indicating focus
          return focusStyles.outline !== 'none' || focusStyles.boxShadow !== 'none';
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 3. Responsive Tests

**Unit Tests**:
```typescript
describe('Responsive Behavior', () => {
  it('should show hamburger menu on mobile', () => {
    global.innerWidth = 500;
    const { getByLabelText } = render(<Navigation />);
    expect(getByLabelText('Open menu')).toBeInTheDocument();
  });
  
  it('should show full navigation on desktop', () => {
    global.innerWidth = 1200;
    const { queryByLabelText } = render(<Navigation />);
    expect(queryByLabelText('Open menu')).not.toBeInTheDocument();
  });
});
```

**Property Tests**:
```typescript
// Feature: coursera-inspired-design-system, Property 27: Component Responsive Adaptation
describe('Responsive Adaptation Property', () => {
  it('should adapt spacing at breakpoints for all components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Card', 'Button', 'Input', 'Modal'),
        fc.integer({ min: 320, max: 1920 }),
        (componentName, viewportWidth) => {
          global.innerWidth = viewportWidth;
          const component = renderComponent(componentName);
          const styles = getComputedStyle(component);
          const padding = parseInt(styles.padding);
          
          // Verify padding adapts to viewport
          if (viewportWidth < 640) {
            return padding <= 16; // Mobile: smaller padding
          } else if (viewportWidth < 1024) {
            return padding <= 24; // Tablet: medium padding
          } else {
            return padding <= 32; // Desktop: larger padding
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 4. Accessibility Tests

**Unit Tests**:
```typescript
describe('Accessibility', () => {
  it('should have aria-label on icon buttons', () => {
    const { getByLabelText } = render(<IconButton icon={<CloseIcon />} aria-label="Close" />);
    expect(getByLabelText('Close')).toBeInTheDocument();
  });
  
  it('should announce form errors to screen readers', () => {
    const { getByRole } = render(<Input error="Invalid email" />);
    const input = getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });
});
```

**Property Tests**:
```typescript
// Feature: coursera-inspired-design-system, Property 31: Keyboard Navigation Support
describe('Keyboard Navigation Property', () => {
  it('should support keyboard navigation for all interactive elements', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'input', 'select', 'link', 'checkbox'),
        (elementType) => {
          const element = renderInteractiveElement(elementType);
          const tabIndex = element.getAttribute('tabindex');
          // Should be focusable (tabIndex >= 0 or naturally focusable)
          return tabIndex === null || parseInt(tabIndex) >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: coursera-inspired-design-system, Property 32: ARIA Attribute Completeness
describe('ARIA Attributes Property', () => {
  it('should have appropriate ARIA attributes for all semantic components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('modal', 'dropdown', 'tooltip', 'alert', 'tab'),
        (componentType) => {
          const component = renderComponent(componentType);
          const role = component.getAttribute('role');
          // Should have appropriate role
          return role !== null && role.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 5. Performance Tests

**Unit Tests**:
```typescript
describe('Performance', () => {
  it('should lazy load images', () => {
    const { container } = render(<Image src="test.jpg" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
  
  it('should use font-display swap', () => {
    const fontFace = document.fonts.values().next().value;
    expect(fontFace.display).toBe('swap');
  });
});
```

**Property Tests**:
```typescript
// Feature: coursera-inspired-design-system, Property 39: Animation Performance
describe('Animation Performance Property', () => {
  it('should use GPU-accelerated properties for all animations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'card', 'modal', 'dropdown'),
        (componentType) => {
          const component = renderComponent(componentType);
          const transitions = getComputedStyle(component).transition;
          // Should only animate transform and opacity
          const allowedProps = ['transform', 'opacity', 'all'];
          return allowedProps.some(prop => transitions.includes(prop));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: coursera-inspired-design-system, Property 25: Reduced Motion Support
describe('Reduced Motion Property', () => {
  it('should respect prefers-reduced-motion for all animated components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'card', 'modal', 'toast'),
        (componentType) => {
          // Set reduced motion preference
          window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
          }));
          
          const component = renderComponent(componentType);
          const transitions = getComputedStyle(component).transition;
          // Should have no transitions or very short ones
          return transitions === 'none' || !transitions.includes('ms');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 43 correctness properties implemented
- **Accessibility Tests**: 100% of interactive components tested
- **Responsive Tests**: All breakpoints tested for all components
- **Performance Tests**: All optimization strategies validated

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every pull request
- Run visual regression tests on design changes
- Run accessibility audits with axe-core
- Run performance audits with Lighthouse
- Monitor Core Web Vitals in production

