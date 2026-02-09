# AI Components Integration Guide

## Overview

This guide explains how to integrate the newly created AI components into your MindHangar application.

## Created Components

All components are located in `src/components/AI/`:

1. **RecommendationWidget** - Personalized content recommendations
2. **AnalyticsDashboard** - Learning analytics with charts
3. **ProgressVisualization** - Gamification (badges, streaks, goals)
4. **PredictionIndicator** - Performance predictions

## Integration Options

### Option 1: Add to Dashboard/Home Page

Create a new dashboard page that displays all AI components:

```tsx
// Example: components/Pages/Dashboard.tsx
import React from 'react';
import { RecommendationWidget } from '../AI/RecommendationWidget';
import { AnalyticsDashboard } from '../AI/AnalyticsDashboard';
import { ProgressVisualization } from '../AI/ProgressVisualization';
import { PredictionIndicator } from '../AI/PredictionIndicator';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container p-6 space-y-6">
      {/* Hero Section with Progress */}
      <section>
        <h1 className="text-3xl font-bold mb-6">My Learning Dashboard</h1>
        <ProgressVisualization />
      </section>

      {/* Predictions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Performance Insights</h2>
        <PredictionIndicator />
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
          <RecommendationWidget 
            maxItems={5}
            onRecommendationClick={(rec) => console.log('Clicked:', rec)}
          />
        </section>

        {/* Analytics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Learning Analytics</h2>
          <AnalyticsDashboard />
        </section>
      </div>
    </div>
  );
};
```

### Option 2: Add to Existing Panels

Integrate components into your existing GlassPanel system:

```tsx
// Example: Add to your Workspace component
import { RecommendationWidget } from './components/AI/RecommendationWidget';
import { AnalyticsDashboard } from './components/AI/AnalyticsDashboard';

// In your panel rendering logic:
{activePanel === 'recommendations' && (
  <GlassPanel title="Recommendations">
    <RecommendationWidget />
  </GlassPanel>
)}

{activePanel === 'analytics' && (
  <GlassPanel title="Analytics">
    <AnalyticsDashboard />
  </GlassPanel>
)}
```

### Option 3: Add to Settings/Profile Page

Show progress and analytics in user profile:

```tsx
// Example: components/Pages/Profile.tsx
import { ProgressVisualization } from '../AI/ProgressVisualization';
import { AnalyticsDashboard } from '../AI/AnalyticsDashboard';

export const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      {/* User Info */}
      <section className="user-info">
        {/* ... existing user info ... */}
      </section>

      {/* Progress Section */}
      <section className="my-progress">
        <h2>My Progress</h2>
        <ProgressVisualization />
      </section>

      {/* Analytics Section */}
      <section className="my-analytics">
        <h2>My Analytics</h2>
        <AnalyticsDashboard />
      </section>
    </div>
  );
};
```

### Option 4: Add as Sidebar Widgets

Show compact versions in a sidebar:

```tsx
// Example: components/Layout/Sidebar.tsx
import { RecommendationWidget } from '../AI/RecommendationWidget';
import { PredictionIndicator } from '../AI/PredictionIndicator';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar w-80 p-4 space-y-4">
      {/* Quick Recommendations */}
      <div className="widget">
        <h3 className="text-lg font-semibold mb-2">Quick Picks</h3>
        <RecommendationWidget maxItems={3} />
      </div>

      {/* Alerts */}
      <div className="widget">
        <h3 className="text-lg font-semibold mb-2">Alerts</h3>
        <PredictionIndicator subject="Mathematics" />
      </div>
    </aside>
  );
};
```

## Quick Integration Example

Here's a minimal example to add to your existing App.tsx or main workspace:

```tsx
// App.tsx or Workspace.tsx
import React from 'react';
import { RecommendationWidget } from './src/components/AI/RecommendationWidget';
import { AnalyticsDashboard } from './src/components/AI/AnalyticsDashboard';
import { ProgressVisualization } from './src/components/AI/ProgressVisualization';
import { PredictionIndicator } from './src/components/AI/PredictionIndicator';

function App() {
  return (
    <div className="app">
      {/* Your existing navbar, etc. */}
      
      {/* Add AI Components Section */}
      <main className="main-content p-6">
        <div className="ai-dashboard space-y-8">
          {/* Progress at the top */}
          <ProgressVisualization />
          
          {/* Predictions */}
          <PredictionIndicator />
          
          {/* Grid layout for recommendations and analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecommendationWidget />
            <AnalyticsDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
```

## Component Props Reference

### RecommendationWidget

```typescript
interface RecommendationWidgetProps {
  maxItems?: number;                    // Default: 10
  onRecommendationClick?: (rec) => void;
  onDismiss?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'helpful' | 'not-helpful') => void;
  className?: string;
}
```

### AnalyticsDashboard

```typescript
interface AnalyticsDashboardProps {
  className?: string;
}
```

### ProgressVisualization

```typescript
interface ProgressVisualizationProps {
  className?: string;
}
```

### PredictionIndicator

```typescript
interface PredictionIndicatorProps {
  subject?: string;                     // Filter by subject
  className?: string;
  onActionClick?: (action: string) => void;
}
```

## Styling Notes

All components use:
- Tailwind CSS classes
- Dark mode support (`dark:` variants)
- Responsive design (mobile-first)
- Framer Motion animations

They will automatically match your app's theme if you're using Tailwind.

## Testing the Components

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the page** where you added the components

3. **Check the browser console** for any errors

4. **Test interactions:**
   - Click recommendations
   - Expand/collapse predictions
   - Change time ranges in analytics
   - Dismiss items

## Next Steps

1. Choose an integration option above
2. Add the components to your desired location
3. Customize the layout and styling as needed
4. Connect to real data sources (components currently use mock data)
5. Add navigation/routing to access the new pages

## Need Help?

- All components are self-contained and handle their own state
- They fetch data from `aiServiceFacade` automatically
- They include loading states, error handling, and fallbacks
- They're fully accessible (WCAG 2.1 AA compliant)

## Example: Full Dashboard Page

Create `src/pages/AIDashboard.tsx`:

```tsx
import React from 'react';
import { RecommendationWidget } from '../components/AI/RecommendationWidget';
import { AnalyticsDashboard } from '../components/AI/AnalyticsDashboard';
import { ProgressVisualization } from '../components/AI/ProgressVisualization';
import { PredictionIndicator } from '../components/AI/PredictionIndicator';

export const AIDashboard: React.FC = () => {
  const handleRecommendationClick = (recommendation: any) => {
    console.log('Opening recommendation:', recommendation);
    // Navigate to content or open modal
  };

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Handle recommendation action
  };

  return (
    <div className="ai-dashboard min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Learning Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress, get personalized recommendations, and insights
          </p>
        </header>

        {/* Progress Section */}
        <section>
          <ProgressVisualization />
        </section>

        {/* Predictions Section */}
        <section>
          <PredictionIndicator onActionClick={handleActionClick} />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <section>
            <RecommendationWidget 
              maxItems={5}
              onRecommendationClick={handleRecommendationClick}
            />
          </section>

          {/* Analytics */}
          <section>
            <AnalyticsDashboard />
          </section>
        </div>
      </div>
    </div>
  );
};
```

Then add routing in your App.tsx:

```tsx
import { AIDashboard } from './pages/AIDashboard';

// In your router:
<Route path="/dashboard" element={<AIDashboard />} />
```
