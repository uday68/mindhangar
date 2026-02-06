# MindHangar AI for Bharat - Developer Action Plan

**Date**: February 6, 2026
**Priority**: URGENT - Critical bugs blocking Indian user adoption
**Target**: Make application production-ready for Indian students

---

## 🚨 **CRITICAL FIXES (Sprint 1 - Week 1)**

### Priority 1: Language System Implementation

**Issue**: Language selection not working, no multi-language content

**Action Items**:
1. ✅ **Fix Language Selector Component**
   - File: `src/components/LanguageSelector.tsx`
   - Connect to i18n context properly
   - Ensure state updates trigger re-renders
   
2. ✅ **Implement I18n Context Provider**
   - File: `src/contexts/I18nContext.tsx`
   - Wrap App component with IntlProvider
   - Load correct message files based on selection

3. ✅ **Add Missing Translation Files**
   - Files: `src/i18n/messages/*.json`
   - Complete translations for all 8 languages
   - Include UI strings, error messages, help text

4. ✅ **Integrate Language Engine Service**
   - File: `src/services/LanguageEngine.ts`
   - Implement actual translation logic
   - Add voice input/output for Indian languages

**Files to Create/Modify**:
```
src/
├── contexts/
│   └── I18nContext.tsx (✅ exists, needs integration)
├── components/
│   └── LanguageSelector.tsx (✅ exists, needs fixing)
├── i18n/
│   ├── index.ts (✅ exists)
│   └── messages/
│       ├── hi.json (✅ exists, needs completion)
│       ├── ta.json (needs creation)
│       ├── te.json (✅ exists, needs completion)
│       ├── bn.json (✅ exists, needs completion)
│       ├── mr.json (✅ exists, needs completion)
│       ├── gu.json (✅ exists, needs completion)
│       └── kn.json (needs creation)
```

**Testing**:
- [ ] Language switches correctly in UI
- [ ] All panels show translated content
- [ ] Regional scripts render properly
- [ ] Voice input works in Hindi, Tamil

---

### Priority 2: Offline Functionality

**Issue**: App doesn't work without internet, no caching

**Action Items**:
1. ✅ **Implement Service Worker**
   - File: `vite.config.ts` (PWA plugin configured)
   - Add offline caching strategies
   - Cache essential assets and content

2. ✅ **Create Offline Sync Service**
   - File: `src/services/OfflineSyncService.ts` (needs creation)
   - Implement local storage for content
   - Background sync when online

3. ✅ **Add Offline Indicators**
   - Show offline status in UI
   - Indicate which content is cached
   - Queue actions for sync

4. ✅ **Implement IndexedDB Storage**
   - Use `idb` package (already in dependencies)
   - Store notes, progress, quiz data locally

**Files to Create**:
```
src/
├── services/
│   ├── OfflineSyncService.ts (NEW)
│   └── CacheManager.ts (NEW)
├── hooks/
│   ├── useOfflineStatus.ts (NEW)
│   └── useOfflineSync.ts (NEW)
├── components/
│   └── OfflineIndicator.tsx (NEW)
```

**Testing**:
- [ ] App loads without internet
- [ ] Cached content accessible offline
- [ ] Progress syncs when back online
- [ ] No data loss during offline usage

---

### Priority 3: Mobile Responsive Design

**Issue**: UI broken on small screens, not mobile-first

**Action Items**:
1. ✅ **Implement Mobile-First Layouts**
   - Modify: `components/Layout/Workspace.tsx`
   - Add responsive breakpoints
   - Stack panels vertically on mobile

2. ✅ **Create Mobile Navigation**
   - Modify: `components/Layout/Sidebar.tsx`
   - Bottom navigation for mobile
   - Hamburger menu for panels

3. ✅ **Optimize Touch Targets**
   - Minimum 44x44px touch targets
   - Larger buttons and controls
   - Better spacing for fat fingers

4. ✅ **Test on Real Devices**
   - Test on 4-inch Android devices
   - Verify on low-end phones (2GB RAM)
   - Check on various screen sizes

**Files to Modify**:
```
components/
├── Layout/
│   ├── Workspace.tsx (responsive panels)
│   ├── Sidebar.tsx (mobile navigation)
│   └── MobileNav.tsx (NEW)
├── Shared/
│   └── GlassPanel.tsx (mobile optimizations)
```

**CSS Changes**:
```css
/* Add to global styles */
@media (max-width: 768px) {
  /* Mobile-specific styles */
  .workspace-panel {
    width: 100% !important;
    height: auto !important;
    position: relative !important;
  }
}
```

**Testing**:
- [ ] Works on 4-inch screens
- [ ] Touch targets are accessible
- [ ] No horizontal scrolling
- [ ] Panels stack properly

---

## 🔥 **HIGH PRIORITY (Sprint 2 - Week 2)**

### Priority 4: Indian Education System Integration

**Issue**: No CBSE/ICSE/State Board support, no JEE/NEET content

