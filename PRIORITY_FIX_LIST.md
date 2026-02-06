# Priority Fix List - MindHangar AI for Bharat

**Last Updated**: February 6, 2026  
**Status**: Ready for Implementation

---

## 🔴 CRITICAL FIXES (Do First - 2 Hours to 1 Week)

### 1. Fix Broken Imports in Panel Components ⏱️ 2 hours
**Impact**: App crashes when opening panels  
**Difficulty**: Easy

**Files to Fix**:
```
components/Panels/VideoPanel.tsx
components/Panels/SearchPanel.tsx
components/Panels/QuizPanel.tsx
components/Panels/PlannerPanel.tsx
components/Panels/FocusPanel.tsx
components/Panels/ChatPanel.tsx
components/Panels/SettingsPanel.tsx
```

**Change**:
```typescript
// BEFORE (BROKEN)
import { summarizeContent } from '../../services/geminiService';

// AFTER (FIXED)
import { aiAssistant } from '../../src/services/AIAssistantService';

// Update usage:
const summary = await aiAssistant.generateContent(content, 'summary');
```

**Test**: Open each panel and verify no crashes

---

### 2. Fix AIAssistantService isReady() Logic ⏱️ 30 minutes
**Impact**: AI features don't work without API key  
**Difficulty**: Easy

**File**: `src/services/AIAssistantService.ts` line 75

**Change**:
```typescript
// BEFORE (BROKEN)
isReady(): boolean {
  return this.isInitialized && this.apiKey !== null;
}

// AFTER (FIXED)
isReady(): boolean {
  return this.isInitialized; // Works with or without API key
}
```

**Test**: Use AI features without API key

---

### 3. Connect ContentService to Database ⏱️ 2 days
**Impact**: Notes, videos, quizzes not saved  
**Difficulty**: Medium

**File**: `src/services/ContentService.ts`

**Methods to Fix**:
- `searchContent()` line 145-150
- `getContentByType()` line 152-160
- `saveContent()` line 80-90
- `updateContent()` line 92-100
- `deleteContent()` line 102-110

**Implementation**:
```typescript
// Add at top
import { notionDB } from '../db/notionLikeDB';

// Fix searchContent
async searchContent(query: string): Promise<Content[]> {
  // BEFORE: return [];
  // AFTER:
  return await notionDB.searchContent(query);
}

// Fix getContentByType
async getContentByType(type: ContentType): Promise<Content[]> {
  // BEFORE: return [];
  // AFTER:
  return await notionDB.getContentByType(type);
}
```

**Test**: Create note, refresh page, verify note persists

---

### 4. Connect ProgressService to Database ⏱️ 1 day
**Impact**: Progress, XP, streaks not saved  
**Difficulty**: Medium

**File**: `src/services/ProgressService.ts`

**Methods to Fix**:
- `getLeaderboard()` line 200-210
- `saveProgress()` line 50-60
- `getProgress()` line 62-70

**Implementation**:
```typescript
import { notionDB } from '../db/notionLikeDB';

async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  // BEFORE: return [];
  // AFTER:
  return await notionDB.getLeaderboard(limit);
}
```

**Test**: Earn XP, refresh page, verify XP persists

---

### 5. Fix Language Switching ⏱️ 1 day
**Impact**: Language selector doesn't work  
**Difficulty**: Medium

**Files**:
- `src/components/LanguageSelector.tsx`
- `App.tsx`
- `index.tsx`

**Implementation**:
```typescript
// In index.tsx, wrap App with I18nProvider
import { I18nProvider } from './src/contexts/I18nContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);

// In LanguageSelector.tsx, use context
import { useI18n } from '../../contexts/I18nContext';

const { locale, setLocale } = useI18n();

const handleLanguageChange = (newLocale: string) => {
  setLocale(newLocale);
};
```

**Test**: Change language, verify UI updates

---

### 6. Add Board Selection Onboarding ⏱️ 3 days
**Impact**: No curriculum alignment  
**Difficulty**: Medium

**Create New File**: `components/Auth/BoardSelection.tsx`

