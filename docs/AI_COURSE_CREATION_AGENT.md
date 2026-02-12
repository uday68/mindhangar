# AI-Powered Course Creation Agent

## Overview

The Course Creation Agent is an intelligent conversational AI that guides users through the process of creating personalized courses by asking relevant questions and gathering necessary details in a natural, chat-like interface.

## Features

### 1. Conversational Interface
- Natural language interaction
- Step-by-step guidance
- Context-aware questions
- Smart information extraction

### 2. Intelligent Question Flow

The agent follows a structured conversation flow:

1. **Greeting** - Welcome and introduction
2. **Topic** - What subject to learn
3. **Level** - Experience level (beginner/intermediate/advanced)
4. **Objectives** - Learning goals and outcomes
5. **Duration** - Time commitment and course length
6. **Audience** - Target learners
7. **Prerequisites** - Required prior knowledge
8. **Language** - Preferred language and cultural context
9. **Content Preferences** - Quizzes, projects, etc.
10. **Confirmation** - Review and create

### 3. Smart Information Extraction

The agent automatically extracts information from user responses:

```typescript
// User: "I want to learn Python for beginners"
// Agent extracts:
{
  topic: "Python",
  level: "beginner"
}

// User: "I can dedicate 2 weeks"
// Agent calculates:
{
  duration: 20, // hours
  moduleCount: 5
}
```

### 4. Quick Reply Suggestions

Context-aware quick reply buttons for common responses:
- Level selection: "Beginner", "Intermediate", "Advanced"
- Duration: "Quick course", "Standard course", "Comprehensive course"
- Language: "English", "Hindi", "Telugu"
- Confirmation: "Yes, create it!", "Modify"

### 5. Real-time Course Generation

Once all details are gathered, the agent:
1. Validates requirements
2. Generates course structure
3. Creates modules with videos
4. Adds quizzes and assessments
5. Delivers the complete course

## Usage

### Opening the Chat Interface

```typescript
import { CourseCreationChatModal } from '@/components/Modals/CourseCreationChatModal';

function MyComponent() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button onClick={() => setShowChat(true)}>
        Create with AI
      </button>

      <CourseCreationChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onCourseCreated={(courseId) => {
          console.log('Course created:', courseId);
        }}
      />
    </>
  );
}
```

### Programmatic Usage

```typescript
import { courseCreationAgent } from '@/services/agents/CourseCreationAgent';

// Start conversation
const state = courseCreationAgent.startConversation();

// Process user response
const newState = await courseCreationAgent.processResponse(
  state,
  "I want to learn Python programming"
);

// Validate requirements
const validation = courseCreationAgent.validateRequirements(
  newState.requirements
);

if (validation.isValid) {
  // Create course
  const course = await createCourse(newState.requirements);
}
```

## Conversation Examples

### Example 1: Quick Course Creation

```
Agent: Hi! I'm your Course Creation Assistant 🎓
       What topic would you like to learn about?

User: Python programming

Agent: Great! What's your current experience level?
       - Beginner
       - Intermediate  
       - Advanced

User: Beginner

Agent: Perfect! What are your main learning goals?

User: Learn basics, build simple programs, understand syntax

Agent: How much time can you dedicate?

User: 2 weeks

Agent: Got it! I'll structure the course for 5 modules.
       Who is this course for?

User: Students

Agent: Are there any prerequisites?

User: None

Agent: What language would you prefer?

User: English

Agent: Would you like quizzes and projects?

User: Yes, both

Agent: Perfect! Here's what I'll create:
       📚 Course: Python programming
       📊 Level: beginner
       ⏱️ Duration: ~20 hours
       📖 Modules: 5
       
       Does this look good?

User: Yes

Agent: 🎉 Success! Your course has been created!
```

### Example 2: Detailed Course Creation

