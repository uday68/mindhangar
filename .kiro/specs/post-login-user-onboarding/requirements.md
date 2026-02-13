# Requirements Document: Post-Login User Onboarding

## Introduction

This feature implements an AI-powered conversational onboarding flow that collects essential student details after login. The system uses the existing GeneralInteractionAgent to guide users through a personalized data collection process, storing information in IndexedDB and utilizing it throughout the application to personalize the learning experience.

## Glossary

- **System**: The MindHangar post-login onboarding feature
- **User**: A student who has successfully logged in via OAuth or manual authentication
- **GeneralInteractionAgent**: The AI conversational agent that conducts the onboarding interview
- **InitialInteractionModal**: The UI component that displays the onboarding conversation
- **Student_Profile**: The collection of user data including name, grade, board, subjects, goals, and preferences
- **notionDB**: The IndexedDB database service for persisting student data
- **useStore**: The Zustand state management store
- **ChatPanel**: The main chat interface that displays personalized welcome messages
- **OAuth**: Google/GitHub authentication providers
- **Manual_Auth**: Email/password authentication method

## Requirements

### Requirement 1: Trigger Onboarding After Login

**User Story:** As a new user, I want the onboarding flow to start automatically after I log in, so that I can quickly set up my profile without extra steps.

#### Acceptance Criteria

1. WHEN a user completes OAuth authentication (Google or GitHub), THE System SHALL automatically display the InitialInteractionModal
2. WHEN a user completes manual email/password authentication, THE System SHALL automatically display the InitialInteractionModal
3. WHEN a user has already completed onboarding, THE System SHALL NOT display the InitialInteractionModal on subsequent logins
4. THE System SHALL set the showOnboarding flag to true after successful first-time login
5. THE System SHALL set the showOnboarding flag to false after onboarding completion

### Requirement 2: AI Conversational Data Collection

**User Story:** As a user, I want to provide my information through a natural conversation, so that the onboarding process feels engaging and personalized.

#### Acceptance Criteria

1. WHEN the onboarding starts, THE GeneralInteractionAgent SHALL greet the user by name if available
2. WHEN collecting full name, THE GeneralInteractionAgent SHALL validate that input contains at least 2 characters and only letters and spaces
3. WHEN collecting grade, THE GeneralInteractionAgent SHALL accept values: 8, 9, 10, 11, 12, or College
4. WHEN collecting educational board, THE GeneralInteractionAgent SHALL accept: CBSE, ICSE, or State Board
5. WHEN collecting subjects, THE GeneralInteractionAgent SHALL parse comma-separated values and require at least one subject
6. WHEN collecting learning goals, THE GeneralInteractionAgent SHALL parse comma or newline-separated values and require at least one goal
7. WHEN collecting study time, THE GeneralInteractionAgent SHALL validate input is between 1 and 12 hours and convert to minutes
8. WHEN collecting strengths, THE GeneralInteractionAgent SHALL parse comma or newline-separated values and require at least one strength
9. WHEN collecting weaknesses, THE GeneralInteractionAgent SHALL parse comma or newline-separated values and require at least one weakness
10. WHEN collecting exam date, THE GeneralInteractionAgent SHALL accept any text input or allow user to skip with "no"
11. WHEN all data is collected, THE GeneralInteractionAgent SHALL display a summary and request confirmation
12. WHEN user confirms data, THE GeneralInteractionAgent SHALL mark the conversation as complete
13. WHEN user rejects confirmation, THE GeneralInteractionAgent SHALL restart the conversation from the beginning

### Requirement 3: Quick Reply Suggestions

**User Story:** As a user, I want to see suggested responses for common questions, so that I can complete onboarding faster.

#### Acceptance Criteria

