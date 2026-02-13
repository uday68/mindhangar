# Design Document: Post-Login User Onboarding

## Overview

The post-login user onboarding feature provides an AI-powered conversational interface that collects essential student information after authentication. The system leverages the existing GeneralInteractionAgent to conduct a natural, step-by-step interview, validating inputs in real-time and storing the collected data in IndexedDB via notionDB. The onboarding modal is non-blocking, allowing users to skip and complete later, while ensuring data persists across sessions and devices.

### Key Design Goals

1. **Seamless Integration**: Trigger automatically after login without disrupting the authentication flow
2. **Natural Conversation**: Use AI-driven dialogue to make data collection feel engaging
3. **Robust Validation**: Validate all inputs in real-time with clear error messages
4. **Reliable Persistence**: Store data in IndexedDB with localStorage fallback
5. **Personalized Experience**: Utilize collected data throughout the application
6. **Accessibility**: Support keyboard navigation and screen readers

## Architecture

### Component Hierarchy

```
App.tsx
├── LoginScreen (handles OAuth/manual auth)
├── InitialInteractionModal (conditional render based on showOnboarding flag)
│   ├── GeneralInteractionAgent (conversation logic)
│   ├── Message Display (agent and user messages)
│   ├── Quick Reply Buttons (contextual suggestions)
│   └── Input Field (text entry)
├── ChatPanel (displays personalized welcome)
├── Dashboard (shows goals and progress)
└── useStore (global state management)
```

### Data Flow

```
1. User Login → authService.login()
2. Set showOnboarding = true (if first login)
3. Render InitialInteractionModal
4. GeneralInteractionAgent.start() → Initial greeting
5. User Input → GeneralInteractionAgent.processResponse()
6. Validation → Error or Next Step
7. Repeat steps 5-6 until complete
8. Save to notionDB.saveStudent() + notionDB.saveGoal()
9. Update useStore.user.profile
10. Set showOnboarding = false
11. Close modal → User sees personalized ChatPanel
```

### State Management

**useStore (Zustand)**
- `user`: User object with optional `profile` field
- `showOnboarding`: Boolean flag controlling modal visibility
- `completeOnboarding(profile)`: Action to save profile and close modal

**GeneralInteractionAgent (Internal State)**
- `currentStep`: Current conversation step (name, grade, board, etc.)
- `collectedData`: Partial student profile being built
- `conversationHistory`: Array of messages for UI display

**InitialInteractionModal (Local State)**
- `messages`: Array of {role, text} for rendering conversation
- `input`: Current user input text
- `isTyping`: Boolean for typing indicator
- `quickReplies`: Array of suggested responses

## Components and Interfaces

### 1. GeneralInteractionAgent (Bug Fix Required)

**Current Issue**: TypeScript error on line comparing `'confirmation'` with `'complete'`

**Fix**: Update `ConversationStep` type to include `'complete'`:

```typescript
type ConversationStep = 
  | 'greeting'
  | 'name'
  | 'grade'
  | 'board'
  | 'subjects'
  | 'goals'
  | 'study_time'
  | 'strengths'
  | 'weaknesses'
  | 'exam_date'
  | 'confirmation'
  | 'complete'; // ADD THIS
```

**Interface**:
```typescript
class GeneralInteractionAgent {
  start(userName?: string): string
  processResponse(userInput: string): { 
    message: string; 
    isComplete: boolean; 
    data?: StudentDetails 
  }
  getQuickReplies(): string[]
  getState(): AgentState
  reset(): void
}
```

**Validation Logic**:
- **Name**: Regex `/^[a-zA-Z\s]+$/` and length >= 2
- **Grade**: Extract number or "college" from input
- **Board**: Match "cbse", "icse", or "state" (case-insensitive)
- **Subjects**: Split by comma, trim, filter empty
- **Goals**: Split by comma or newline, trim, filter empty
- **Study Time**: Extract number, validate 1-12 hours, convert to minutes
- **Strengths/Weaknesses**: Split by comma or newline, trim, filter empty
- **Exam Date**: Accept any text or "no"

### 2. InitialInteractionModal

**Props**:
```typescript
interface InitialInteractionModalProps {
  onComplete: () => void;
  onSkip?: () => void; // NEW: Allow skipping
}
```

**Key Features**:
- Fixed positioning with backdrop blur
- Smooth animations (framer-motion)
- Auto-scroll to latest message
- Typing indicator with 800ms delay
- Quick reply buttons with hover effects
- Progress indicator (step X of 10)
- Close/skip button in header

