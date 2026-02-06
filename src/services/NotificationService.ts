/**
 * Notification Service - Manages user notifications and reminders
 * Supports push notifications, in-app notifications, and study reminders
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'reminder' | 'streak' | 'level_up' | 'quiz_result' | 'system';
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface StudyReminder {
  id: string;
  userId: string;
  title: string;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  sound: boolean;
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private reminders: Map<string, StudyReminder[]> = new Map();

  /**
   * Create a new notification
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    // Store notification
    const userNotifications = this.notifications.get(notification.userId) || [];
    userNotifications.unshift(newNotification);
    this.notifications.set(notification.userId, userNotifications);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      this.showBrowserNotification(newNotification);
    }

    // Store in localStorage for persistence
    this.saveToStorage(notification.userId);

    return newNotification;
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    // Load from storage if not in memory
    if (!this.notifications.has(userId)) {
      this.loadFromStorage(userId);
    }

    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(0, limit);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      this.saveToStorage(userId);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(n => n.read = true);
    this.saveToStorage(userId);
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const filtered = userNotifications.filter(n => n.id !== notificationId);
    this.notifications.set(userId, filtered);
    this.saveToStorage(userId);
  }

  /**
   * Clear all notifications
   */
  async clearAll(userId: string): Promise<void> {
    this.notifications.set(userId, []);
    this.saveToStorage(userId);
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false,
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotif.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => browserNotif.close(), 5000);
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  /**
   * Send achievement notification
   */
  async notifyAchievement(userId: string, title: string, description: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'achievement',
      title: `🏆 ${title}`,
      message: description,
      icon: '🏆',
      read: false,
    });
  }

  /**
   * Send level up notification
   */
  async notifyLevelUp(userId: string, level: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'level_up',
      title: '🎉 Level Up!',
      message: `Congratulations! You've reached level ${level}!`,
      icon: '🎓',
      read: false,
    });
  }

  /**
   * Send streak notification
   */
  async notifyStreak(userId: string, days: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'streak',
      title: '🔥 Streak Milestone!',
      message: `Amazing! You've maintained a ${days}-day study streak!`,
      icon: '🔥',
      read: false,
    });
  }

  /**
   * Send quiz result notification
   */
  async notifyQuizResult(userId: string, score: number, total: number): Promise<void> {
    const percentage = Math.round((score / total) * 100);
    const emoji = percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪';
    
    await this.createNotification({
      userId,
      type: 'quiz_result',
      title: `${emoji} Quiz Complete!`,
      message: `You scored ${score}/${total} (${percentage}%)`,
      icon: emoji,
      read: false,
    });
  }

  /**
   * Create study reminder
   */
  async createReminder(reminder: Omit<StudyReminder, 'id'>): Promise<StudyReminder> {
    const newReminder: StudyReminder = {
      ...reminder,
      id: `reminder_${Date.now()}`,
    };

    const userReminders = this.reminders.get(reminder.userId) || [];
    userReminders.push(newReminder);
    this.reminders.set(reminder.userId, userReminders);

    // Schedule reminder
    this.scheduleReminder(newReminder);

    // Save to storage
    this.saveRemindersToStorage(reminder.userId);

    return newReminder;
  }

  /**
   * Get user reminders
   */
  async getReminders(userId: string): Promise<StudyReminder[]> {
    if (!this.reminders.has(userId)) {
      this.loadRemindersFromStorage(userId);
    }

    return this.reminders.get(userId) || [];
  }

  /**
   * Update reminder
   */
  async updateReminder(userId: string, reminderId: string, updates: Partial<StudyReminder>): Promise<void> {
    const userReminders = this.reminders.get(userId) || [];
    const reminder = userReminders.find(r => r.id === reminderId);
    
    if (reminder) {
      Object.assign(reminder, updates);
      this.saveRemindersToStorage(userId);
      
      // Reschedule if enabled
      if (reminder.enabled) {
        this.scheduleReminder(reminder);
      }
    }
  }

  /**
   * Delete reminder
   */
  async deleteReminder(userId: string, reminderId: string): Promise<void> {
    const userReminders = this.reminders.get(userId) || [];
    const filtered = userReminders.filter(r => r.id !== reminderId);
    this.reminders.set(userId, filtered);
    this.saveRemindersToStorage(userId);
  }

  /**
   * Schedule reminder
   */
  private scheduleReminder(reminder: StudyReminder): void {
    if (!reminder.enabled) return;

    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    // Check if today is a reminder day
    const today = now.getDay();
    if (!reminder.days.includes(today)) return;

    // Calculate time until reminder
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        this.createNotification({
          userId: reminder.userId,
          type: 'reminder',
          title: '📚 Study Reminder',
          message: reminder.title,
          icon: '📚',
          read: false,
        });
      }, delay);
    }
  }

  /**
   * Save notifications to localStorage
   */
  private saveToStorage(userId: string): void {
    const notifications = this.notifications.get(userId) || [];
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  }

  /**
   * Load notifications from localStorage
   */
  private loadFromStorage(userId: string): void {
    const stored = localStorage.getItem(`notifications_${userId}`);
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        this.notifications.set(userId, notifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }

  /**
   * Save reminders to localStorage
   */
  private saveRemindersToStorage(userId: string): void {
    const reminders = this.reminders.get(userId) || [];
    localStorage.setItem(`reminders_${userId}`, JSON.stringify(reminders));
  }

  /**
   * Load reminders from localStorage
   */
  private loadRemindersFromStorage(userId: string): void {
    const stored = localStorage.getItem(`reminders_${userId}`);
    if (stored) {
      try {
        const reminders = JSON.parse(stored);
        this.reminders.set(userId, reminders);
        
        // Schedule all enabled reminders
        reminders.forEach((r: StudyReminder) => {
          if (r.enabled) {
            this.scheduleReminder(r);
          }
        });
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpired(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const now = new Date();
    
    const filtered = userNotifications.filter(n => {
      if (!n.expiresAt) return true;
      return new Date(n.expiresAt) > now;
    });

    this.notifications.set(userId, filtered);
    this.saveToStorage(userId);
  }
}

export const notificationService = new NotificationService();
