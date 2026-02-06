/**
 * Progress Service - Tracks user learning progress and achievements
 * Handles XP, levels, streaks, and learning analytics
 */

import { DatabaseManager } from '../db';

export interface UserProgress {
  userId: string;
  contentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  timeSpent: number; // in seconds
  attempts: number;
  lastAttemptAt?: Date;
  completedAt?: Date;
  language: string;
}

export interface LearningStats {
  totalTimeSpent: number; // in seconds
  totalContentCompleted: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  xpReward: number;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  contentIds: string[];
  focusScore: number; // 0-100
  distractions: number;
}

class ProgressService {
  /**
   * Update user progress for content
   */
  async updateProgress(
    userId: string,
    contentId: string,
    language: string,
    progress: {
      status: 'not_started' | 'in_progress' | 'completed';
      score?: number;
      timeSpent?: number;
    }
  ): Promise<void> {
    await DatabaseManager.updateUserProgress(userId, contentId, language, progress);

    // Award XP if completed
    if (progress.status === 'completed') {
      await this.awardXP(userId, this.calculateXP(progress.score, progress.timeSpent));
    }
  }

  /**
   * Get user progress for specific content
   */
  async getProgress(userId: string, contentId: string): Promise<UserProgress | null> {
    try {
      const user = await DatabaseManager.getUserWithPreferences(userId);
      const progress = user?.progress?.find((p: any) => p.contentId === contentId);
      return progress || null;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  /**
   * Get all user progress
   */
  async getAllProgress(userId: string): Promise<UserProgress[]> {
    try {
      const user = await DatabaseManager.getUserWithPreferences(userId);
      return user?.progress || [];
    } catch (error) {
      console.error('Error fetching all progress:', error);
      return [];
    }
  }

  /**
   * Calculate XP based on performance
   */
  private calculateXP(score?: number, timeSpent?: number): number {
    let xp = 10; // Base XP

    // Bonus for high scores
    if (score) {
      if (score >= 90) xp += 20;
      else if (score >= 80) xp += 15;
      else if (score >= 70) xp += 10;
      else if (score >= 60) xp += 5;
    }

    // Bonus for time spent (engagement)
    if (timeSpent) {
      const minutes = timeSpent / 60;
      if (minutes >= 30) xp += 10;
      else if (minutes >= 15) xp += 5;
    }

    return xp;
  }

  /**
   * Award XP to user
   */
  async awardXP(userId: string, xp: number): Promise<void> {
    // In a real implementation, this would update the database
    console.log(`Awarding ${xp} XP to user ${userId}`);
    
    // Check for level up
    const stats = await this.getLearningStats(userId);
    const newXP = stats.xp + xp;
    const newLevel = this.calculateLevel(newXP);
    
    if (newLevel > stats.level) {
      await this.handleLevelUp(userId, newLevel);
    }
  }

  /**
   * Calculate level from XP
   */
  private calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Handle level up event
   */
  private async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    console.log(`🎉 User ${userId} leveled up to level ${newLevel}!`);
    
    // Award achievement
    await this.unlockAchievement(userId, {
      id: `level_${newLevel}`,
      title: `Level ${newLevel} Reached!`,
      description: `You've reached level ${newLevel}. Keep learning!`,
      icon: '🎓',
      unlockedAt: new Date(),
      xpReward: newLevel * 10,
    });
  }

  /**
   * Get learning statistics
   */
  async getLearningStats(userId: string): Promise<LearningStats> {
    try {
      const progress = await this.getAllProgress(userId);
      
      const completed = progress.filter(p => p.status === 'completed');
      const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
      const averageScore = completed.length > 0
        ? completed.reduce((sum, p) => sum + (p.score || 0), 0) / completed.length
        : 0;

      // Calculate streak
      const streak = await this.calculateStreak(userId);

      return {
        totalTimeSpent,
        totalContentCompleted: completed.length,
        averageScore,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        xp: 0, // Would come from database
        level: 1, // Would come from database
        achievements: [], // Would come from database
      };
    } catch (error) {
      console.error('Error fetching learning stats:', error);
      return {
        totalTimeSpent: 0,
        totalContentCompleted: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        xp: 0,
        level: 1,
        achievements: [],
      };
    }
  }

  /**
   * Calculate study streak
   */
  private async calculateStreak(userId: string): Promise<{ current: number; longest: number }> {
    // In a real implementation, this would check daily activity
    // For now, return mock data
    return {
      current: 5,
      longest: 12,
    };
  }

  /**
   * Start study session
   */
  async startSession(userId: string): Promise<StudySession> {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      userId,
      startTime: new Date(),
      duration: 0,
      contentIds: [],
      focusScore: 100,
      distractions: 0,
    };

    // Store in local storage or state management
    localStorage.setItem(`session_${userId}`, JSON.stringify(session));

    return session;
  }

  /**
   * End study session
   */
  async endSession(sessionId: string): Promise<StudySession | null> {
    try {
      const sessionData = localStorage.getItem(`session_${sessionId}`);
      if (!sessionData) return null;

      const session: StudySession = JSON.parse(sessionData);
      session.endTime = new Date();
      session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

      // Award XP for session
      const sessionXP = Math.floor(session.duration / 60) * 2; // 2 XP per minute
      await this.awardXP(session.userId, sessionXP);

      // Clean up
      localStorage.removeItem(`session_${sessionId}`);

      return session;
    } catch (error) {
      console.error('Error ending session:', error);
      return null;
    }
  }

  /**
   * Record distraction during session
   */
  async recordDistraction(sessionId: string): Promise<void> {
    try {
      const sessionData = localStorage.getItem(`session_${sessionId}`);
      if (!sessionData) return;

      const session: StudySession = JSON.parse(sessionData);
      session.distractions += 1;
      session.focusScore = Math.max(0, 100 - (session.distractions * 5));

      localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    } catch (error) {
      console.error('Error recording distraction:', error);
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    console.log(`🏆 Achievement unlocked for ${userId}:`, achievement.title);
    
    // Award XP
    await this.awardXP(userId, achievement.xpReward);
    
    // In a real implementation, this would save to database
  }

  /**
   * Get user achievements
   */
  async getAchievements(userId: string): Promise<Achievement[]> {
    // In a real implementation, this would fetch from database
    return [];
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    userName: string;
    xp: number;
    level: number;
    rank: number;
  }>> {
    // In a real implementation, this would fetch from database
    return [];
  }

  /**
   * Get daily goal progress
   */
  async getDailyGoalProgress(userId: string): Promise<{
    goal: number; // in minutes
    completed: number; // in minutes
    percentage: number;
  }> {
    const today = new Date().toDateString();
    const sessionData = localStorage.getItem(`daily_${userId}_${today}`);
    
    const completed = sessionData ? parseInt(sessionData) : 0;
    const goal = 60; // 60 minutes default goal

    return {
      goal,
      completed,
      percentage: Math.min(100, (completed / goal) * 100),
    };
  }

  /**
   * Update daily goal progress
   */
  async updateDailyGoal(userId: string, minutes: number): Promise<void> {
    const today = new Date().toDateString();
    const key = `daily_${userId}_${today}`;
    const current = parseInt(localStorage.getItem(key) || '0');
    
    localStorage.setItem(key, (current + minutes).toString());
  }
}

export const progressService = new ProgressService();
