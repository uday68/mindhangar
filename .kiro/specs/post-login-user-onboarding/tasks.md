# Implementation Plan: Post-Login User Onboarding

## Overview

This implementation plan breaks down the post-login user onboarding feature into discrete coding tasks. The approach follows a bottom-up strategy: fix bugs first, then enhance core components, add UI features, integrate with state management, and finally wire everything together with comprehensive testing.

## Tasks

- [x] 1. Fix TypeScript errors in GeneralInteractionAgent
  - Fix the ConversationStep type to include 'complete' as a valid value
  - Ensure the comparison `this.state.currentStep === 'complete'` compiles without errors
  - Verify all type definitions are correct
  - _Requirements: 9.1, 9.2_

- [x] 2. Enhance GeneralInteractionAgent with improved validation
  - [x] 2.1 Implement robust name validation
    - Update handleName() to use regex `/^[a-zA-Z\s]+$/` and length check >= 2
    - Return clear error message for invalid inputs
    - _Requirements: 2.2, 8.1_
  
  - [x] 2.2 Implement grade validation with flexible parsing
    - Update handleGrade() to accept "8", "9", "10", "11", "12", "college", "graduation"
    - Handle various input formats (e.g., "Class 10", "10th", "college")
    - _Requirements: 2.3, 8.2_
  
  - [x] 2.3 Implement board validation with numeric options
    - Update handleBoard() to accept "1", "2", "3" or text "CBSE", "ICSE", "State"
    - Case-insensitive matching
    - _Requirements: 2.4, 8.3_
  
  - [x] 2.4 Implement subject parsing with validation
    - Update handleSubjects() to split by comma, trim, and filter empty strings
    - Require at least one subject
    - _Requirements: 2.5, 8.4_
  
  - [x] 2.5 Implement goal parsing with multiple separators
    - Update handleGoals() to split by comma or newline
    - Trim and filter empty strings
    - Require at least one goal
    - _Requirements: 2.6, 8.5_
  
  - [x] 2.6 Implement study time validation and conversion
    - Update handleStudyTime() to extract number from input
    - Validate range 1-12 hours
    - Convert to minutes (multiply by 60)
    - _Requirements: 2.7, 8.6_
  
  - [x] 2.7 Implement strengths and weaknesses parsing
    - Update handleStrengths() and handleWeaknesses() to split by comma or newline
    - Trim and filter empty strings
    - Require at least one entry for each
    - _Requirements: 2.8, 2.9, 8.7, 8.8_
  
  - [x] 2.8 Implement exam date flexible input
    - Update handleExamDate() to accept any text or "no"/"not applicable"
    - Store as optional field
    - _Requirements: 2.10_
  
  - [ ]* 2.9 Write property test for name validation
    - **Property 3: Name Validation**
    - **Validates: Requirements 2.2**
  
  - [ ]* 2.10 Write property test for grade validation
    - **Property 4: Grade Validation**
    - **Validates: Requirements 2.3**
  
  - [ ]* 2.11 Write property test for subject parsing
    - **Property 6: Subject Parsing**
    - **Validates: Requirements 2.5**

