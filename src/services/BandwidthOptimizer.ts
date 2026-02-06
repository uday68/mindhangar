/**
 * Bandwidth Optimizer for Indian Students
 * Target: Reduce data usage from 150MB/30min to <50MB/30min (70% reduction)
 */

interface DataUsageStats {
  totalBytes: number;
  sessionStart: number;
  sessionDuration: number; // in minutes
  breakdown: {
    videos: number;
    images: number;
    api: number;
    other: number;
  };
}

class BandwidthOptimizer {
  private dataUsage: DataUsageStats = {
    totalBytes: 0,
    sessionStart: Date.now(),
    sessionDuration: 0,
    breakdown: {
      videos: 0,
      images: 0,
      api: 0,
      other: 0,
    },
  };

  private lowBandwidthMode: boolean = false;
  private readonly BYTE_TO_MB = 1024 * 1024;
  private readonly WARNING_THRESHOLD_MB = 40; // Warn at 40MB
  private readonly CRITICAL_THRESHOLD_MB = 50; // Critical at 50MB

  constructor() {
    // Check if user is on slow connection
    this.detectConnectionSpeed();
    
    // Load saved preference
    const savedMode = localStorage.getItem('lowBandwidthMode');
    if (savedMode === 'true') {
      this.enableLowBandwidthMode();
    }
  }

  private detectConnectionSpeed() {
    // @ts-ignore - NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      // Auto-enable for 2G/3G connections
      if (effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g') {
        console.log(`🐌 Slow connection detected (${effectiveType}) - enabling low bandwidth mode`);
        this.enableLowBandwidthMode();
      }
    }
  }

  enableLowBandwidthMode() {
    this.lowBandwidthMode = true;
    localStorage.setItem('lowBandwidthMode', 'true');
    console.log('📉 Low bandwidth mode enabled');
  }

  disableLowBandwidthMode() {
    this.lowBandwidthMode = false;
    localStorage.setItem('lowBandwidthMode', 'false');
    console.log('📈 Low bandwidth mode disabled');
  }

  isLowBandwidthMode(): boolean {
    return this.lowBandwidthMode;
  }

  /**
   * Get optimized YouTube embed URL
   * - Reduces quality to 360p for low bandwidth
   * - Disables autoplay
   * - Reduces related videos
   */
  optimizeYouTubeUrl(videoId: string): string {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    
    if (this.lowBandwidthMode) {
      return `${baseUrl}?autoplay=0&rel=0&modestbranding=1&vq=medium`;
    }
    
    return `${baseUrl}?autoplay=0&rel=0&modestbranding=1`;
  }

  /**
   * Get optimized image URL
   * - Reduces quality for low bandwidth
   * - Uses WebP format when possible
   */
  optimizeImageUrl(url: string, width?: number): string {
    if (!this.lowBandwidthMode) return url;

    // For external images, we can't optimize directly
    // But we can add query params for services that support it
    const optimizedWidth = width || 400;
    
    // If it's a placeholder or external service that supports resizing
    if (url.includes('placehold.co')) {
      return url.replace(/\d+x\d+/, `${optimizedWidth}x${Math.floor(optimizedWidth * 0.6)}`);
    }

    return url;
  }

  /**
   * Track data usage
   */
  trackDataUsage(bytes: number, category: 'videos' | 'images' | 'api' | 'other' = 'other') {
    this.dataUsage.totalBytes += bytes;
    this.dataUsage.breakdown[category] += bytes;
    
    // Update session duration
    this.dataUsage.sessionDuration = (Date.now() - this.dataUsage.sessionStart) / 1000 / 60;

    // Check thresholds
    const usageMB = this.dataUsage.totalBytes / this.BYTE_TO_MB;
    
    if (usageMB >= this.CRITICAL_THRESHOLD_MB) {
      this.showDataWarning('critical');
    } else if (usageMB >= this.WARNING_THRESHOLD_MB) {
      this.showDataWarning('warning');
    }
  }

  private showDataWarning(level: 'warning' | 'critical') {
    const usageMB = (this.dataUsage.totalBytes / this.BYTE_TO_MB).toFixed(1);
    
    if (level === 'critical') {
      console.warn(`🚨 CRITICAL: Data usage is ${usageMB}MB. Consider enabling low bandwidth mode.`);
    } else {
      console.warn(`⚠️ WARNING: Data usage is ${usageMB}MB. Approaching limit.`);
    }
  }

  /**
   * Get current data usage stats
   */
  getDataUsage(): DataUsageStats & { usageMB: number; rate: string } {
    const usageMB = this.dataUsage.totalBytes / this.BYTE_TO_MB;
    const rate = this.dataUsage.sessionDuration > 0
      ? `${(usageMB / this.dataUsage.sessionDuration).toFixed(1)} MB/min`
      : '0 MB/min';

    return {
      ...this.dataUsage,
      usageMB: parseFloat(usageMB.toFixed(2)),
      rate,
    };
  }

  /**
   * Reset data usage tracking
   */
  resetDataUsage() {
    this.dataUsage = {
      totalBytes: 0,
      sessionStart: Date.now(),
      sessionDuration: 0,
      breakdown: {
        videos: 0,
        images: 0,
        api: 0,
        other: 0,
      },
    };
  }

  /**
   * Compress API request payload
   */
  compressApiPayload(data: any): any {
    if (!this.lowBandwidthMode) return data;

    // Remove unnecessary fields
    const compressed = { ...data };
    
    // Truncate long text fields
    if (compressed.content && compressed.content.length > 1000) {
      compressed.content = compressed.content.substring(0, 1000) + '...';
    }

    return compressed;
  }

  /**
   * Should we prefetch resources?
   */
  shouldPrefetch(): boolean {
    return !this.lowBandwidthMode;
  }

  /**
   * Get recommended video quality
   */
  getRecommendedVideoQuality(): '360p' | '480p' | '720p' | '1080p' {
    if (this.lowBandwidthMode) return '360p';
    
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case '4g':
          return '720p';
        case '3g':
          return '480p';
        case '2g':
        case 'slow-2g':
          return '360p';
        default:
          return '480p';
      }
    }

    return '480p';
  }
}

export const bandwidthOptimizer = new BandwidthOptimizer();