**Implementation**:
```typescript
export const BoardSelection: React.FC = () => {
  const [board, setBoard] = useState('');
  const [grade, setGrade] = useState('');
  const [exam, setExam] = useState('');

  return (
    <div className="board-selection">
      <h2>Select Your Board</h2>
      <select value={board} onChange={(e) => setBoard(e.target.value)}>
        <option value="CBSE">CBSE</option>
        <option value="ICSE">ICSE</option>
        <option value="State">State Board</option>
      </select>

      <h2>Select Your Grade</h2>
      <select value={grade} onChange={(e) => setGrade(e.target.value)}>
        {[6,7,8,9,10,11,12].map(g => (
          <option key={g} value={g}>Class {g}</option>
        ))}
      </select>

      <h2>Preparing For (Optional)</h2>
      <select value={exam} onChange={(e) => setExam(e.target.value)}>
        <option value="">None</option>
        <option value="JEE">JEE</option>
        <option value="NEET">NEET</option>
        <option value="UPSC">UPSC</option>
      </select>

      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
};
```

**Integrate**: Add to onboarding flow after AIGuidedOnboarding

**Test**: Complete onboarding, verify board/grade saved

---

### 7. Add Cultural Context to AI Prompts ⏱️ 2 days
**Impact**: AI responses feel foreign  
**Difficulty**: Easy

**File**: `src/services/AIAssistantService.ts`

**Update All Prompts**:
```typescript
// BEFORE
const prompt = `Explain this concept clearly for students: ${topic}`;

// AFTER
const prompt = `Explain ${topic} for Indian students studying ${board} ${grade}. 
Use Indian examples and context. If relevant, relate to Indian culture, festivals, 
or daily life. Keep language simple and accessible.`;

// BEFORE
const prompt = `Generate study notes about: ${topic}`;

// AFTER
const prompt = `Generate study notes about ${topic} for Indian ${grade} students 
preparing for ${exam}. Follow ${board} syllabus. Use Indian examples like:
- Cricket for statistics
- Indian festivals for calendar problems
- Indian cities for geography
- Bollywood for cultural references`;
```

**Update in**:
- `generateContent()` line 280-300
- `generateQuiz()` line 450-470
- `getContextualHelp()` line 350-370
- `improveText()` line 250-270

**Test**: Generate content, verify Indian context

---

## 🟠 HIGH PRIORITY FIXES (Do Next - 3 Days to 2 Weeks)

### 8. Complete Translation Files ⏱️ 1 week
**Impact**: Partial language support  
**Difficulty**: Easy but time-consuming

**Files to Complete**:
```
src/i18n/messages/hi.json - 60% → 100%
src/i18n/messages/te.json - 40% → 100%
src/i18n/messages/ta.json - 40% → 100%
src/i18n/messages/bn.json - 40% → 100%
src/i18n/messages/mr.json - 40% → 100%
src/i18n/messages/gu.json - 40% → 100%
src/i18n/messages/kn.json - 40% → 100%
```

**Process**:
1. Extract all English strings from components
2. Translate to each language
3. Add to JSON files
4. Test each language

**Test**: Switch to each language, verify all text translated

---

### 9. Fix Mobile UI Issues ⏱️ 3 days
**Impact**: Unusable on budget smartphones  
**Difficulty**: Medium

**Files**:
- `components/Layout/Workspace.tsx`
- `src/styles/mobile.css`

**Changes**:
```css
/* Add better breakpoints */
@media (max-width: 640px) {
  .workspace {
    flex-direction: column;
  }
  
  .panel {
    width: 100% !important;
    height: auto !important;
    position: relative !important;
  }
}

/* Stack panels vertically on mobile */
@media (max-width: 640px) {
  .panel-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
```

**Test**: Test on actual budget smartphone (not just browser resize)

---

### 10. Optimize Bundle Size ⏱️ 3 days
**Impact**: Slow loading on 2G/3G  
**Difficulty**: Medium

**Current**: ~2.5MB  
**Target**: <500KB

**Implementation**:
```typescript
// In vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['react-rnd'],
          'ai-vendor': ['@xenova/transformers']
        }
      }
    }
  }
});

// Lazy load panels
const VideoPanel = lazy(() => import('./components/Panels/VideoPanel'));
const QuizPanel = lazy(() => import('./components/Panels/QuizPanel'));
// etc.
```