- [x] 3. Update InitialInteractionModal with enhanced UX
  - [x] 3.1 Add skip/close functionality
    - Add close button (X) in modal header
    - Add "Skip for now" button in footer
    - Implement onSkip callback that closes modal without saving
    - Maintain showOnboarding flag as true when skipped
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 3.2 Add progress indicator
    - Create progress bar component showing current step / 10 total steps
    - Map conversation steps to step numbers (name=1, grade=2, etc.)
    - Display "Step X of 10" text
    - Update progress as user advances through conversation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 3.3 Implement typing indicator with delay
    - Add isTyping state
    - Display animated dots (three bouncing dots with staggered delays)
    - Show typing indicator for 800ms before displaying agent response
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 3.4 Add smooth message animations
    - Use framer-motion for fade-in and slide-up effects on new messages
    - Animate quick reply buttons appearance
    - Add exit animations when messages scroll out of view
    - _Requirements: 11.5_
  
  - [x] 3.5 Implement auto-focus on input field
    - Use useEffect to focus input field when modal opens
    - Maintain focus after each message submission
    - _Requirements: 13.1_
  
  - [x] 3.6 Add Enter key submission
    - Handle Enter key press in input field to submit response
    - Prevent default form submission behavior
    - _Requirements: 13.2_
  
  - [ ]* 3.7 Write property test for modal dismissal
    - **Property 16: Modal Dismissal Without Data Loss**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  
  - [ ]* 3.8 Write unit tests for progress indicator
    - Test step number calculation for each conversation step
    - Test progress bar percentage calculation
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 4. Implement data persistence layer
  - [x] 4.1 Create saveStudentProfile function
    - Initialize notionDB
    - Map StudentDetails to StudentProfile format
    - Call notionDB.saveStudent() with complete profile
    - Handle Date conversion for examDate
    - _Requirements: 4.1, 4.2_
  
  - [x] 4.2 Create saveGoals function
    - Iterate through goals array
    - Create LearningGoal record for each goal
    - Generate unique IDs using timestamp and random
    - Call notionDB.saveGoal() for each goal
    - _Requirements: 4.3_
  
  - [x] 4.3 Implement fallback to localStorage
    - Wrap notionDB calls in try-catch
    - On error, save to localStorage with keys `student_${userId}` and `goals_${userId}`
    - Log error to console
    - Add notification to user about offline mode
    - _Requirements: 4.5_
  
  - [x] 4.4 Implement data retrieval on login
    - Check notionDB for existing StudentProfile on login
    - If found, set showOnboarding to false
    - If not found, set showOnboarding to true
    - _Requirements: 4.6, 1.3_
  
  - [ ]* 4.5 Write property test for data persistence
    - **Property 11: Data Persistence to notionDB**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 4.6 Write property test for goal record creation
    - **Property 12: Goal Record Creation**
    - **Validates: Requirements 4.3**
  
  - [ ]* 4.7 Write property test for fallback persistence
    - **Property 14: Fallback Persistence**
    - **Validates: Requirements 4.5**

- [x] 5. Update useStore with onboarding state management
  - [x] 5.1 Add showOnboarding flag to AppState
    - Add showOnboarding: boolean to AppState interface
    - Initialize to false
    - Update on login based on profile existence
    - _Requirements: 1.4, 1.5_
  
  - [x] 5.2 Implement completeOnboarding action
    - Create async function that accepts StudentProfile
    - Call notionDB.saveStudent() and notionDB.saveGoal()
    - Update user.profile in state
    - Set showOnboarding to false
    - Handle errors with fallback to localStorage
    - _Requirements: 4.4, 1.5_
  
  - [x] 5.3 Update login action to check for existing profile
    - After successful login, query notionDB for StudentProfile
    - If profile exists, set showOnboarding to false
    - If profile doesn't exist, set showOnboarding to true
    - _Requirements: 1.3, 4.6_
  
  - [ ]* 5.4 Write property test for state synchronization
    - **Property 13: State Synchronization**
    - **Validates: Requirements 4.4, 1.5**
  
  - [ ]* 5.5 Write property test for onboarding trigger
    - **Property 1: Onboarding Trigger After First Login**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [x] 6. Update ChatPanel with personalized welcome message
  - [x] 6.1 Implement getWelcomeMessage function
    - Access user.name, user.profile.grade, user.profile.board from useStore
    - Construct personalized greeting including name
    - Add grade and board information if available
    - Include standard AI assistant capabilities list
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.2 Update ChatPanel to use personalized welcome
    - Replace static welcome message with getWelcomeMessage()
    - Re-render when user.profile changes
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 6.3 Write property test for personalized welcome message
    - **Property 15: Personalized Welcome Message**
    - **Validates: Requirements 5.1, 5.2**

