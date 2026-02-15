# Frontend Modernization - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install framer-motion recharts
```

### Step 2: Verify Installation
The providers are already integrated in `App.tsx`. Just start your dev server:
```bash
npm run dev
```

### Step 3: Test Accessibility
1. Press `Tab` key to navigate
2. You should see focus indicators (teal outline)
3. Press `Tab` from the top to see skip links
4. Click "Skip to main content"

### Step 4: Use the Components

#### Loading States
```tsx
import { SkeletonLoader, LoadingSpinner } from './src/components/Loading/SkeletonLoader';

// Skeleton for initial load
{loading && <SkeletonLoader variant="card" count={3} />}

// Spinner for operations
{loading && <LoadingSpinner size="md" />}
```

#### Error States
```tsx
import { ErrorState } from './src/components/Error/ErrorState';

{error && (
  <ErrorState
    error={error}
    onRetry={handleRetry}
    variant="inline"
    severity="error"
  />
)}
```

#### AI Recommendations
```tsx
import { RecommendationWidget } from './src/components/AI/RecommendationWidget';

<RecommendationWidget
  maxItems={5}
  onRecommendationClick={(rec) => console.log(rec)}
/>
```

#### Accessibility Context
```tsx
import { useAccessibility } from './src/contexts/AccessibilityContext';

const { announceToScreenReader, setFocusTarget } = useAccessibility();

// Announce to screen reader
announceToScreenReader('Action completed', 'polite');

// Set focus
setFocusTarget('element-id');
```

#### Animation Context
```tsx
import { useAnimation } from './src/contexts/AnimationContext';

const { shouldAnimate, config } = useAnimation();

// Use in styles
<div style={{
  transition: shouldAnimate ? `all ${config.duration.normal}ms` : 'none'
}}>
  Content
</div>
```

## 📋 What's Implemented

✅ Accessibility infrastructure (WCAG 2.1 AA)  
✅ Animation system (Framer Motion ready)  
✅ Loading components (Skeleton, Spinner)  
✅ Error components (Error, Empty, Offline states)  
✅ State management (Zustand extension)  
✅ AI Recommendation widget  
✅ Skip links and semantic HTML  
✅ Keyboard navigation  
✅ Screen reader support  

## 📁 Key Files

- `src/contexts/AccessibilityContext.tsx` - Accessibility utilities
- `src/contexts/AnimationContext.tsx` - Animation configuration
- `src/components/Loading/` - Loading components
- `src/components/Error/` - Error components
- `src/components/AI/` - AI components
- `src/styles/accessibility.css` - Accessibility styles
- `store/useStore.modernization.ts` - State management
- `App.tsx` - Integrated providers

## 🧪 Quick Tests

### Test Keyboard Navigation
1. Press `Tab` repeatedly
2. Focus indicators should be visible (teal outline)
3. All interactive elements should be reachable

### Test Skip Links
1. Refresh page
2. Press `Tab` once
3. "Skip to main content" link should appear
4. Press `Enter` to skip

### Test Screen Reader
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through the app
3. All content should be announced

### Test Animations
1. Open browser DevTools
2. Toggle "Prefers reduced motion" in rendering settings
3. Animations should disable

## 📖 Full Documentation

- **Spec**: `.kiro/specs/frontend-modernization/`
- **Progress**: `docs/FRONTEND_MODERNIZATION_IMPLEMENTATION_PROGRESS.md`
- **Summary**: `docs/FRONTEND_MODERNIZATION_SESSION_SUMMARY.md`
- **Complete Guide**: `docs/FRONTEND_MODERNIZATION_SPEC_COMPLETE.md`

## 🐛 Troubleshooting

### Dependencies not installing?
```bash
npm cache clean --force
npm install
```

### TypeScript errors?
```bash
npm run build
```

### Providers not working?
Check that `App.tsx` has:
```tsx
<AccessibilityProvider>
  <AnimationProvider>
    {/* Your app */}
  </AnimationProvider>
</AccessibilityProvider>
```

### Focus indicators not showing?
Add to your CSS:
```css
@import './src/styles/accessibility.css';
```

## 🎯 Next Steps

1. ✅ Install dependencies
2. Test accessibility features
3. Test animations
4. Continue with Phase 2 (Component Modernization)
5. Continue with Phase 3 (AI Service Integration)

## 💡 Tips

- Use `Tab` key to test keyboard navigation
- Use browser DevTools to test reduced motion
- Use screen reader to test accessibility
- Check console for any errors
- Read the full documentation for details

## 🤝 Need Help?

1. Check the documentation files
2. Review the implementation progress
3. Look at the usage examples
4. Test the demo components

---

**Ready to go!** Start with `npm install framer-motion recharts` and then `npm run dev`.
