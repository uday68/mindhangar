# MindHangar — Interactive Student Workspace

**MindHangar** is a next-generation, AI-powered productivity workspace designed specifically for students and lifelong learners. It unifies planning, note-taking, video learning, and cognitive training into a single, distraction-free interface.

Built with **React**, **TypeScript**, and **Google Gemini API**, it leverages Large Language Models to act as a personalized academic coach.

---

## 🚀 Key Features & Implementation

### 1. Unified Spatial Workspace
**Concept:** Reduce cognitive load by eliminating tab-switching.
*   **Implementation:** Uses `react-rnd` for a window-manager-like experience on the web. Panels (Notes, Video, Planner) can be dragged, resized, and layered.
*   **Layouts:** Includes presets like *Studio* (Balanced), *Cinema* (Video-focused), and *Research* (Split-screen) to instantly adapt the environment to the task.

### 2. AI-Powered Planner & Roadmap Designer
**Concept:** Break down vague goals into actionable steps using AI decomposition.
*   **Implementation:**
    *   **Schedule:** Generates 3-day study schedules based on user goals via Gemini.
    *   **Curriculum Designer:** Creates full semester-length roadmaps (Weeks, Topics, Resources) based on a learning goal and time commitment.
    *   **Tech:** Uses structured JSON generation from Gemini to render interactive timelines.

### 3. Video Studio with AI Summarization
**Concept:** Turn passive watching into active learning.
*   **Implementation:**
    *   Embeds YouTube videos directly in the workspace.
    *   **AI Summarization:** Takes transcript text and uses LLMs to extract key insights and actionable bullet points.
    *   **Focus Guard:** Automatically warns or restricts entertainment content during active Focus Sessions.

### 4. Smart Notes (Block-Based Editor)
**Concept:** Atomic note-taking inspired by Notion.
*   **Implementation:**
    *   Data stored as granular "Blocks" (Text, Heading, Todo, Bullet) in a normalized state store (`zustand`).
    *   Allows seamless mixing of text and future rich-media types.

### 5. Cognitive Training (Quiz & Flashcards)
**Concept:** **Active Recall** and **Spaced Repetition**.
*   **Implementation:**
    *   **Quiz Generator:** Instantly creates multiple-choice questions from a topic using AI to test understanding.
    *   **Flashcards:** Generates front/back study cards. Includes a 3D flip animation and keyboard navigation.
    *   **AI Coach:** Analyzes quiz results. If a user fails, the AI diagnoses the specific misconception and suggests a recovery strategy.

### 6. Deep Focus Monitor
**Concept:** **Pomodoro Technique** + **Flow State** maintenance.
*   **Implementation:**
    *   **Readiness Test:** A reaction-time game before sessions to gauge alertness.
    *   **Session Timer:** Customizable Focus/Break intervals.
    *   **Visual Tracking:** Optional camera integration uses browser APIs to simulate attention tracking (privacy-focused, local only).
    *   **Lock Mode:** UI restrictions during deep work to prevent opening unrelated panels.

### 7. Gamification & Analytics
**Concept:** Dopamine-driven motivation.
*   **Implementation:**
    *   XP (Experience Points) awarded for completing sessions, quizzes, and tasks.
    *   Leveling system displayed in the sidebar.
    *   Streak tracking to encourage consistency.

---

## 🛠️ Technical Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS (Glassmorphism design language)
*   **State Management:** Zustand (with LocalStorage persistence)
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
*   **Motion:** CSS Transitions + React RND
*   **Icons:** Lucide-react (custom SVG implementation)

---

## 📦 Installation & Usage

### Prerequisites
*   Node.js (v18+)
*   Google Gemini API Key (Get one at [aistudio.google.com](https://aistudio.google.com))

### Setup
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

### Configuration
1.  Open the app in your browser.
2.  Complete the **Onboarding Flow** to set your academic profile.
3.  Click the **Settings** (Gear icon) in the sidebar.
4.  Paste your **Gemini API Key** into the configuration field. This is required for Chat, Quiz, and Planner features.

---

## 📚 Learning Science Principles

MindHangar is built on proven educational psychology frameworks:

1.  **Active Recall:** The Quiz Panel forces users to retrieve information rather than passively re-reading.
    *   *Study:* Roediger, H. L., & Karpicke, J. D. (2006). The power of testing memory: Basic research and implications for educational practice.
2.  **Spaced Repetition:** The roadmap and flashcards encourage spacing reviews over time.
    *   *Study:* Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis.
3.  **Metacognition:** The "AI Coach" reflection step after quizzes asks users to identify *why* they were confused, enhancing self-awareness.
    *   *Study:* Flavell, J. H. (1979). Metacognition and cognitive monitoring: A new area of cognitive-developmental inquiry.
4.  **Flow Theory:** The unified workspace minimizes context switching to maintain deep focus.
    *   *Study:* Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience.

---

*Built for the future of learning.*