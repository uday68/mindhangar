# Project Restructure Plan

## Current Issues Identified

### 1. **Inconsistent Directory Structure**
- Components split between `/components` and `/src/components`
- Services split between `/services` and `/src/services`
- Store files have duplicates (useStore.ts, useStore.enhanced.ts, useStore.modernization.ts)
- Root-level files mixed with source code (App.tsx, types.ts, constants.ts in root)

### 2. **Redundant Documentation Files (30+ files in root)**
All these completion/status files should be in `/docs`:
- AI_COMPONENTS_INTEGRATION_COMPLETE.md
- AI_COMPONENTS_INTEGRATION_GUIDE.md
- AI_DASHBOARD_QUICK_START.md
- AI_INTEGRATION_SUMMARY.md
- AI_SERVICE_FIX_COMPLETE.md
- BUG_FIX_COURSES_PANEL.md
- COMPLETE_PROJECT_ANALYSIS.md
- COURSE_BROWSING_FIX.md
- COURSE_BROWSING_WORKING.md
- DATABASE_FIX_COMPLETE.md
- DEVELOPER_QUICK_START.md
- DEVELOPER_TOOLS_INTEGRATION_COMPLETE.md
- DOCUMENTATION_UPDATE_SUMMARY.md
- DYNAMIC_IMPLEMENTATION_COMPLETE.md
- FAKE_IMPLEMENTATION_REMOVAL_COMPLETE.md
- FINAL_INTEGRATION_COMPLETE.md
- FINAL_INTEGRATION_STATUS.md
- FIXES_SUMMARY.md
- FRONTEND_MODERNIZATION_QUICK_START.md
- IMPLEMENTATION_COMPLETE_4HOUR_SPRINT.md
- IMPLEMENTATION_VERIFICATION.md
- INITIAL_INTERACTION_COMPLETE.md
- INTEGRATION_COMPLETE_SUMMARY.md
- INTEGRATION_QUICK_START.md
- PHASE_2_3_IMPLEMENTATION_COMPLETE.md
- PHASE_2_COMPLETE_FORMS_BUTTONS.md
- PHASE_3_AI_INTEGRATION_PROGRESS.md
- POST_LOGIN_ONBOARDING_COMPLETE.md
- PROJECT_COMPLETE_SUMMARY.md
- PROJECT_DIAGNOSIS.md
- PROJECT_STATUS.md
- QUICK_START_PRODUCTION.md
- START_HERE_AFTER_FIXES.md
- WORKSPACE_GLASSPANEL_MODERNIZATION_COMPLETE.md
- YOUTUBE_DYNAMIC_INTEGRATION.md
- YOUTUBE_INTEGRATION_STATUS.md

### 3. **Duplicate Store Files**
- store/useStore.ts (main)
- store/useStore.enhanced.ts (duplicate)
- store/useStore.modernization.ts (duplicate)

### 4. **Mixed Import Paths**
Components importing from both:
- `../../components/` 
- `../../../components/`
- `../../src/components/`

## Proposed Structure

```
mindhangar/
├── .git/
├── .kiro/
│   └── specs/
├── .vscode/
├── docs/                          # All documentation
│   ├── architecture/
│   ├── guides/
│   ├── implementation/
│   └── sessions/
├── public/                        # Static assets
├── scripts/                       # Build/utility scripts
├── src/
│   ├── components/               # All components unified
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── buttons/
│   │   ├── dashboard/
│   │   ├── design-system/
│   │   ├── error/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── loading/
│   │   ├── marketing/
│   │   ├── modals/
│   │   ├── panels/
│   │   ├── shared/
│   │   ├── ErrorBoundary.tsx
│   │   └── Icons.tsx
│   ├── config/                   # Configuration
│   ├── contexts/                 # React contexts
│   ├── db/                       # Database layer
│   ├── hooks/                    # Custom hooks
│   ├── i18n/                     # Internationalization
│   ├── services/                 # All services unified
│   │   ├── agents/
│   │   ├── ai/
│   │   ├── auth.service.ts
│   │   ├── gemini.service.ts
│   │   ├── youtube.service.ts
│   │   └── index.ts
│   ├── store/                    # State management
│   │   ├── slices/
│   │   ├── courseStore.ts
│   │   └── appStore.ts
│   ├── styles/                   # Global styles
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── constants.ts
├── .env.example
├── .env.production.example
├── .gitignore
├── CONTRIBUTING.md
├── index.html
├── package.json
├── README.md
├── TODO.md
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Action Plan

### Phase 1: Move Documentation (Low Risk)
1. Create organized docs structure
2. Move all completion/status files to docs/implementation/
3. Keep only essential files in root (README, CONTRIBUTING, TODO)

### Phase 2: Consolidate Components (Medium Risk)
1. Move all components to src/components/
2. Update all import paths
3. Remove empty /components directory

### Phase 3: Consolidate Services (Medium Risk)
1. Move services/ to src/services/
2. Rename to follow convention (authService.ts → auth.service.ts)
3. Update all imports

### Phase 4: Clean Store (Low Risk)
1. Keep only useStore.ts (main)
2. Archive enhanced/modernization versions
3. Update imports if needed

### Phase 5: Move Root Files (Low Risk)
1. Move App.tsx to src/
2. Move types.ts to src/types/
3. Move constants.ts to src/
4. Update index.tsx imports

### Phase 6: Update All Imports (High Risk - Requires Testing)
1. Run find/replace for import paths
2. Test build
3. Fix any broken imports

## Files to Delete

### Duplicate Store Files
- store/useStore.enhanced.ts
- store/useStore.modernization.ts

### Temporary/Obsolete Files
- PowerPoint_Ready_Slides.txt (move to docs if needed)
- metadata.json (if not used)

## Files to Keep in Root
- .env.example
- .env.production.example
- .gitignore
- CONTRIBUTING.md
- index.html
- package.json
- package-lock.json
- README.md
- TODO.md
- tsconfig.json
- vite.config.ts
- vitest.config.ts
- drizzle.config.ts

## Benefits

1. **Clear Structure**: Single source of truth for components/services
2. **Easier Navigation**: Logical grouping of related files
3. **Better Imports**: Consistent import paths
4. **Cleaner Root**: Only essential config files
5. **Organized Docs**: Easy to find documentation
6. **Maintainability**: Easier for new developers to understand

## Risk Assessment

- **Low Risk**: Documentation moves, file renames
- **Medium Risk**: Component/service consolidation (requires import updates)
- **High Risk**: None if done carefully with testing

## Execution Order

1. Documentation reorganization (can be done anytime)
2. Store cleanup (minimal impact)
3. Services consolidation (test after)
4. Components consolidation (test after)
5. Root file moves (test after)
6. Final cleanup and verification
