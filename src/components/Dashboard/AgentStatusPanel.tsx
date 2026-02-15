/**
 * Agent Status Panel Component
 * Displays real-time status of all AI agents in the system
 */

import React from 'react';
import { useMultiAgent } from '../../src/hooks/useMultiAgent';
import { Icons } from '../Icons';

export const AgentStatusPanel: React.FC = () => {
  const { agents, tasks, isProcessing } = useMultiAgent();

  const getAgentIcon = (agentId: string) => {
    const iconMap: Record<string, any> = {
      'content-curator': Icons.BookOpen,
      'learning-coach': Icons.Brain,
      'quiz-master': Icons.FileText,
      'cultural-advisor': Icons.Hand,
      'study-planner': Icons.Calendar,
      'doubt-resolver': Icons.MessageCircle,
      'performance-analyst': Icons.BarChart
    };

    return iconMap[agentId] || Icons.Brain;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Agent System</h2>
          <p className="text-sm text-gray-600">
            {isProcessing ? 'Processing tasks...' : 'All systems operational'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <Icons.Loader size={16} className="animate-spin" />
              <span className="text-sm font-medium">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-900">{activeTasks.length}</div>
          <div className="text-sm text-blue-700">Active Tasks</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-900">{completedTasks.length}</div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{pendingTasks.length}</div>
          <div className="text-sm text-gray-700">Pending</div>
        </div>
      </div>

      {/* Agent List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Active Agents
        </h3>
        {agents.map(agent => {
          const AgentIcon = getAgentIcon(agent.id);
          const currentTask = tasks.find(t => t.id === agent.currentTask);

          return (
            <div
              key={agent.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <AgentIcon size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-500">
                    {agent.capabilities.slice(0, 2).join(', ')}
                  </div>
                  {currentTask && (
                    <div className="text-xs text-blue-600 mt-1">
                      Working on: {currentTask.type}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                    agent.status
                  )}`}
                >
                  {agent.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}
      {activeTasks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Active Tasks
          </h3>
          <div className="space-y-2">
            {activeTasks.slice(0, 5).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <Icons.Loader size={16} className="text-blue-600 animate-spin" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{task.type}</div>
                    <div className="text-xs text-gray-600">
                      Assigned to: {task.assignedAgent}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 uppercase">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
