
# MindHangar — Interactive Student Workspace

![MindHangar Hero](https://placehold.co/1200x600/0d9488/ffffff?text=MindHangar+Dashboard+Preview&font=montserrat)

**MindHangar** is a next-generation, AI-powered productivity workspace designed specifically for students and lifelong learners. It unifies planning, note-taking, video learning, and cognitive training into a single, distraction-free interface.

Built with **React**, **TypeScript**, and **Google Gemini API**, it leverages Large Language Models to act as a personalized academic coach.

---

## 🚀 Key Features & Implementation

### 1. Unified Spatial Workspace
**Concept:** Reduce cognitive load by eliminating tab-switching.

![Spatial Workspace Layout](https://placehold.co/800x400/f1f5f9/334155?text=Unified+Spatial+Interface&font=roboto)
*Above: The "Studio" layout. Users can drag, resize, and layer panels (Planner, Notes, Video) like a desktop operating system. This spatial arrangement allows students to watch a lecture, take notes, and check their schedule simultaneously without losing context.*

*   **Implementation:** Uses `react-rnd` for a window-manager-like experience on the web.
*   **Layouts:** Includes presets like *Studio* (Balanced), *Cinema* (Video-focused), and *Research* (Split-screen) to instantly adapt the environment to the task.

### 2. AI-Powered Planner & Roadmap Designer
**Concept:** Break down vague goals into actionable steps using AI decomposition.

![AI Curriculum Designer](https://placehold.co/800x400/f1f5f9/334155?text=AI+Generated+Roadmap&font=roboto)
*Above: The Roadmap Generator. A user inputs a goal (e.g., "Learn Machine Learning"), and the AI constructs a week-by-week curriculum complete with specific video and reading resources, tracking progress visually.*

*   **Implementation:**
    *   **Schedule:** Generates 3-day study schedules based on user goals via Gemini.
    *   **Curriculum Designer:** Creates full semester-length roadmaps (Weeks, Topics, Resources).
    *   **Tech:** Uses structured JSON generation from Gemini to render interactive timelines.

### 3. Video Studio with AI Summarization
**Concept:** Turn passive watching into active learning.

![Video Studio](https://placehold.co/800x400/f1f5f9/334155?text=Video+Player+%2B+AI+Summary&font=roboto)
*Above: The Video Panel. YouTube videos play on the left while the AI generates a "Key Insights" summary on the right. Students can copy these insights directly into their notes.*

*   **Implementation:**
    *   Embeds YouTube videos directly in the workspace.
    *   **AI Summarization:** Takes transcript text and uses LLMs to extract actionable bullet points.
    *   **Focus Guard:** Automatically warns or restricts entertainment content during active Focus Sessions.

### 4. Smart Notes (Block-Based Editor)
**Concept:** Atomic note-taking inspired by Notion.

![Block Editor](https://placehold.co/800x400/f1f5f9/334155?text=Block-Based+Note+Editor&font=roboto)
*Above: The Notes Panel. Content is structured as "blocks" (headings, todos, bullets), allowing for easy rearrangement. The editor supports slash commands and seamless organization of thoughts.*

*   **Implementation:**
    *   Data stored as granular "Blocks" in a normalized state store (`zustand`).
    *   Allows seamless mixing of text and future rich-media types.

### 5. Cognitive Training (Quiz & Flashcards)
**Concept:** **Active Recall** and **Spaced Repetition**.

![Quiz Generator](https://placehold.co/800x400/f1f5f9/334155?text=AI+Quiz+Generator&font=roboto)
*Above: The Quiz Panel. The AI generates multiple-choice questions based on a specific topic. After the quiz, the "AI Coach" provides a detailed analysis of why the user got a question wrong.*

*   **Implementation:**
    *   **Quiz Generator:** Instantly creates questions to test understanding.
    *   **Flashcards:** Generates front/back study cards with 3D flip animations.
    *   **AI Coach:** Diagnoses misconceptions and suggests recovery strategies.

### 6. Deep Focus Monitor
**Concept:** **Pomodoro Technique** + **Flow State** maintenance.

![Focus Calibration](https://placehold.co/800x400/f1f5f9/334155?text=Focus+Readiness+Test&font=roboto)
*Above: The Focus Calibration test. Before starting a deep work session, the user performs a reaction-time test to gauge alertness. The session timer then locks the UI to prevent distractions.*

*   **Implementation:**
    *   **Readiness Test:** A reaction-time game to gauge alertness.
    *   **Visual Tracking:** Optional camera integration simulates attention tracking (privacy-focused, local only).
    *   **Lock Mode:** UI restrictions during deep work to prevent opening unrelated panels.

### 7. Mobile Companion Pairing
**Concept:** Second-screen experience for distraction blocking and notifications.

![Mobile Pairing](https://placehold.co/800x400/f1f5f9/334155?text=QR+Code+Mobile+Pairing&font=roboto)
*Above: The Onboarding Scanner. Users scan a secure QR code to pair their mobile device. This connection enables the desktop app to silence phone notifications during deep focus sessions.*

*   **Implementation:**
    *   **QR Scanner:** Uses `react-qr-reader` for in-browser camera access.
    *   **Context Awareness:** Syncs "Focus State" between desktop and mobile profiles.

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
    *   *Study:* Roediger, H. L., & Karpicke, J. D. (2006). The power of testing memory.
2.  **Spaced Repetition:** The roadmap and flashcards encourage spacing reviews over time.
    *   *Study:* Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks.
3.  **Metacognition:** The "AI Coach" reflection step after quizzes asks users to identify *why* they were confused.
    *   *Study:* Flavell, J. H. (1979). Metacognition and cognitive monitoring.
4.  **Flow Theory:** The unified workspace minimizes context switching to maintain deep focus.
    *   *Study:* Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience.

---

*Built for the future of learning.*
