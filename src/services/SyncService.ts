/**
 * Sync Service - Handles cross-device synchronization
 * Syncs user data, progress, and content across devices
 */

import { offlineSyncService } from './OfflineSyncService';
import { bandwidthOptimizer } from './BandwidthOptimizer';

export interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  syncErrors: string[];
}

export interface SyncConflict {
  id: string;
  type: 'content' | 'progress' | 'settings';
  localVersion: any;
  remoteVersion: any;
  timestamp: Date;
}

class SyncService {
  private syncStatus: Map<string, SyncStatus> = new Map();
  private syncInterval: number | null = null;
  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize sync service
   */
  async initialize(userId: string): Promise<void> {
    // Load sync status from storage
    this.loadSyncStatus(userId);

    // Start automatic sync
    this.startAutoSync(userId);

    console.log('✅ Sync service initialized');
  }

  /**
   * Start automatic sync
   */
  private startAutoSync(userId: string): void {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Only sync if online and not in low bandwidth mode
    if (navigator.onLine && !bandwidthOptimizer.isLowBandwidthMode()) {
      this.syncInterval = window.setInterval(() => {
        this.syncAll(userId);
      }, this.SYNC_INTERVAL_MS);
    }
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all data
   */
  async syncAll(userId: string): Promise<void> {
    const status = this.getSyncStatus(userId);
    
    if (status.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    // Update status
    status.isSyncing = true;
    status.syncErrors = [];
    this.updateSyncStatus(userId, status);

    try {
      // Sync in order of priority
      await this.syncProgress(userId);
      await this.syncContent(userId);
      await this.syncSettings(userId);

      // Update last sync time
      status.lastSyncTime = new Date();
      status.pendingChanges = 0;
    } catch (error) {
      console.error('Sync error:', error);
      status.syncErrors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      status.isSyncing = false;
      this.updateSyncStatus(userId, status);
    }
  }

  /**
   * Sync user progress
   */
  private async syncProgress(userId: string): Promise<void> {
    console.log('Syncing progress...');
    
    // In a real implementation, this would:
    // 1. Get local progress changes
    // 2. Upload to server
    // 3. Download server changes
    // 4. Merge changes
    // 5. Resolve conflicts

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Track data usage
    bandwidthOptimizer.trackDataUsage(1024, 'api'); // 1KB
  }

  /**
   * Sync content
   */
  private async syncContent(userId: string): Promise<void> {
    console.log('Syncing content...');
    
    // Get offline content
    const offlineContent = await offlineSyncService.getNotes();
    
    // In a real implementation, this would upload to server
    console.log(`Syncing ${offlineContent.length} content items`);
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Track data usage
    const dataSize = JSON.stringify(offlineContent).length;
    bandwidthOptimizer.trackDataUsage(dataSize, 'api');
  }

  /**
   * Sync settings
   */
  private async syncSettings(userId: string): Promise<void> {
    console.log('Syncing settings...');
    
    // In a real implementation, this would sync user preferences
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Track data usage
    bandwidthOptimizer.trackDataUsage(512, 'api'); // 512 bytes
  }

  /**
   * Force sync now
   */
  async forceSyncNow(userId: string): Promise<void> {
    console.log('🔄 Force syncing...');
    await this.syncAll(userId);
  }

  /**
   * Get sync status
   */
  getSyncStatus(userId: string): SyncStatus {
    if (!this.syncStatus.has(userId)) {
      this.syncStatus.set(userId, {
        lastSyncTime: null,
        isSyncing: false,
        pendingChanges: 0,
        syncErrors: [],
      });
    }
    return this.syncStatus.get(userId)!;
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(userId: string, status: SyncStatus): void {
    this.syncStatus.set(userId, status);
    this.saveSyncStatus(userId);
  }

  /**
   * Mark content as changed (needs sync)
   */
  markAsChanged(userId: string): void {
    const status = this.getSyncStatus(userId);
    status.pendingChanges += 1;
    this.updateSyncStatus(userId, status);
  }

  /**
   * Resolve sync conflict
   */
  async resolveConflict(
    userId: string,
    conflict: SyncConflict,
    resolution: 'local' | 'remote' | 'merge'
  ): Promise<void> {
    console.log(`Resolving conflict: ${conflict.id} with ${resolution}`);
    
    // In a real implementation, this would:
    // 1. Apply the chosen resolution
    // 2. Update local/remote data
    // 3. Mark conflict as resolved
    
    switch (resolution) {
      case 'local':
        // Keep local version
        console.log('Keeping local version');
        break;
      case 'remote':
        // Use remote version
        console.log('Using remote version');
        break;
      case 'merge':
        // Merge both versions
        console.log('Merging versions');
        break;
    }
  }

  /**
   * Get pending conflicts
   */
  async getPendingConflicts(userId: string): Promise<SyncConflict[]> {
    // In a real implementation, this would fetch from storage
    return [];
  }

  /**
   * Enable/disable auto sync
   */
  setAutoSync(userId: string, enabled: boolean): void {
    if (enabled) {
      this.startAutoSync(userId);
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Check if sync is needed
   */
  needsSync(userId: string): boolean {
    const status = this.getSyncStatus(userId);
    
    // Sync if:
    // 1. Never synced before
    // 2. Has pending changes
    // 3. Last sync was more than 10 minutes ago
    
    if (!status.lastSyncTime) return true;
    if (status.pendingChanges > 0) return true;
    
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (status.lastSyncTime < tenMinutesAgo) return true;
    
    return false;
  }

  /**
   * Get time since last sync
   */
  getTimeSinceLastSync(userId: string): string {
    const status = this.getSyncStatus(userId);
    
    if (!status.lastSyncTime) {
      return 'Never';
    }

    const now = Date.now();
    const lastSync = status.lastSyncTime.getTime();
    const diff = now - lastSync;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Export sync data for debugging
   */
  async exportSyncData(userId: string): Promise<string> {
    const status = this.getSyncStatus(userId);
    const conflicts = await this.getPendingConflicts(userId);

    return JSON.stringify({
      userId,
      status,
      conflicts,
      exportTime: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Save sync status to localStorage
   */
  private saveSyncStatus(userId: string): void {
    const status = this.getSyncStatus(userId);
    localStorage.setItem(`sync_status_${userId}`, JSON.stringify(status));
  }

  /**
   * Load sync status from localStorage
   */
  private loadSyncStatus(userId: string): void {
    const stored = localStorage.getItem(`sync_status_${userId}`);
    if (stored) {
      try {
        const status = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (status.lastSyncTime) {
          status.lastSyncTime = new Date(status.lastSyncTime);
        }
        this.syncStatus.set(userId, status);
      } catch (error) {
        console.error('Error loading sync status:', error);
      }
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.stopAutoSync();
  }
}

export const syncService = new SyncService();
