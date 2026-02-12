/**
 * React Hook for Multi-Agent System Integration
 * Provides easy access to multi-agent orchestrator from React components
 */

import { useState, useEffect, useCallback } from 'react';
import { multiAgentOrchestrator, AgentTask, Agent } from '../services/MultiAgentOrchestrator';

export interface UseMultiAgentReturn {
  submitTask: (task: Omit<AgentTask, 'id' | 'status'>) => Promise<string>;
  getTaskStatus: (taskId: string) => AgentTask | undefined;
  getAllAgents: () => Agent[];
  getAgentStatus: (agentId: string) => Agent | undefined;
  tasks: AgentTask[];
  agents: Agent[];
  isProcessing: boolean;
}

export function useMultiAgent(): UseMultiAgentReturn {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update tasks and agents periodically
  useEffect(() => {
    const updateState = () => {
      setTasks(multiAgentOrchestrator.getAllTasks());
      setAgents(multiAgentOrchestrator.getAllAgents());
      
      const hasActiveTasks = multiAgentOrchestrator
        .getAllTasks()
        .some(t => t.status === 'in_progress');
      setIsProcessing(hasActiveTasks);
    };

    // Initial update
    updateState();

    // Set up event listeners
    const handleTaskUpdate = () => updateState();
    
    multiAgentOrchestrator.on('task:submitted', handleTaskUpdate);
    multiAgentOrchestrator.on('task:started', handleTaskUpdate);
    multiAgentOrchestrator.on('task:completed', handleTaskUpdate);
    multiAgentOrchestrator.on('task:failed', handleTaskUpdate);

    // Poll for updates
    const interval = setInterval(updateState, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const submitTask = useCallback(
    async (task: Omit<AgentTask, 'id' | 'status'>) => {
      return await multiAgentOrchestrator.submitTask(task);
    },
    []
  );

  const getTaskStatus = useCallback((taskId: string) => {
    return multiAgentOrchestrator.getTaskStatus(taskId);
  }, []);

  const getAllAgents = useCallback(() => {
    return multiAgentOrchestrator.getAllAgents();
  }, []);

  const getAgentStatus = useCallback((agentId: string) => {
    return multiAgentOrchestrator.getAgentStatus(agentId);
  }, []);

  return {
    submitTask,
    getTaskStatus,
    getAllAgents,
    getAgentStatus,
    tasks,
    agents,
    isProcessing
  };
}

/**
 * Hook for specific agent operations
 */
export function useAgent(agentId: string) {
  const { getAgentStatus, submitTask } = useMultiAgent();
  const [agent, setAgent] = useState<Agent | undefined>();

  useEffect(() => {
    const updateAgent = () => {
      setAgent(getAgentStatus(agentId));
    };

    updateAgent();
    const interval = setInterval(updateAgent, 1000);

    return () => clearInterval(interval);
  }, [agentId, getAgentStatus]);

  const executeTask = useCallback(
    async (type: string, data: any, priority: AgentTask['priority'] = 'medium') => {
      return await submitTask({ type, data, priority });
    },
    [submitTask]
  );

  return {
    agent,
    executeTask,
    isAvailable: agent?.status === 'idle',
    isBusy: agent?.status === 'busy'
  };
}
