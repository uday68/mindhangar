# AI Dashboard Quick Start Guide

## For Users

### How to Access AI Features

#### Method 1: Command Palette (Fastest)
1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
2. Type one of:
   - "dashboard" → Opens full AI Dashboard
   - "analytics" → Opens Learning Analytics
   - "progress" → Opens Progress & Gamification
   - "predictions" → Opens Performance Insights
3. Press Enter

#### Method 2: Layout Preset
1. Open Settings panel
2. Go to "Layout" section
3. Select "AI Learning Hub" preset
4. AI Dashboard opens automatically

#### Method 3: Sidebar (Coming Soon)
- Click AI section in sidebar
- Select desired AI panel

### What Each Panel Does

#### 🎯 AI Dashboard
**Best for**: Complete overview of your learning journey

**Features**:
- Progress tracking with badges and streaks
- Performance predictions and alerts
- Personalized content recommendations
- Learning analytics with charts

**When to use**:
- Starting your study session
- Weekly progress review
- Planning your learning path

#### 📊 Learning Analytics
**Best for**: Deep dive into your learning metrics

**Features**:
- Time spent per subject
- Performance trends over time
- Comparative analysis
- Export data functionality

**When to use**:
- Analyzing study patterns
- Identifying weak areas
- Tracking improvement over time

#### 🏆 My Progress
**Best for**: Motivation and achievement tracking

**Features**:
- Badges and achievements
- Study streaks
- Goal tracking
- Milestone celebrations

**When to use**:
- Staying motivated
- Setting new goals
- Celebrating achievements

#### ⚡ Performance Insights
**Best for**: Understanding performance trends

**Features**:
- AI-powered predictions
- Learning gap identification
- Actionable recommendations
- Subject-specific insights

**When to use**:
- Exam preparation
- Identifying areas needing focus
- Getting personalized study tips

## For Developers

### Quick Integration Test

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open the application**:
   - Navigate to `http://localhost:5173`
   - Login with any provider

3. **Test AI Dashboard**:
   - Press `Cmd+K` or `Ctrl+K`
   - Type "dashboard"
   - Press Enter
   - Verify all 4 AI components render

4. **Test Individual Panels**:
   - Open each panel (analytics, progress, predictions)
   - Verify data loads correctly
   - Check loading states
   - Test error handling

### Component Structure

```typescript
// AI Dashboard Panel (Comprehensive View)
<DashboardPanel>
  <ProgressVisualization />      // Gamification
  <PredictionIndicator />        // Performance insights
  <RecommendationWidget />       // Personalized content
  <AnalyticsDashboard />         // Learning analytics
</DashboardPanel>

// Individual Panels
<AnalyticsPanel>
  <AnalyticsDashboard />
</AnalyticsPanel>

<ProgressPanel>
  <ProgressVisualization />
</ProgressPanel>

<PredictionsPanel>
  <PredictionIndicator />
</PredictionsPanel>
```

### Data Flow

```
User Action
  ↓
Panel Component
  ↓
AI Component (RecommendationWidget, etc.)
  ↓
AIServiceFacade
  ↓
Individual Services (RecommendationService, AnalyticsService, etc.)
  ↓
Rule-Based Algorithms (No actual AI model loading)
  ↓
Mock Data / Calculations
  ↓
Component State
  ↓
UI Render
```

### Adding Custom Actions

```typescript
// In DashboardPanel.tsx
const handleRecommendationClick = (recommendation: any) => {
  // Navigate to content
  // Open in new panel
  // Add to planner
  console.log('Opening recommendation:', recommendation);
};

const handleActionClick = (action: string) => {
  // Handle prediction actions
  // Open related content
  // Schedule study session
  console.log('Action clicked:', action);
};
```

### Customizing Layout

Edit `store/useStore.ts` to customize panel positions:

```typescript
'AI Learning': {
  label: 'AI Learning Hub',
  description: 'Your custom description',
  panels: {
    dashboard: { 
      id: 'dashboard', 
      x: 100,        // X position
      y: 50,         // Y position
      width: 1200,   // Width in pixels
      height: 800,   // Height in pixels
      isOpen: true   // Open by default
    },
    // ... other panels
  }
}
```

### Styling

All AI components use Tailwind CSS:

```typescript
// Dark mode support
className="bg-white dark:bg-gray-800"

// Responsive design
className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// Animations (Framer Motion)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Accessibility

All components include:

```typescript
// ARIA labels
<div role="region" aria-label="AI Dashboard">

// Keyboard navigation
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Open recommendation"
>

// Screen reader announcements
announceToScreenReader('Dashboard loaded', 'polite');

// Focus management
<div tabIndex={0} ref={focusRef}>
```

### Error Handling

```typescript
// Loading state
{isLoading && <SkeletonLoader variant="card" />}

// Error state
{error && (
  <ErrorState
    title="Failed to load data"
    message={error.message}
    onRetry={fetchData}
  />
)}

// Empty state
{data.length === 0 && (
  <EmptyState
    title="No data yet"
    message="Start learning to see insights"
  />
)}
```

### Testing

```bash
# Run tests
npm run test

# Run specific test
npm run test -- DashboardPanel

# Check coverage
npm run test:coverage

# Type check
npm run type-check

# Lint
npm run lint
```

### Debugging

```typescript
// Enable debug mode
localStorage.setItem('DEBUG_AI', 'true');

// Check AI service status
console.log(aiServiceFacade.getStatus());

// Inspect component state
// Use React DevTools

// Check network requests
// Use Browser DevTools → Network tab
```

### Performance Optimization

```typescript
// Memoize expensive calculations
const memoizedData = useMemo(() => {
  return processData(rawData);
}, [rawData]);

// Debounce user input
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Common Issues

#### Panel not opening
- Check if panel type exists in `types.ts`
- Verify panel is in layout preset
- Check browser console for errors

#### Data not loading
- Check AIServiceFacade initialization
- Verify service methods return data
- Check network tab for failed requests

#### Styling issues
- Verify Tailwind classes are correct
- Check dark mode variants
- Test responsive breakpoints

#### Performance issues
- Check for unnecessary re-renders
- Use React DevTools Profiler
- Optimize heavy calculations

## API Reference

### AIServiceFacade

```typescript
// Get recommendations
const recommendations = await aiServiceFacade.getRecommendations(userId, options);

// Get analytics
const analytics = await aiServiceFacade.getAnalytics(userId, timeRange);

// Get progress
const progress = await aiServiceFacade.getProgress(userId);

// Get predictions
const predictions = await aiServiceFacade.getPredictions(userId, subject);
```

### Panel Props

```typescript
// DashboardPanel
interface DashboardPanelProps {
  // No props - self-contained
}

// AnalyticsPanel
interface AnalyticsPanelProps {
  className?: string;
}

// ProgressPanel
interface ProgressPanelProps {
  className?: string;
}

// PredictionsPanel
interface PredictionsPanelProps {
  subject?: string;
  className?: string;
  onActionClick?: (action: string) => void;
}
```

## Resources

- [AI Components Integration Guide](./AI_COMPONENTS_INTEGRATION_GUIDE.md)
- [Phase 3 Progress](./PHASE_3_AI_INTEGRATION_PROGRESS.md)
- [Frontend Modernization Spec](./.kiro/specs/frontend-modernization/design.md)
- [AI Service Documentation](./docs/AI_INTEGRATION_GUIDE.md)

## Support

For issues or questions:
1. Check the documentation above
2. Review the integration guide
3. Check browser console for errors
4. Open an issue on GitHub

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
**Status**: Production Ready ✅