```
Agent: What topic would you like to learn?

User: I want to learn advanced machine learning techniques 
      for working professionals

Agent: Excellent! I see you want an advanced level course.
       What are your main learning goals?

User: Master deep learning, neural networks, and deploy ML models

Agent: How much time can you dedicate?

User: I can spend 3 months, about 10 hours per week

Agent: Perfect! I'll create a comprehensive 120-hour course 
       with 12 modules.
       
       Are there any prerequisites?

User: Python, basic statistics, linear algebra

Agent: Great! What language preference?

User: English with Indian context

Agent: Would you like quizzes and hands-on projects?

User: Yes, I need lots of practical projects

Agent: Here's your course plan:
       📚 Course: Advanced Machine Learning
       📊 Level: advanced
       ⏱️ Duration: ~120 hours
       📖 Modules: 12
       🎯 Goals: Master deep learning, neural networks...
       👥 For: Working professionals
       📋 Prerequisites: Python, statistics, linear algebra
       
       ✓ Interactive quizzes
       ✓ Hands-on projects
       
       Ready to create?

User: Yes!
```

## Technical Architecture

### Agent State Management

```typescript
interface ConversationState {
  step: number;                    // Current conversation step
  requirements: CourseRequirements; // Gathered information
  conversationHistory: Message[];   // Chat history
  isComplete: boolean;             // Ready to create course
}
```

### Information Extraction

The agent uses pattern matching and NLP techniques to extract:
- **Topics**: Direct text extraction
- **Levels**: Keyword detection (beginner, advanced, etc.)
- **Duration**: Number extraction with unit conversion
- **Language**: Language name detection
- **Preferences**: Boolean extraction from responses

### Validation

```typescript
const validation = validateRequirements(requirements);

if (!validation.isValid) {
  console.log('Missing:', validation.missingFields);
  // Ask for missing information
}
```

## Customization

### Adding New Questions

```typescript
// In CourseCreationAgent.ts
private conversationSteps = [
  'greeting',
  'topic',
  'level',
  'objectives',
  'duration',
  'audience',
  'prerequisites',
  'language',
  'content_preferences',
  'your_new_step',  // Add here
  'confirmation'
];

// Add extraction logic
case 'your_new_step':
  updated.yourField = extractYourData(userResponse);
  break;

// Add question generation
case 'your_new_step':
  return "Your question here?";
```

### Customizing Quick Replies

```typescript
// In CourseCreationChatModal.tsx
const getQuickReplies = (): string[] => {
  switch (step) {
    case YOUR_STEP:
      return ['Option 1', 'Option 2', 'Option 3'];
    default:
      return [];
  }
};
```

## Integration with Multi-Agent System

The Course Creation Agent works seamlessly with other agents:

```typescript
// After gathering requirements
const taskId = await multiAgentOrchestrator.submitTask({
  type: 'generate_course',
  priority: 'high',
  data: conversationState.requirements
});

// Content Curator Agent processes the request
// Cultural Advisor Agent adapts content
// Quiz Master Agent generates assessments
```

## Best Practices

1. **Keep responses natural**: The agent should feel conversational
2. **Provide context**: Always explain why information is needed
3. **Offer examples**: Help users understand what you're asking
4. **Allow flexibility**: Accept various response formats
5. **Confirm understanding**: Summarize before creating
6. **Handle errors gracefully**: Provide helpful error messages
7. **Save progress**: Allow users to resume conversations

## Future Enhancements

1. **Voice Input**: Speech-to-text for hands-free interaction
2. **Multi-language**: Support conversations in regional languages
3. **Course Templates**: Quick start with pre-defined templates
4. **Collaborative Creation**: Multiple users creating together
5. **AI Suggestions**: Proactive recommendations during conversation
6. **Learning from Feedback**: Improve based on user satisfaction

## Troubleshooting

### Agent not responding
- Check console for errors
- Verify agent initialization
- Ensure conversation state is valid

### Information not extracted
- Review extraction patterns
- Add more keywords for detection
- Improve regex patterns

### Course creation fails
- Validate all required fields
- Check API connections
- Verify user profile exists

## Conclusion

The AI Course Creation Agent transforms course creation from a form-filling task into an engaging conversation, making it easier and more intuitive for users to create personalized learning experiences.