**Action Items**:
1. ✅ **Create Curriculum Adapter Service**
   - File: `src/services/CurriculumAdapter.ts` (NEW)
   - Implement board-specific content alignment
   - Add syllabus mapping for CBSE, ICSE, State Boards

2. ✅ **Add Educational Board Selection**
   - Modify: `components/Auth/OnboardingModal.tsx`
   - Add board, grade, exam goal selection
   - Store in user profile

3. ✅ **Implement Competitive Exam Modules**
   - Create: `src/services/CompetitiveExamService.ts` (NEW)
   - JEE Main/Advanced question patterns
   - NEET, UPSC, CAT, GATE modules

4. ✅ **Integrate with AI Services**
   - Modify: `services/geminiService.ts`
   - Add board-specific prompts
   - Generate exam-pattern questions

**Files to Create**:
```
src/
├── services/
│   ├── CurriculumAdapter.ts (NEW)
│   ├── CompetitiveExamService.ts (NEW)
│   └── BoardContentMapper.ts (NEW)
├── data/
│   ├── cbse-syllabus.json (NEW)
│   ├── icse-syllabus.json (NEW)
│   ├── jee-topics.json (NEW)
│   └── neet-topics.json (NEW)
├── components/
│   └── ExamPrepPanel.tsx (NEW)
```

**Testing**:
- [ ] Board selection works in onboarding
- [ ] Content aligns with selected board
- [ ] JEE questions follow actual pattern
- [ ] NEET questions are medically relevant

---

### Priority 5: Data Usage Optimization

**Issue**: 150MB in 30 minutes - too expensive for Indian students

**Action Items**:
1. ✅ **Implement Low-Bandwidth Mode**
   - Create: `src/services/BandwidthOptimizer.ts` (NEW)
   - Compress images and assets
   - Lazy load non-critical content

2. ✅ **Add Data Usage Tracking**
   - Show data usage in real-time
   - Warn when approaching limits
   - Provide data-saving tips

3. ✅ **Optimize Asset Loading**
   - Use WebP images instead of PNG/JPG
   - Implement progressive image loading
   - Reduce bundle size

4. ✅ **Add Data Saver Mode**
   - Disable auto-play videos
   - Load text-only versions
   - Compress API responses

**Files to Create**:
```
src/
├── services/
│   ├── BandwidthOptimizer.ts (NEW)
│   └── DataUsageTracker.ts (NEW)
├── components/
│   ├── DataUsageIndicator.tsx (NEW)
│   └── LowBandwidthModeToggle.tsx (NEW)
├── hooks/
│   └── useDataUsage.ts (NEW)
```

**Optimization Targets**:
- [ ] Reduce initial load to <500KB
- [ ] Limit data usage to <20MB/hour
- [ ] Implement 70% data reduction in low-bandwidth mode
- [ ] Cache aggressively

---

### Priority 6: Cultural Context in AI

**Issue**: AI uses American examples, not Indian context

**Action Items**:
1. ✅ **Implement Cultural Filter Service**
   - File: `src/services/CulturalFilter.ts` (✅ exists, needs implementation)
   - Filter AI responses for cultural appropriateness
   - Replace Western examples with Indian ones

2. ✅ **Create Indian Example Database**
   - File: `src/data/indian-examples.json` (NEW)
   - Cricket, festivals, historical figures
   - Regional variations

3. ✅ **Integrate with Gemini Service**
   - Modify: `services/geminiService.ts`
   - Add cultural context to prompts
   - Post-process responses

4. ✅ **Add Festival Calendar**
   - Create: `src/data/indian-festivals.json` (NEW)
   - Integrate with study planner
   - Avoid scheduling on major festivals

**Files to Create**:
```
src/
├── services/
│   └── CulturalFilter.ts (✅ exists, needs completion)
├── data/
│   ├── indian-examples.json (NEW)
│   ├── indian-festivals.json (NEW)
│   ├── cultural-references.json (NEW)
│   └── regional-preferences.json (NEW)
```

**Testing**:
- [ ] AI uses cricket instead of baseball
- [ ] References Diwali, Holi, Eid appropriately
- [ ] Uses Indian historical figures
- [ ] Respects regional cultural differences

---

## ⚡ **MEDIUM PRIORITY (Sprint 3 - Week 3)**

### Priority 7: Parent/Teacher Dashboard

**Action Items**:
1. Create multi-role authentication system
2. Build parent dashboard component
3. Implement progress tracking and reporting
4. Add parental controls

**Files to Create**:
```
src/
├── components/
│   ├── ParentDashboard.tsx (NEW)
│   ├── TeacherDashboard.tsx (NEW)
│   └── ProgressReport.tsx (NEW)
├── services/
│   └── ParentalControlService.ts (NEW)
```

---

### Priority 8: Regional Script Support

**Action Items**:
1. Implement proper font loading for Devanagari, Tamil, Telugu, Bengali, Gujarati
2. Add script conversion utilities
3. Test rendering on various devices