**Test**: Check bundle size with `npm run build`

---

### 11. Optimize Data Usage ⏱️ 1 week
**Impact**: Uses 100+ MB/hour  
**Difficulty**: Medium

**Current**: ~100MB/hour  
**Target**: <10MB/hour

**File**: `src/services/BandwidthOptimizer.ts`

**Implementation**:
```typescript
// Add aggressive compression
async compressData(data: any): Promise<Blob> {
  const json = JSON.stringify(data);
  const compressed = await compress(json); // Use pako or similar
  return compressed;
}

// Cache everything
async cacheResource(url: string): Promise<void> {
  const cache = await caches.open('mindhangar-v1');
  await cache.add(url);
}

// Reduce video quality on slow connections
getVideoQuality(): string {
  if (this.connectionSpeed < 1) return '144p';
  if (this.connectionSpeed < 2) return '240p';
  if (this.connectionSpeed < 5) return '360p';
  return '480p';
}
```

**Test**: Monitor data usage over 1 hour session

---

### 12. Add Parent Dashboard ⏱️ 2 weeks
**Impact**: Parents can't monitor learning  
**Difficulty**: High

**Create New Files**:
```
components/Dashboards/ParentDashboard.tsx
components/Dashboards/ProgressChart.tsx
components/Dashboards/ActivityLog.tsx
components/Dashboards/ReportCard.tsx
```

**Features**:
- View student progress
- See study time
- Check quiz scores
- View activity log
- Generate reports

**Test**: Log in as parent, view student data

---

### 13. Integrate Razorpay Payment ⏱️ 1 week
**Impact**: Can't process payments  
**Difficulty**: Medium

**Create New File**: `src/services/PaymentService.ts`

**Implementation**:
```typescript
import Razorpay from 'razorpay';

class PaymentService {
  async createOrder(amount: number): Promise<string> {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    return order.id;
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    // Verify signature
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    return generated === signature;
  }
}
```

**Test**: Make test payment with Razorpay test mode

---

### 14. Add Festival Calendar ⏱️ 3 days
**Impact**: Study plans ignore festivals  
**Difficulty**: Easy

**Create New File**: `src/data/festivals.ts`

**Implementation**:
```typescript
export const indianFestivals2026 = [
  { date: '2026-01-26', name: 'Republic Day', type: 'national' },
  { date: '2026-03-14', name: 'Holi', type: 'festival' },
  { date: '2026-08-15', name: 'Independence Day', type: 'national' },
  { date: '2026-10-24', name: 'Diwali', type: 'festival' },
  // Add all major festivals
];

export function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return indianFestivals2026.some(f => f.date === dateStr);
}

export function adjustStudyPlan(plan: StudyPlan): StudyPlan {
  // Skip festival days
  return plan.filter(day => !isHoliday(day.date));
}
```

**Test**: Create study plan, verify festivals skipped

---

### 15. Add Regional Script Support ⏱️ 1 week
**Impact**: Difficult for native speakers  
**Difficulty**: Medium

**Files**:
- `src/i18n/index.ts`
- `src/styles/i18n.css`

**Implementation**:
```css
/* Add font support */
@font-face {
  font-family: 'Noto Sans Devanagari';
  src: url('/fonts/NotoSansDevanagari.woff2');
}

@font-face {
  font-family: 'Noto Sans Tamil';
  src: url('/fonts/NotoSansTamil.woff2');
}

/* Apply based on language */
[lang="hi"] {
  font-family: 'Noto Sans Devanagari', sans-serif;
}

[lang="ta"] {
  font-family: 'Noto Sans Tamil', sans-serif;
}
```

**Test**: Switch to Hindi, verify Devanagari script

---

### 16. Add Voice Input ⏱️ 1 week
**Impact**: Accessibility limited  
**Difficulty**: High

**Create New File**: `src/services/VoiceService.ts`

**Implementation**:
```typescript
class VoiceService {
  private recognition: SpeechRecognition;

  startListening(language: string = 'en-IN'): void {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = language;
    this.recognition.continuous = true;
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.onTranscript(transcript);
    };
    
    this.recognition.start();
  }

  speak(text: string, language: string = 'en-IN'): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    speechSynthesis.speak(utterance);
  }
}
```