**Layout**:
```
┌─────────────────────────────────────┐
│ Header (gradient, icon, title)  [X]│
├─────────────────────────────────────┤
│ Progress: ●●●●○○○○○○ Step 4 of 10  │
├─────────────────────────────────────┤
│                                     │
│  Agent: What's your name?           │
│                                     │
│         User: John Doe              │
│                                     │
│  Agent: Nice to meet you, John!     │
│                                     │
├─────────────────────────────────────┤
│ Quick Replies: [Option 1] [Option 2]│
├─────────────────────────────────────┤
│ [Input field...............] [Send] │
└─────────────────────────────────────┘
```

### 3. Data Persistence Layer

**notionDB Integration**:

```typescript
// Save student profile
await notionDB.saveStudent({
  id: user.id,
  name: data.fullName,
  email: user.email,
  grade: data.grade,
  board: data.board,
  goals: [], // Saved separately
  currentPath: null,
  preferences: {
    language: data.preferredLanguage || 'en',
    subjects: data.subjects,
    studyTime: data.studyTimePerDay,
    examDate: data.examDate ? new Date(data.examDate) : undefined
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Save each goal separately
for (const goalText of data.goals) {
  await notionDB.saveGoal({
    id: `goal_${Date.now()}_${Math.random()}`,
    title: goalText,
    description: '',
    type: 'subject',
    priority: 'high',
    status: 'active',
    progress: 0,
    milestones: [],
    createdAt: new Date()
  }, user.id);
}
```

**Fallback Strategy**:
```typescript
try {
  await notionDB.saveStudent(profile);
  await saveGoals(goals);
} catch (error) {
  console.error('notionDB save failed, using localStorage fallback');
  localStorage.setItem(`student_${user.id}`, JSON.stringify(profile));
  localStorage.setItem(`goals_${user.id}`, JSON.stringify(goals));
}
```

### 4. ChatPanel Integration

**Personalized Welcome Message**:

```typescript
const getWelcomeMessage = () => {
  const userName = user?.name || 'there';
  const grade = user?.profile?.grade || '';
  const board = user?.profile?.board || '';
  
  let greeting = `Hi ${userName}! 👋 I'm your AI study assistant.`;
  
  if (grade && board) {
    greeting += `\n\nI see you're in ${grade} (${board} board). `;
  }
  
  greeting += `\n\nI can help you with:
✅ Understanding difficult concepts
✅ Solving problems step-by-step
✅ Creating study plans
✅ Answering questions about your courses

How can I help you today?`;
  
  return greeting;
};
```

### 5. useStore Updates

**Add to AppState interface**:
```typescript
interface AppState {
  // ... existing fields
  showOnboarding: boolean;
  completeOnboarding: (profile: StudentProfile) => Promise<void>;
}
```

**Implementation**:
```typescript
completeOnboarding: async (profile) => {
  const state = get();
  if (!state.user) return;

  try {
    await notionDB.init();
    await notionDB.saveStudent(profile);
    
    // Save goals
    for (const goalText of profile.goals) {
      await notionDB.saveGoal({
        id: `goal_${Date.now()}_${Math.random()}`,
        title: goalText,
        description: '',
        type: 'subject',
        priority: 'high',
        status: 'active',
        progress: 0,
        milestones: [],
        createdAt: new Date()
      }, state.user.id);
    }

    set((state) => ({
      user: state.user ? { ...state.user, profile } : null,
      showOnboarding: false,
    }));
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    // Fallback to localStorage
    set((state) => ({
      user: state.user ? { ...state.user, profile } : null,
      showOnboarding: false,
    }));
  }
}
```

## Data Models

### StudentDetails (GeneralInteractionAgent)

```typescript
interface StudentDetails {
  fullName: string;
  grade: string;
  board: 'CBSE' | 'ICSE' | 'State' | '';
  subjects: string[];
  goals: string[];
  studyTimePerDay: number; // minutes
  preferredLanguage: string;
  examDate?: string;
  strengths: string[];
  weaknesses: string[];
}
```

### StudentProfile (notionDB)

```typescript
interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: string;
  board: 'CBSE' | 'ICSE' | 'State';
  goals: LearningGoal[]; // Populated separately
  currentPath: LearningPath | null;
  preferences: {
    language: string;
    subjects: string[];
    studyTime: number;
    examDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### LearningGoal (notionDB)

```typescript
interface LearningGoal {
  id: string;
  title: string;
  description: string;
  type: 'exam' | 'skill' | 'subject' | 'career';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  milestones: Milestone[];
  createdAt: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Onboarding Trigger After First Login

*For any* user completing their first login (OAuth or manual), the system should set `showOnboarding` to `true` and display the InitialInteractionModal.

**Validates: Requirements 1.1, 1.2, 1.4**

### Property 2: No Onboarding for Returning Users

*For any* user who has already completed onboarding (profile exists), the system should set `showOnboarding` to `false` and not display the InitialInteractionModal on subsequent logins.

**Validates: Requirements 1.3**

### Property 3: Name Validation

*For any* input string during name collection, the GeneralInteractionAgent should accept it if and only if it contains at least 2 characters and consists only of letters and spaces.

**Validates: Requirements 2.2**

### Property 4: Grade Validation

*For any* input string during grade collection, the GeneralInteractionAgent should accept it if and only if it contains one of: 8, 9, 10, 11, 12, or "college" (case-insensitive).

**Validates: Requirements 2.3**

### Property 5: Board Validation

*For any* input string during board collection, the GeneralInteractionAgent should accept it if and only if it matches "CBSE", "ICSE", or "State" (case-insensitive or numeric selection 1-3).

**Validates: Requirements 2.4**

### Property 6: Subject Parsing

*For any* comma-separated string during subject collection, the GeneralInteractionAgent should parse it into an array of trimmed, non-empty strings and require at least one subject.

**Validates: Requirements 2.5**

### Property 7: Goal Parsing

*For any* comma or newline-separated string during goal collection, the GeneralInteractionAgent should parse it into an array of trimmed, non-empty strings and require at least one goal.

**Validates: Requirements 2.6**

### Property 8: Study Time Validation and Conversion

*For any* input string during study time collection, the GeneralInteractionAgent should extract a number, validate it is between 1 and 12, and convert it to minutes (multiply by 60).

**Validates: Requirements 2.7**

### Property 9: Confirmation Summary Completeness

*For any* completed data collection, the GeneralInteractionAgent should generate a summary that includes all collected fields: name, grade, board, subjects, goals, study time, strengths, weaknesses, and exam date (if provided).

**Validates: Requirements 2.11**

### Property 10: Conversation Reset on Rejection

*For any* user rejection at the confirmation step (input contains "no" or "start over"), the GeneralInteractionAgent should reset all collected data and restart from the greeting step.

**Validates: Requirements 2.13**

### Property 11: Data Persistence to notionDB

*For any* completed onboarding, the system should save a StudentProfile record to notionDB containing: id, name, email, grade, board, and preferences (language, subjects, studyTime, examDate).

**Validates: Requirements 4.1, 4.2**

### Property 12: Goal Record Creation

*For any* completed onboarding with N learning goals, the system should create exactly N separate LearningGoal records in notionDB, each with a unique ID and the goal text as the title.

**Validates: Requirements 4.3**

### Property 13: State Synchronization

*For any* successful save to notionDB, the system should update `useStore.user.profile` with the complete StudentProfile and set `showOnboarding` to `false`.

**Validates: Requirements 4.4, 1.5**

### Property 14: Fallback Persistence

*For any* notionDB save failure, the system should fall back to saving the StudentProfile and goals to localStorage using keys `student_${userId}` and `goals_${userId}`.

**Validates: Requirements 4.5**

### Property 15: Personalized Welcome Message

*For any* user with a completed profile, the ChatPanel should display a welcome message that includes the user's name, grade, and board information.

**Validates: Requirements 5.1, 5.2**

### Property 16: Modal Dismissal Without Data Loss

*For any* user action to close or skip the onboarding modal, the system should close the modal without saving partial data and maintain the `showOnboarding` flag as `true` for future logins.

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 17: Quick Reply Context Matching

*For any* conversation step, the GeneralInteractionAgent should return quick reply suggestions that are contextually appropriate for that step (e.g., grade options when asking for grade).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 18: Input Focus on Modal Open

*For any* InitialInteractionModal render, the input field should receive focus automatically, allowing immediate keyboard input.

**Validates: Requirements 13.1**

### Property 19: Enter Key Submission

*For any* Enter key press in the input field, the system should submit the current input text as the user's response.

**Validates: Requirements 13.2**

### Property 20: Progress Indicator Accuracy

*For any* conversation step, the progress indicator should display the correct step number out of 10 total steps (name=1, grade=2, board=3, subjects=4, goals=5, study_time=6, strengths=7, weaknesses=8, exam_date=9, confirmation=10).

**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

### Validation Errors

**Strategy**: Display inline error messages without advancing to the next step.

**Error Messages**:
- Invalid name: "Please enter a valid name (at least 2 characters, letters only)"
- Invalid grade: "Please specify your grade/class (e.g., 8, 9, 10, 11, 12, or College)"
- Invalid board: "Please choose from: 1. CBSE, 2. ICSE, 3. State Board"
- No subjects: "Please list at least one subject (separated by commas)"
- No goals: "Please share at least one learning goal"
- Invalid study time: "Please enter a realistic study time between 1 and 12 hours"
- No strengths: "Please share at least one strength"
- No weaknesses: "Please share at least one area you'd like to improve"

### Database Errors

**Strategy**: Catch exceptions, log errors, fall back to localStorage, and notify user.

```typescript
try {
  await notionDB.saveStudent(profile);
} catch (error) {
  console.error('Database save failed:', error);
  localStorage.setItem(`student_${user.id}`, JSON.stringify(profile));
  addNotification({
    type: 'alert',
    title: 'Offline Mode',
    message: 'Your profile was saved locally and will sync when online.'
  });
}
```

### Network Errors

**Strategy**: All data is stored locally in IndexedDB, so network errors don't block onboarding. Data will sync when connection is restored.

### TypeScript Errors

**Fix Required**: Add `'complete'` to `ConversationStep` type in GeneralInteractionAgent.ts.

## Testing Strategy

### Unit Tests

**Focus**: Specific validation logic, parsing functions, and error cases.

**Examples**:
- Test name validation with valid inputs: "John Doe", "Alice"
- Test name validation with invalid inputs: "A", "123", "John123"
- Test grade extraction from various formats: "10", "Class 10", "college"
- Test subject parsing: "Math, Physics, Chemistry" → ["Math", "Physics", "Chemistry"]
- Test study time conversion: "2 hours" → 120 minutes
- Test confirmation summary includes all fields
- Test reset clears all collected data

**Tools**: Jest, React Testing Library

### Property-Based Tests

**Focus**: Universal properties across all inputs.

**Configuration**: Minimum 100 iterations per test using fast-check or similar library.

**Examples**:
- **Property 3**: Generate random strings, verify name validation accepts only valid names
- **Property 6**: Generate random comma-separated strings, verify parsing produces correct arrays
- **Property 11**: Generate random StudentDetails, verify all fields are saved to notionDB
- **Property 15**: Generate random user profiles, verify welcome message includes name, grade, and board

**Tag Format**: `// Feature: post-login-user-onboarding, Property 3: Name Validation`

### Integration Tests

**Focus**: End-to-end onboarding flow, database persistence, UI interactions.

**Examples**:
- Complete full onboarding flow from start to finish
- Test skip/close button closes modal without saving
- Test data persists after page reload
- Test personalized welcome message appears in ChatPanel after onboarding
- Test onboarding doesn't show for returning users

**Tools**: Playwright or Cypress for E2E tests

### Accessibility Tests

**Focus**: Keyboard navigation, focus management, screen reader compatibility.

**Examples**:
- Test Tab key navigates through quick reply buttons
- Test Enter key submits input
- Test focus trap keeps focus within modal
- Test ARIA labels are present and correct

**Tools**: axe-core, jest-axe

## Implementation Notes

### Styling Guidelines

- Use Tailwind CSS classes matching existing Coursera-inspired design
- Colors: teal-500, indigo-500 for accents; gray-50, gray-100 for backgrounds
- Rounded corners: rounded-2xl for modal, rounded-xl for inputs/buttons
- Shadows: shadow-sm for subtle depth, shadow-2xl for modal
- Animations: Use framer-motion for smooth transitions (fade, slide, scale)

### Performance Considerations

- Debounce input validation to avoid excessive re-renders
- Use React.memo for message components to prevent unnecessary re-renders
- Lazy load InitialInteractionModal only when showOnboarding is true
- Batch database writes (save profile and goals in a transaction if possible)

### Accessibility Considerations

- Add ARIA labels to all interactive elements
- Ensure color contrast meets WCAG AA standards
- Provide keyboard shortcuts (Enter to submit, Esc to close)
- Announce step changes to screen readers
- Use semantic HTML (form, button, input)

### Future Enhancements

- Add ability to edit profile after onboarding
- Support multiple languages for onboarding conversation
- Add profile completion percentage in settings
- Allow users to add/remove goals after onboarding
- Implement profile photo upload during onboarding
- Add onboarding analytics (time to complete, drop-off points)