1. WHEN asking for grade, THE System SHALL display quick reply buttons: "Class 10", "Class 11", "Class 12", "College"
2. WHEN asking for board, THE System SHALL display quick reply buttons: "CBSE", "ICSE", "State Board"
3. WHEN asking for study time, THE System SHALL display quick reply buttons: "1 hour", "2 hours", "3 hours", "4 hours"
4. WHEN asking for exam date, THE System SHALL display quick reply buttons: "March 2026", "May 2026", "No upcoming exams"
5. WHEN asking for confirmation, THE System SHALL display quick reply buttons: "Yes, correct!", "No, start over"
6. WHEN user clicks a quick reply button, THE System SHALL submit that text as the user's response

### Requirement 4: Data Persistence

**User Story:** As a user, I want my onboarding data to be saved permanently, so that I don't have to re-enter it on future visits.

#### Acceptance Criteria

1. WHEN onboarding is complete, THE System SHALL save the Student_Profile to notionDB
2. WHEN saving to notionDB, THE System SHALL store: id, name, email, grade, board, preferences (language, subjects, studyTime, examDate), createdAt, updatedAt
3. WHEN saving goals, THE System SHALL create separate goal records in notionDB for each learning goal
4. WHEN saving to notionDB, THE System SHALL update the user record in useStore with the complete profile
5. WHEN notionDB save fails, THE System SHALL fall back to localStorage persistence
6. WHEN user logs in on a different device, THE System SHALL retrieve the Student_Profile from notionDB
7. THE System SHALL persist data across browser sessions

### Requirement 5: Data Utilization in UI

**User Story:** As a user, I want to see my profile information throughout the app, so that I know the system understands my needs.

#### Acceptance Criteria

1. WHEN ChatPanel loads, THE System SHALL display a personalized welcome message including the user's name
2. WHEN ChatPanel displays the welcome message, THE System SHALL include the user's grade and board information
3. WHEN user opens their profile, THE System SHALL display: full name, grade, board, subjects, goals, study time, strengths, weaknesses, and exam date
4. WHEN AI generates course recommendations, THE System SHALL use the user's subjects and goals as context
5. WHEN Dashboard loads, THE System SHALL display progress toward the user's stated goals
6. WHEN AI responds to queries, THE System SHALL include user profile context for personalized responses

### Requirement 6: Non-Blocking User Experience

**User Story:** As a user, I want the option to skip onboarding and complete it later, so that I can explore the app immediately if I'm in a hurry.

#### Acceptance Criteria

1. THE InitialInteractionModal SHALL display a "Skip for now" or close button
2. WHEN user clicks skip or close, THE System SHALL close the modal without saving partial data
3. WHEN user skips onboarding, THE System SHALL set a flag indicating onboarding is incomplete
4. WHEN user with incomplete onboarding logs in again, THE System SHALL display the InitialInteractionModal
5. THE System SHALL allow users to access the main application even with incomplete onboarding
6. WHEN user completes onboarding later, THE System SHALL save all data normally

### Requirement 7: Progress Indication

**User Story:** As a user, I want to see how many steps remain in onboarding, so that I know how much time it will take.

#### Acceptance Criteria

1. THE InitialInteractionModal SHALL display a progress indicator showing current step and total steps
2. WHEN user completes each question, THE System SHALL update the progress indicator
3. THE System SHALL display step labels: Name, Grade, Board, Subjects, Goals, Study Time, Strengths, Weaknesses, Exam Date, Confirmation
4. THE progress indicator SHALL use visual elements (progress bar or step dots) to show completion
5. THE System SHALL display "Step X of 10" text alongside visual progress

### Requirement 8: Input Validation and Error Handling

**User Story:** As a user, I want clear feedback when my input is invalid, so that I can correct it and proceed.

#### Acceptance Criteria