**Files to Modify**:
```
src/
├── styles/
│   ├── fonts.css (NEW)
│   └── i18n.css (✅ exists, needs fonts)
├── services/
│   └── ScriptConverter.ts (NEW)
```

---

### Priority 9: Indian Payment Integration

**Action Items**:
1. Integrate Razorpay SDK
2. Add UPI, Paytm, PhonePe options
3. Implement INR pricing
4. Add prepaid recharge model

**Files to Create**:
```
src/
├── services/
│   ├── PaymentService.ts (NEW)
│   └── RazorpayIntegration.ts (NEW)
├── components/
│   └── PaymentModal.tsx (NEW)
```

---

## 📋 **DEVELOPER RESOURCES TO ADD**

### 1. **CONTRIBUTING.md**
```markdown
# Contributing to MindHangar AI for Bharat

## Development Setup
## Code Style Guidelines
## Testing Requirements
## Pull Request Process
## Cultural Sensitivity Guidelines
```

### 2. **API_DOCUMENTATION.md**
```markdown
# API Documentation

## Language Engine API
## Cultural Filter API
## Curriculum Adapter API
## Offline Sync API
## Payment Integration API
```

### 3. **.env.example**
```env
# Gemini API
GEMINI_API_KEY=your_key_here

# Payment Gateway
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here

# Database
DATABASE_URL=./mindhangar-bharat.db

# Feature Flags
ENABLE_OFFLINE_MODE=true
ENABLE_LOW_BANDWIDTH_MODE=true
ENABLE_VOICE_INPUT=true
```

### 4. **DEPLOYMENT.md**
```markdown
# Deployment Guide

## Prerequisites
## Build Process
## Environment Variables
## Vercel Deployment
## AWS Deployment
## Performance Optimization
## Monitoring Setup
```

### 5. **TESTING.md**
```markdown
# Testing Guide

## Unit Tests
## Integration Tests
## Property-Based Tests
## Cultural Testing
## Performance Testing
## Mobile Device Testing
```

### 6. **ARCHITECTURE.md**
```markdown
# Architecture Documentation

## System Overview
## Component Diagram
## Data Flow
## Service Layer
## State Management
## Offline Architecture
```

### 7. **LOCALIZATION_GUIDE.md**
```markdown
# Localization Guide

## Adding New Languages
## Translation Workflow
## Script Support
## Cultural Adaptation
## Testing Translations
```

### 8. **PERFORMANCE_GUIDE.md**
```markdown
# Performance Optimization Guide

## Bundle Size Optimization
## Data Usage Reduction
## Caching Strategies
## Mobile Performance
## Network Optimization
```

---

## 🔧 **IMMEDIATE ACTIONS (Today)**

1. **Fix Language Selector**
   ```bash
   # Test language switching
   npm run test src/components/LanguageSelector.test.tsx
   ```

2. **Enable Offline Mode**
   ```bash
   # Build with PWA
   npm run build
   # Test offline functionality
   ```

3. **Add Mobile Breakpoints**
   ```bash
   # Update Tailwind config
   # Test on mobile viewport
   ```

4. **Reduce Bundle Size**
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   # Optimize imports
   ```

---

## 📊 **SUCCESS METRICS**

### Week 1 Targets:
- [ ] Language switching works for all 8 languages
- [ ] App works offline with cached content
- [ ] Mobile UI usable on 4-inch screens
- [ ] Data usage < 30MB/hour

### Week 2 Targets:
- [ ] CBSE/ICSE board selection functional
- [ ] JEE/NEET question patterns implemented
- [ ] Cultural filter active in AI responses
- [ ] Festival calendar integrated

### Week 3 Targets:
- [ ] Parent dashboard live
- [ ] Regional scripts rendering properly
- [ ] UPI payment integration complete
- [ ] Performance optimized for 2G networks

---

## 🎯 **DEFINITION OF DONE**

An issue is considered "done" when:
1. ✅ Code implemented and tested
2. ✅ Unit tests passing
3. ✅ Integration tests passing
4. ✅ Tested on real Indian mobile devices
5. ✅ Tested on 2G/3G networks
6. ✅ Tested with Indian language content
7. ✅ Documentation updated
8. ✅ User acceptance testing passed

---

## 👥 **TEAM ASSIGNMENTS**

### Frontend Team:
- Language system implementation
- Mobile responsive design
- Offline functionality
- UI/UX improvements

### Backend Team:
- Curriculum adapter service
- Cultural filter implementation
- Payment integration
- API optimization

### QA Team:
- Mobile device testing
- Network condition testing
- Language testing
- Cultural appropriateness testing

### DevOps Team:
- Performance optimization
- CDN setup for India
- Monitoring and analytics
- Deployment automation

---

## 📞 **SUPPORT CONTACTS**

- **Technical Lead**: [Your Name]
- **Product Manager**: [PM Name]
- **QA Lead**: [QA Name]
- **Cultural Consultant**: [Consultant Name]

---

**Last Updated**: February 6, 2026
**Next Review**: February 13, 2026