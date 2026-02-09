/**
 * Recommendation Widget Component
 * Displays personalized content recommendations from AI service
 */

import React, { useEffect } from 'react';
import { Icons } from '../../../components/Icons';
import { SkeletonCard } from '../Loading/SkeletonLoader';
import { ErrorState } from '../Error/ErrorState';
import { aiServiceFacade } from '../../services/AIServiceFacade';
import { useStore } from '../../../store/useStore';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'activity' | 'resource';
  relevanceScore: number;
  culturalContext?: string;
}

interface RecommendationWidgetProps {
  maxItems?: number;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  onDismiss?: (recommendationId: string) => void;
  onFeedback?: (recommendationId: string, feedback: 'helpful' | 'not-helpful') => void;
  className?: string;
}

export const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  maxItems = 5,
  onRecommendationClick,
  onDismiss,
  onFeedback,
  className = '',
}) => {
  const { user } = useStore();
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use AI Service Facade to get recommendations
        const userId = user?.id || 'guest';
        const response = await aiServiceFacade.getRecommendations(userId, maxItems);
        
        if (response.error) {
          throw response.error;
        }
        
        // Transform API response to component format
        const transformedRecommendations: Recommendation[] = (response.data || []).map((rec: any) => ({
          id: rec.id || rec.contentId || Math.random().toString(),
          title: rec.title || rec.content?.title || 'Recommended Content',
          description: rec.description || rec.reasoning?.primary || 'Personalized recommendation for you',
          type: rec.type === 'next_content' ? 'content' : 
                rec.type === 'exam_prep' ? 'activity' : 'resource',
          relevanceScore: Math.round((rec.score || rec.confidence || 0.7) * 100),
          culturalContext: rec.culturalContext || rec.content?.board,
        }));
        
        setRecommendations(transformedRecommendations);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError(err as Error);
        setLoading(false);
        
        // Fallback to mock data on error
        const mockRecommendations: Recommendation[] = [
          {
            id: '1',
            title: 'Algebra Fundamentals',
            description: 'Master the basics of algebraic expressions and equations',
            type: 'content',
            relevanceScore: 95,
            culturalContext: 'CBSE Grade 10',
          },
          {
            id: '2',
            title: 'Practice Quiz: Geometry',
            description: 'Test your understanding of geometric concepts',
            type: 'activity',
            relevanceScore: 88,
          },
          {
            id: '3',
            title: 'Physics Study Guide',
            description: 'Comprehensive guide for mechanics and motion',
            type: 'resource',
            relevanceScore: 82,
          },
        ];
        
        setRecommendations(mockRecommendations.slice(0, maxItems));
      }
    };

    fetchRecommendations();
  }, [maxItems, user?.id]);

  const handleDismiss = async (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
    onDismiss?.(id);
    
    // Track dismissal with AI service
    try {
      const userId = user?.id || 'guest';
      await aiServiceFacade.dismissRecommendation(userId, id);
    } catch (err) {
      console.error('Failed to track dismissal:', err);
    }
  };

  const handleClick = (recommendation: Recommendation) => {
    onRecommendationClick?.(recommendation);
  };

  const handleFeedback = async (id: string, feedback: 'helpful' | 'not-helpful') => {
    onFeedback?.(id, feedback);
    
    // Track feedback with AI service
    try {
      const userId = user?.id || 'guest';
      await aiServiceFacade.provideFeedback(userId, id, feedback);
    } catch (err) {
      console.error('Failed to track feedback:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = user?.id || 'guest';
      const response = await aiServiceFacade.refreshRecommendations(userId, maxItems);
      
      if (response.error) {
        throw response.error;
      }
      
      const transformedRecommendations: Recommendation[] = (response.data || []).map((rec: any) => ({
        id: rec.id || rec.contentId || Math.random().toString(),
        title: rec.title || rec.content?.title || 'Recommended Content',
        description: rec.description || rec.reasoning?.primary || 'Personalized recommendation for you',
        type: rec.type === 'next_content' ? 'content' : 
              rec.type === 'exam_prep' ? 'activity' : 'resource',
        relevanceScore: Math.round((rec.score || rec.confidence || 0.7) * 100),
        culturalContext: rec.culturalContext || rec.content?.board,
      }));
      
      setRecommendations(transformedRecommendations);
      setLoading(false);
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
      setError(err as Error);
      setLoading(false);
    }
  };

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'content':
        return <Icons.FileText size={20} className="text-teal-600" />;
      case 'activity':
        return <Icons.Brain size={20} className="text-purple-600" />;
      case 'resource':
        return <Icons.ExternalLink size={20} className="text-blue-600" />;
    }
  };

  const getTypeLabel = (type: Recommendation['type']) => {
    switch (type) {
      case 'content':
        return 'Content';
      case 'activity':
        return 'Activity';
      case 'resource':
        return 'Resource';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRefresh}
        variant="inline"
        severity="warning"
      />
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Icons.Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Recommendations Yet</h3>
        <p className="text-gray-600">
          Complete some activities to get personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} role="region" aria-label="Personalized recommendations">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Icons.Sparkles size={20} className="text-teal-600" />
          Recommended for You
        </h2>
        <button
          onClick={handleRefresh}
          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          aria-label="Refresh recommendations"
        >
          <Icons.RotateCcw size={16} />
          Refresh
        </button>
      </div>

      {recommendations.map((recommendation, index) => (
        <div
          key={recommendation.id}
          className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => handleClick(recommendation)}
          role="article"
          aria-label={`Recommendation: ${recommendation.title}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(recommendation);
            }
          }}
        >
          {/* Type Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
              {getTypeIcon(recommendation.type)}
              {getTypeLabel(recommendation.type)}
            </span>
            
            {/* Relevance Score */}
            <span className="text-xs font-bold text-teal-600">
              {recommendation.relevanceScore}% match
            </span>
          </div>

          {/* Content */}
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
            {recommendation.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {recommendation.description}
          </p>

          {/* Cultural Context */}
          {recommendation.culturalContext && (
            <span className="inline-block text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {recommendation.culturalContext}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFeedback(recommendation.id, 'helpful');
              }}
              className="text-xs text-gray-600 hover:text-teal-600 flex items-center gap-1"
              aria-label="Mark as helpful"
            >
              <Icons.Check size={14} />
              Helpful
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(recommendation.id);
              }}
              className="text-xs text-gray-600 hover:text-red-600 flex items-center gap-1 ml-auto"
              aria-label="Dismiss recommendation"
            >
              <Icons.X size={14} />
              Dismiss
            </button>
          </div>

          {/* Hover Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icons.ChevronRight size={20} className="text-teal-600" />
          </div>
        </div>
      ))}
    </div>
  );
};