- [x] 7. Integrate InitialInteractionModal into App.tsx
  - [x] 7.1 Add conditional rendering based on showOnboarding flag
    - Import InitialInteractionModal
    - Render modal when showOnboarding is true and user is authenticated
    - Pass onComplete callback that calls useStore.completeOnboarding
    - Pass onSkip callback that closes modal without saving
    - _Requirements: 1.1, 1.2, 6.1_
  
  - [x] 7.2 Ensure modal doesn't block login flow
    - Verify modal renders after LoginScreen completes
    - Ensure modal is positioned above other content (z-index)
    - Test that closing modal allows access to main app
    - _Requirements: 9.3, 9.4_
  
  - [ ]* 7.3 Write integration test for full onboarding flow
    - Test complete flow from login to onboarding completion
    - Verify data is saved to notionDB
    - Verify showOnboarding flag is set to false
    - Verify personalized welcome message appears in ChatPanel
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

- [x] 8. Implement accessibility features
  - [x] 8.1 Add ARIA labels to all interactive elements
    - Add aria-label to input field
    - Add aria-label to send button
    - Add aria-label to quick reply buttons
    - Add aria-label to close/skip button
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 8.2 Implement focus trap within modal
    - Use focus-trap-react or custom implementation
    - Ensure Tab key cycles through modal elements only
    - Ensure Shift+Tab works in reverse
    - _Requirements: 13.5_
  
  - [x] 8.3 Add keyboard navigation for quick reply buttons
    - Allow Tab key to navigate between quick reply buttons
    - Allow Enter key to select focused button
    - Highlight focused button with visible outline
    - _Requirements: 13.3, 13.4_
  
  - [ ]* 8.4 Write accessibility tests
    - Test keyboard navigation with Tab and Enter keys
    - Test focus trap keeps focus within modal
    - Test ARIA labels are present and correct
    - Use jest-axe to check for accessibility violations
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 9. Add styling and animations
  - [x] 9.1 Apply Coursera-inspired design tokens
    - Use teal-500 and indigo-500 for accent colors
    - Use gray-50 and gray-100 for backgrounds
    - Use rounded-2xl for modal container
    - Use rounded-xl for inputs and buttons
    - Use shadow-sm for subtle depth, shadow-2xl for modal
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_
  
  - [x] 9.2 Implement smooth animations with framer-motion
    - Add fade-in animation for modal appearance
    - Add slide-up animation for new messages
    - Add bounce animation for typing indicator dots
    - Add hover effects for quick reply buttons
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10. Final integration and testing
  - [x] 10.1 Test complete onboarding flow end-to-end
    - Test OAuth login → onboarding → data save → personalized welcome
    - Test manual login → onboarding → data save → personalized welcome
    - Test skip onboarding → modal closes → onboarding shows on next login
    - Test returning user → no onboarding modal
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 10.2 Test data persistence across sessions
    - Complete onboarding, close browser, reopen
    - Verify profile data is still present
    - Verify onboarding doesn't show again
    - _Requirements: 4.7_
  
  - [x] 10.3 Test error handling and fallback scenarios
    - Simulate notionDB failure, verify localStorage fallback
    - Simulate network error, verify graceful handling
    - Test invalid inputs, verify error messages display
    - _Requirements: 4.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ]* 10.4 Write property tests for remaining properties
    - **Property 7: Goal Parsing**
    - **Property 8: Study Time Validation and Conversion**
    - **Property 9: Confirmation Summary Completeness**
    - **Property 10: Conversation Reset on Rejection**
    - **Property 17: Quick Reply Context Matching**
    - **Property 18: Input Focus on Modal Open**
    - **Property 19: Enter Key Submission**
    - **Property 20: Progress Indicator Accuracy**
    - **Validates: Requirements 2.6, 2.7, 2.11, 2.13, 3.1-3.5, 13.1, 13.2, 7.1-7.3**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- Accessibility tests ensure keyboard navigation and screen reader compatibility
- All TypeScript errors must be resolved before proceeding to implementation
- Use vitest for unit and property tests, Playwright or Cypress for E2E tests
- Configure property tests to run minimum 100 iterations
- Tag each property test with: `// Feature: post-login-user-onboarding, Property N: [Property Title]`
