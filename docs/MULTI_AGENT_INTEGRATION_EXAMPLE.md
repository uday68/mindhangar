# Multi-Agent System Integration Examples

## Example 1: Course Creation with Multi-Agent Coordination

```typescript
import { useMultiAgent } from '@/hooks/useMultiAgent';
import { useCourseStore } from '@/store/useCourseStore';

function CreateCourseButton() {
  const { submitTask } = useMultiAgent();
  const { addCourse } = useCourseStore();
  const [loading, setLoading] = useState(false);

  const handleCreateCourse = async () => {
    setLoading(true);

    try {
      // Submit course generation task
      const taskId = await submitTask({
        type: 'generate_course',
        priority: 'high',
        data: {
          topic: 'Python Programming',
          level: 'beginner',
          moduleCount: 5,
          userProfile: {
            interests: ['programming', 'data science'],
            learningStyle: 'visual',
            preferredLanguage: 'en'
          }
        }
      });

      // Wait for completion
      const result = await waitForTaskCompletion(taskId);
      
      // Add course to store
      addCourse(result.course);
      
      toast.success('Course created successfully!');
    } catch (error) {
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCreateCourse} disabled={loading}>
      {loading ? 'Creating...' : 'Create Course'}
    </button>
  );
}
```

## Example 2: Real-time Progress Analysis

```typescript
import { useAgent } from '@/hooks/useMultiAgent';
import { useCourseStore } from '@/store/useCourseStore';

function ProgressDashboard() {
  const { agent, executeTask } = useAgent('learning-coach');
  const { courseProgress } = useCourseStore();
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const analyzeProgress = async () => {
      const taskId = await executeTask('track_progress', {
        userId: 'user-123',
        completedModules: 5,
        totalModules: 10,
        quizScores: [85, 90, 78, 92, 88],
        timeSpent: 450,
        lastActive: new Date()
      }, 'medium');

      const result = await waitForTaskCompletion(taskId);
      setInsights(result.insights);
    };

    analyzeProgress();
  }, [courseProgress]);

  return (
    <div>
      <h2>Your Learning Insights</h2>
      {insights.map(insight => (
        <InsightCard key={insight.title} insight={insight} />
      ))}
    </div>
  );
}
```

## Example 3: Adaptive Quiz Generation

```typescript
import { multiAgentOrchestrator } from '@/services/MultiAgentOrchestrator';

async function generateAdaptiveQuiz(moduleId: string, userPerformance: number) {
  // Coordinate multiple agents
  const result = await multiAgentOrchestrator.coordinateAgents({
    name: 'adaptive_quiz_generation',
    steps: [
      {
        agentId: 'performance-analyst',
        action: 'analyze_performance',
        data: { moduleId, userPerformance }
      },
      {
        agentId: 'quiz-master',
        action: 'generate_quiz',
        data: { 
          moduleId,
          difficulty: 'adaptive' // Will be adjusted based on performance
        },
        dependsOn: ['performance-analyst']
      },
      {
        agentId: 'cultural-advisor',
        action: 'adapt_culture',
        data: { quizId: 'generated' },
        dependsOn: ['quiz-master']
      }
    ]
  });

  return result['quiz-master'].quiz;
}
```

## Example 4: Doubt Resolution with Context

```typescript
import { useAgent } from '@/hooks/useMultiAgent';

function DoubtResolutionChat() {
  const { executeTask } = useAgent('doubt-resolver');
  const [messages, setMessages] = useState([]);

  const askQuestion = async (question: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: question }]);

    // Submit to doubt resolver
    const taskId = await executeTask('answer_question', {
      question,
      context: {
        currentModule: 'Python Basics',
        previousTopics: ['Variables', 'Data Types'],
        userLevel: 'beginner'
      }
    }, 'high');

    // Wait for response
    const result = await waitForTaskCompletion(taskId);

    // Add AI response
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: result.answer,
      confidence: result.confidence,
      sources: result.sources
    }]);
  };

  return (
    <div className="chat-container">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} />
      ))}
      <ChatInput onSubmit={askQuestion} />
    </div>
  );
}
```

## Example 5: Personalized Learning Path

```typescript
import { contentCuratorAgent } from '@/services/agents/ContentCuratorAgent';
import { learningCoachAgent } from '@/services/agents/LearningCoachAgent';

async function createPersonalizedPath(userId: string) {
  // Step 1: Analyze current progress
  const progress = await learningCoachAgent.analyzeProgress({
    userId,
    completedModules: 8,
    totalModules: 20,
    quizScores: [75, 82, 90, 78, 85, 88, 92, 80],
    timeSpent: 600,
    lastActive: new Date()
  });

  // Step 2: Get adaptive recommendations
  const adaptations = await learningCoachAgent.adaptLearningPath({
    userId,
    currentPerformance: 83,
    learningStyle: 'visual',
    strugglingTopics: ['Recursion', 'Dynamic Programming'],
    strengths: ['Arrays', 'Strings']
  });

  // Step 3: Curate content based on adaptations
  const learningPath = await contentCuratorAgent.curateLearningPath({
    goal: 'Master Data Structures',
    currentLevel: adaptations.paceAdjustment,
    timeAvailable: 10,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  return {
    insights: progress,
    adaptations,
    learningPath
  };
}
```

## Example 6: Multi-Agent Event Listeners

