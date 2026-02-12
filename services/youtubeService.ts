// Browser-compatible YouTube service
// Uses YouTube Data API v3 directly via fetch

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  duration: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

const YOUTUBE_API_KEY = (import.meta as any).env?.VITE_YOUTUBE_API_KEY || '';

/**
 * Search for YouTube videos based on query and filters
 */
export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 10,
  filters: {
    level?: 'beginner' | 'intermediate' | 'advanced' | 'research';
    subject?: string;
  } = {}
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured. Please add VITE_YOUTUBE_API_KEY to your .env file.');
  }

  try {
    // Build search query with educational filters
    let searchQuery = query;

    // Add educational keywords based on level
    const levelKeywords = {
      beginner: 'tutorial basics introduction fundamentals',
      intermediate: 'intermediate advanced concepts techniques',
      advanced: 'advanced expert deep dive specialized',
      research: 'research academic paper study analysis'
    };

    if (filters.level) {
      searchQuery += ` ${levelKeywords[filters.level]}`;
    }

    // Add subject filter if provided
    if (filters.subject) {
      searchQuery += ` ${filters.subject}`;
    }

    // Add educational channel preferences
    searchQuery += ' education tutorial course learning';

    // Search for videos
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', searchQuery);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('maxResults', maxResults.toString());
    searchUrl.searchParams.append('order', 'relevance');
    searchUrl.searchParams.append('safeSearch', 'strict');
    searchUrl.searchParams.append('videoDuration', 'medium');
    searchUrl.searchParams.append('relevanceLanguage', 'en');
    searchUrl.searchParams.append('key', YOUTUBE_API_KEY);

    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      throw new Error(error.error?.message || 'Failed to search YouTube videos');
    }

    const searchData = await searchResponse.json();
    const videoIds = searchData.items?.map((item: any) => item.id?.videoId).filter(Boolean) || [];

    if (videoIds.length === 0) {
      return [];
    }

    // Get detailed video information
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.append('part', 'snippet,contentDetails');
    videosUrl.searchParams.append('id', videoIds.join(','));
    videosUrl.searchParams.append('key', YOUTUBE_API_KEY);

    const videosResponse = await fetch(videosUrl.toString());
    
    if (!videosResponse.ok) {
      const error = await videosResponse.json();
      throw new Error(error.error?.message || 'Failed to fetch video details');
    }

    const videosData = await videosResponse.json();

    return videosData.items?.map((item: any) => ({
      id: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      channelTitle: item.snippet?.channelTitle || '',
      duration: item.contentDetails?.duration || '',
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || '',
      publishedAt: item.snippet?.publishedAt || ''
    })) || [];

  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
}

/**
 * Get transcript for a YouTube video
 * Note: This requires a backend service as YouTube doesn't provide direct transcript API
 */
export async function getVideoTranscript(videoId: string): Promise<TranscriptItem[]> {
  // This would need a backend endpoint to fetch transcripts
  // For now, return empty array
  console.warn('Video transcript fetching requires backend service');
  return [];
}

/**
 * Parse ISO 8601 duration to seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Generate course suggestions based on user interests
 */
export async function generateCourseSuggestions(
  userInterests: string[],
  userLevel: 'beginner' | 'intermediate' | 'advanced' | 'research'
): Promise<{
  subject: string;
  videos: YouTubeVideo[];
  estimatedDuration: number;
}[]> {
  const suggestions = [];

  for (const interest of userInterests) {
    try {
      const videos = await searchYouTubeVideos(interest, 5, { level: userLevel });

      if (videos.length > 0) {
        const totalDuration = videos.reduce((sum, video) =>
          sum + parseDuration(video.duration), 0
        );

        suggestions.push({
          subject: interest,
          videos,
          estimatedDuration: totalDuration
        });
      }
    } catch (error) {
      console.error(`Error generating suggestions for ${interest}:`, error);
    }
  }

  return suggestions;
}

/**
 * Validate if a video is educational based on title and description
 */
export function isEducationalVideo(video: YouTubeVideo): boolean {
  const educationalKeywords = [
    'tutorial', 'course', 'learn', 'education', 'lesson', 'guide',
    'how to', 'explained', 'basics', 'fundamentals', 'introduction',
    'advanced', 'expert', 'masterclass', 'workshop', 'training'
  ];

  const text = `${video.title} ${video.description}`.toLowerCase();

  return educationalKeywords.some(keyword => text.includes(keyword));
}

/**
 * Filter videos to only include educational content
 */
export function filterEducationalVideos(videos: YouTubeVideo[]): YouTubeVideo[] {
  return videos.filter(isEducationalVideo);
}
