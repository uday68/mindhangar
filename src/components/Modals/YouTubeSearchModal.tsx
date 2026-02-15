import React, { useState } from 'react';
import { Icons } from '../Icons';
import { searchYouTubeVideos, parseDuration, isEducationalVideo, type YouTubeVideo } from '@/services/youtubeService';

interface YouTubeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (videoId: string, title: string, duration: number) => void;
  suggestedSearch?: string;
}

export const YouTubeSearchModal: React.FC<YouTubeSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVideo,
  suggestedSearch = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(suggestedSearch);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await searchYouTubeVideos(searchQuery, 10, {
        level: 'beginner'
      });

      // Filter to only educational videos
      const educationalVideos = results.filter(isEducationalVideo);

      if (educationalVideos.length === 0) {
        setError('No educational videos found. Try a different search term.');
      }

      setVideos(educationalVideos);
    } catch (err) {
      console.error('YouTube search error:', err);
      setError('Failed to search YouTube. Please check your API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = () => {
    if (selectedVideo) {
      const durationInMinutes = Math.floor(parseDuration(selectedVideo.duration) / 60);
      onSelectVideo(selectedVideo.id, selectedVideo.title, durationInMinutes);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Search YouTube Videos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for educational videos..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Icons.Loader size={20} className="animate-spin" />
              ) : (
                <Icons.Search size={20} />
              )}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {videos.length === 0 && !loading && !error && (
            <div className="text-center text-gray-500 py-12">
              <Icons.Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Search for educational videos to add to your course</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedVideo?.id === video.id
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{video.channelTitle}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{Math.floor(parseDuration(video.duration) / 60)} min</span>
                    <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelectVideo}
            disabled={!selectedVideo}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Video
          </button>
        </div>
      </div>
    </div>
  );
};