**Test**: Use voice to create note

---

## 🟡 MEDIUM PRIORITY FIXES (Do Later - 1-2 Weeks)

### 17. Build Backend API ⏱️ 2 weeks
**Impact**: Can't sync across devices  
**Difficulty**: High

**Tech Stack**:
- Node.js + Express
- PostgreSQL
- JWT authentication
- REST API

**Endpoints**:
```
POST /api/auth/login
POST /api/auth/register
GET /api/user/profile
PUT /api/user/profile
GET /api/content
POST /api/content
PUT /api/content/:id
DELETE /api/content/:id
GET /api/progress
POST /api/progress
GET /api/sync
POST /api/sync
```

**Test**: Sync data across two devices

---

### 18. Implement Real Sync ⏱️ 1 week
**Impact**: Data doesn't sync  
**Difficulty**: Medium

**File**: `src/services/SyncService.ts`

**Implementation**:
```typescript
async syncProgress(): Promise<void> {
  const localProgress = await this.getLocalProgress();
  const serverProgress = await this.fetchServerProgress();
  
  const merged = this.mergeProgress(localProgress, serverProgress);
  
  await this.saveLocalProgress(merged);
  await this.uploadProgress(merged);
}
```

**Test**: Make changes on device 1, verify on device 2

---

### 19. Add Error Boundaries ⏱️ 1 day
**Impact**: App crashes on errors  
**Difficulty**: Easy

**Create New File**: `components/ErrorBoundary.tsx`

**Implementation**:
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap App**:
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Test**: Throw error, verify error boundary catches it

---

### 20. Implement Security Measures ⏱️ 1 week
**Impact**: Data privacy concerns  
**Difficulty**: Medium

**Changes**:
```typescript
// Encrypt API keys
const encryptedKey = CryptoJS.AES.encrypt(apiKey, SECRET).toString();
localStorage.setItem('apiKey', encryptedKey);

// Sanitize inputs
const sanitized = DOMPurify.sanitize(userInput);

// Add rate limiting
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000
});

// Add CSRF protection
const csrfToken = generateCSRFToken();
```

**Test**: Try XSS attack, verify blocked

---

## 📊 PROGRESS TRACKING

### Week 1 Goals
- [ ] Fix broken imports (2 hours)
- [ ] Fix isReady() logic (30 min)
- [ ] Connect ContentService (2 days)
- [ ] Connect ProgressService (1 day)
- [ ] Fix language switching (1 day)

**Target**: 5/5 critical fixes complete

---

### Week 2 Goals
- [ ] Add board selection (3 days)
- [ ] Add cultural context (2 days)
- [ ] Start translations (2 days)

**Target**: Indian education features working

---

### Week 3 Goals
- [ ] Complete translations (5 days)
- [ ] Fix mobile UI (2 days)

**Target**: Full multi-language support

---

### Week 4 Goals
- [ ] Optimize bundle size (3 days)
- [ ] Optimize data usage (4 days)

**Target**: Performance optimized

---

## ✅ TESTING CHECKLIST

After each fix, test:
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Feature works as expected
- [ ] Data persists after refresh
- [ ] Works on mobile
- [ ] Works offline
- [ ] Works in all languages

---

## 🎯 SUCCESS CRITERIA

### Critical Fixes Complete
- ✅ All panels open without crashing
- ✅ AI works without API key
- ✅ Data persists after refresh
- ✅ Language switching works
- ✅ Board selection available
- ✅ AI uses Indian context

### High Priority Complete
- ✅ All languages 100% translated
- ✅ Mobile UI works on budget phones
- ✅ Bundle size <500KB
- ✅ Data usage <10MB/hour
- ✅ Parent dashboard functional
- ✅ Payments working

### Medium Priority Complete
- ✅ Backend API deployed
- ✅ Sync working across devices
- ✅ Error boundaries in place
- ✅ Security measures implemented

---

**Start Date**: February 6, 2026  
**Target Completion**: March 27, 2026 (6-8 weeks)  
**Status**: Ready to Begin

