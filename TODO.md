# TODO: Implement Coursera-like YouTube Course Platform

## 1. Database Schema Updates
- [ ] Read current `src/db/schema.ts` to understand existing structure
- [ ] Add `courses` table (id, title, description, level, user_id, created_at)
- [ ] Add `course_videos` table (id, course_id, video_id, order, title, duration)
- [ ] Add `user_progress` table (id, user_id, course_id, video_id, completed, completed_at)
- [ ] Add `quizzes` table (id, course_id, questions_json, created_at)
- [ ] Add `quiz_attempts` table (id, user_id, quiz_id, score, answers_json, attempted_at)
- [ ] Run `npm run db:generate` and `npm run db:migrate` to apply changes

## 2. Backend Services
- [ ] Create `services/youtubeService.ts` for YouTube Data API integration (search videos, fetch details, transcripts)
- [ ] Extend `services/geminiService.ts` to add quiz generation from transcripts and web case studies
- [ ] Add course creation logic in a new service or extend existing ones

## 3. Store Updates
- [ ] Update `store/useStore.ts` to add course-related state (courses, progress, current course, etc.)
- [ ] Add actions for creating courses, updating progress, fetching quizzes

## 4. Frontend Components
- [ ] Extend `components/Panels/VideoPanel.tsx` to add "Create Course" mode and video collection
- [ ] Create `components/Panels/CourseDashboard.tsx` for course overview, progress tracking, level selection
- [ ] Create `components/Panels/QuizPanel.tsx` for AI-generated quizzes
- [ ] Update UI to Coursera-like design with progress bars, playlists, certificates

## 5. User Interaction Flow
- [ ] Implement user assessment for interests/level (perhaps in a new onboarding step)
- [ ] Add resource suggestion system categorized by levels (Beginner → Intermediate → Advanced → Research)
- [ ] Enable course creation from collected videos
- [ ] Implement level progression with prerequisites

## 6. AI Integration
- [ ] Integrate quiz generation using Gemini on video transcripts
- [ ] Add web scraping or API calls for case studies to enhance quizzes

## 7. Dependencies and Setup
- [ ] Update `package.json` to add required dependencies (e.g., youtube-transcript, googleapis for YouTube API)
- [ ] Set up environment variables for YouTube API key

## 8. Testing and Integration
- [ ] Test course creation and video collection
- [ ] Test progress tracking and level progression
- [ ] Test AI quiz generation
- [ ] Test YouTube API integration
- [ ] Ensure responsive UI and Coursera-like UX