```typescript
import { multiAgentOrchestrator } from '@/services/MultiAgentOrchestrator';

function setupAgentListeners() {
  // Listen for task submissions
  multiAgentOrchestrator.on('task:submitted', (event) => {
    console.log('New task submitted:', event.task.type);
    showNotification('Task queued', 'info');
  });

  // Listen for task starts
  multiAgentOrchestrator.on('task:started', (event) => {
    console.log(`Agent ${event.agent.name} started task ${event.task.type}`);
    updateUI({ status: 'processing', agent: event.agent.name });
  });

  // Listen for task completions
  multiAgentOrchestrator.on('task:completed', (event) => {
    console.log('Task completed:', event.result);
    showNotification('Task completed successfully', 'success');
    handleTaskResult(event.task.type, event.result);
  });

  // Listen for task failures
  multiAgentOrchestrator.on('task:failed', (event) => {
    console.error('Task failed:', event.error);
    showNotification('Task failed', 'error');
    logError(event.task, event.error);
  });
}
```

## Example 7: Agent Status Monitoring

```typescript
import { useMultiAgent } from '@/hooks/useMultiAgent';

function AgentMonitoringDashboard() {
  const { agents, tasks, isProcessing } = useMultiAgent();

  const busyAgents = agents.filter(a => a.status === 'busy');
  const idleAgents = agents.filter(a => a.status === 'idle');
  const activeTasks = tasks.filter(t => t.status === 'in_progress');

  return (
    <div className="monitoring-dashboard">
      <div className="stats">
        <StatCard 
          title="Busy Agents" 
          value={busyAgents.length} 
          total={agents.length}
        />
        <StatCard 
          title="Active Tasks" 
          value={activeTasks.length}
        />
        <StatCard 
          title="System Status" 
          value={isProcessing ? 'Active' : 'Idle'}
          color={isProcessing ? 'blue' : 'green'}
        />
      </div>

      <div className="agent-list">
        {agents.map(agent => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            currentTask={tasks.find(t => t.id === agent.currentTask)}
          />
        ))}
      </div>
    </div>
  );
}
```

## Example 8: Batch Task Processing

```typescript
async function processBatchTasks(userIds: string[]) {
  const taskIds = await Promise.all(
    userIds.map(userId => 
      multiAgentOrchestrator.submitTask({
        type: 'analyze_performance',
        priority: 'low',
        data: { userId }
      })
    )
  );

  // Wait for all tasks to complete
  const results = await Promise.all(
    taskIds.map(taskId => waitForTaskCompletion(taskId))
  );

  return results;
}
```

## Example 9: Priority Task Handling

```typescript
async function handleUrgentQuestion(question: string) {
  // Submit with critical priority
  const taskId = await multiAgentOrchestrator.submitTask({
    type: 'answer_question',
    priority: 'critical', // Will be processed immediately
    data: {
      question,
      urgent: true,
      context: getCurrentLearningContext()
    }
  });

  // Show loading state
  showLoadingIndicator();

  // Wait for quick response
  const result = await waitForTaskCompletion(taskId, 5000); // 5 second timeout

  hideLoadingIndicator();
  displayAnswer(result);
}
```

## Example 10: Agent Workflow Orchestration

```typescript
async function completeModuleWorkflow(moduleId: string, userId: string) {
  const workflow = await multiAgentOrchestrator.coordinateAgents({
    name: 'module_completion',
    steps: [
      // Step 1: Record completion
      {
        agentId: 'performance-analyst',
        action: 'record_completion',
        data: { moduleId, userId }
      },
      // Step 2: Generate quiz
      {
        agentId: 'quiz-master',
        action: 'generate_quiz',
        data: { moduleId },
        dependsOn: ['performance-analyst']
      },
      // Step 3: Analyze progress
      {
        agentId: 'learning-coach',
        action: 'analyze_progress',
        data: { userId },
        dependsOn: ['performance-analyst']
      },
      // Step 4: Recommend next module
      {
        agentId: 'content-curator',
        action: 'recommend_content',
        data: { userId, completedModule: moduleId },
        dependsOn: ['learning-coach']
      },
      // Step 5: Send motivational message
      {
        agentId: 'learning-coach',
        action: 'generate_motivation',
        data: { userId, context: 'milestone' },
        dependsOn: ['performance-analyst']
      }
    ]
  });

  return {
    quiz: workflow['quiz-master'],
    insights: workflow['learning-coach'],
    recommendations: workflow['content-curator']
  };
}
```

## Utility Functions

```typescript
// Wait for task completion with timeout
async function waitForTaskCompletion(
  taskId: string, 
  timeout: number = 30000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      const task = multiAgentOrchestrator.getTaskStatus(taskId);
      
      if (task?.status === 'completed') {
        clearInterval(checkInterval);
        resolve(task.result);
      } else if (task?.status === 'failed') {
        clearInterval(checkInterval);
        reject(new Error('Task failed'));
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Task timeout'));
      }
    }, 100);
  });
}

// Get current learning context
function getCurrentLearningContext() {
  const store = useCourseStore.getState();
  return {
    currentCourse: store.activeCourseId,
    currentModule: store.activeModuleId,
    progress: store.courseProgress,
    userProfile: store.userProfile
  };
}
```

## Best Practices

1. **Always handle errors**: Wrap agent calls in try-catch blocks
2. **Use appropriate priorities**: Reserve 'critical' for urgent user-facing tasks
3. **Monitor performance**: Track task completion times
4. **Implement timeouts**: Don't wait indefinitely for task completion
5. **Provide feedback**: Show loading states during agent processing
6. **Log events**: Track agent activities for debugging
7. **Test coordination**: Verify multi-agent workflows work correctly
8. **Handle failures gracefully**: Provide fallbacks when agents fail

## Conclusion

The multi-agent system provides powerful capabilities for building intelligent, adaptive educational experiences. Use these examples as templates for integrating agents into your application.