1. WHEN user enters invalid name (less than 2 characters or non-letters), THE System SHALL display error message: "Please enter a valid name (at least 2 characters, letters only)"
2. WHEN user enters invalid grade, THE System SHALL display error message: "Please specify your grade/class (e.g., 8, 9, 10, 11, 12, or College)"
3. WHEN user enters invalid board, THE System SHALL display error message with valid options
4. WHEN user enters no subjects, THE System SHALL display error message: "Please list at least one subject (separated by commas)"
5. WHEN user enters no goals, THE System SHALL display error message: "Please share at least one learning goal"
6. WHEN user enters invalid study time, THE System SHALL display error message: "Please enter a realistic study time between 1 and 12 hours"
7. WHEN user enters no strengths, THE System SHALL display error message: "Please share at least one strength"
8. WHEN user enters no weaknesses, THE System SHALL display error message: "Please share at least one area you'd like to improve"
9. THE System SHALL not advance to the next question until valid input is provided

### Requirement 9: Bug Fixes

**User Story:** As a developer, I want all TypeScript errors resolved, so that the application compiles and runs without issues.

#### Acceptance Criteria

1. THE System SHALL fix the TypeScript error in GeneralInteractionAgent where 'confirmation' and 'complete' types are compared
2. THE System SHALL ensure ConversationStep type includes 'complete' as a valid value
3. THE System SHALL ensure InitialInteractionModal does not block the login flow
4. THE System SHALL ensure the modal can be dismissed without breaking the application
5. THE System SHALL compile without TypeScript errors in all onboarding-related files

### Requirement 10: Styling Consistency

**User Story:** As a user, I want the onboarding modal to match the app's design, so that the experience feels cohesive and professional.

#### Acceptance Criteria

1. THE InitialInteractionModal SHALL use white backgrounds with subtle shadows
2. THE InitialInteractionModal SHALL use teal and indigo accent colors matching the Coursera-inspired design
3. THE InitialInteractionModal SHALL use rounded corners (rounded-2xl) for the modal container
4. THE InitialInteractionModal SHALL use smooth animations for message appearance (fade and slide)
5. THE InitialInteractionModal SHALL use professional typography with appropriate font sizes and weights
6. THE user message bubbles SHALL use teal-500 background with white text
7. THE agent message bubbles SHALL use white background with gray-800 text and subtle borders
8. THE quick reply buttons SHALL use gray-100 background with hover effects transitioning to teal-50
9. THE input field SHALL use gray-50 background with teal-500 focus ring
10. THE header SHALL use gradient background from teal-500 to indigo-500

### Requirement 11: Typing Indicators and Animations

**User Story:** As a user, I want to see when the AI is "thinking", so that I know the system is processing my response.

#### Acceptance Criteria

1. WHEN user submits a response, THE System SHALL display a typing indicator with animated dots
2. THE typing indicator SHALL use three bouncing dots with staggered animation delays
3. THE System SHALL display the typing indicator for at least 800ms before showing the response
4. WHEN agent response is ready, THE System SHALL remove the typing indicator and display the message
5. THE System SHALL animate new messages with fade-in and slide-up effects

### Requirement 12: Data Editing Before Confirmation

**User Story:** As a user, I want to review and edit my answers before final submission, so that I can correct any mistakes.

#### Acceptance Criteria

1. WHEN displaying the confirmation summary, THE System SHALL show all collected data in a formatted list
2. THE confirmation summary SHALL include: Name, Grade, Board, Subjects, Goals, Study Time, Strengths, Weaknesses, and Exam Date (if provided)
3. WHEN user types "no" or "start over" at confirmation, THE System SHALL reset all collected data
4. WHEN user resets, THE System SHALL restart the conversation from the greeting
5. THE System SHALL preserve the conversation history in the UI even after reset

### Requirement 13: Accessibility and Keyboard Navigation

**User Story:** As a user, I want to complete onboarding using only my keyboard, so that the experience is accessible.

#### Acceptance Criteria

1. WHEN modal is open, THE System SHALL focus the input field automatically
2. WHEN user presses Enter in the input field, THE System SHALL submit the response
3. WHEN quick reply buttons are displayed, THE System SHALL allow Tab navigation between them
4. WHEN user presses Enter on a focused quick reply button, THE System SHALL submit that response
5. THE System SHALL maintain focus within the modal (focus trap) while it is open
