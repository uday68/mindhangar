import React, { useState } from 'react';
import { useGamification } from '@/src/hooks/useCulturalTheme';
import { IndianRegion } from '@/src/types/localization';
import { GamificationElement } from '@/src/services/CulturalThemeService';

interface GamificationBadgeProps {
  region: IndianRegion;
  userProgress: {
    lessonsCompleted: number;
    perfectLessons: number;
    quizzesPassed: number;
    currentStreak: number;
    difficultTopicsCompleted: number;
  };
}

/**
 * Gamification Badge Component
 * Displays cultural achievement badges based on user progress
 */
export const GamificationBadge: React.FC<GamificationBadgeProps> = ({ 
  region, 
  userProgress 
}) => {
  const { elements } = useGamification(region);
  const [selectedBadge, setSelectedBadge] = useState<GamificationElement | null>(null);

  // Check which badges are unlocked
  const unlockedBadges = elements.filter(element => {
    switch (element.unlockCondition) {
      case 'Complete 10 lessons':
        return userProgress.lessonsCompleted >= 10;
      case 'Complete 50 lessons':
        return userProgress.lessonsCompleted >= 50;
      case 'Complete 10 lessons perfectly':
        return userProgress.perfectLessons >= 10;
      case 'Achieve 90% in 5 quizzes':
        return userProgress.quizzesPassed >= 5;
      case 'Maintain 7-day streak':
        return userProgress.currentStreak >= 7;
      case 'Complete 5 challenging quizzes':
        return userProgress.quizzesPassed >= 5;
      case 'Complete 10 difficult topics':
        return userProgress.difficultTopicsCompleted >= 10;
      default:
        return false;
    }
  });

  const lockedBadges = elements.filter(element => !unlockedBadges.includes(element));

  return (
    <div className="gamification-badges" style={{
      padding: '1rem',
      borderRadius: '8px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)'
    }}>
      <h4 style={{ 
        margin: '0 0 1rem 0', 
        color: 'var(--color-text)',
        fontSize: '1rem',
        fontWeight: 600
      }}>
        Cultural Achievements 🏆
      </h4>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            fontSize: '0.85rem', 
            color: 'var(--color-text-secondary)',
            marginBottom: '0.5rem',
            fontWeight: 500
          }}>
            Unlocked ({unlockedBadges.length})
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '0.75rem'
          }}>
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {/* Shine effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shine 2s infinite'
                }} />
                
                <span style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                  {badge.icon}
                </span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}>
                  {badge.name}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  color: '#fff',
                  opacity: 0.9,
                  marginTop: '0.25rem',
                  fontWeight: 600
                }}>
                  +{badge.xpValue} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <div style={{ 
            fontSize: '0.85rem', 
            color: 'var(--color-text-secondary)',
            marginBottom: '0.5rem',
            fontWeight: 500
          }}>
            Locked ({lockedBadges.length})
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '0.75rem'
          }}>
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'var(--color-background)',
                  border: '2px dashed var(--color-border)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  opacity: 0.6
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '0.6';
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '0.25rem', filter: 'grayscale(100%)' }}>
                  {badge.icon}
                </span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  {badge.name}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '0.25rem'
                }}>
                  🔒
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          onClick={() => setSelectedBadge(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.3s'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4rem' }}>{selectedBadge.icon}</span>
              <h3 style={{ 
                margin: '1rem 0 0.5rem 0', 
                color: 'var(--color-text)',
                fontSize: '1.5rem'
              }}>
                {selectedBadge.name}
              </h3>
              <p style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                {selectedBadge.description}
              </p>
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--color-background)',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.5rem'
                }}>
                  Cultural Reference
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--color-text)',
                  fontStyle: 'italic'
                }}>
                  {selectedBadge.culturalReference}
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: '8px',
                background: unlockedBadges.includes(selectedBadge) 
                  ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
                  : 'var(--color-background)',
                color: unlockedBadges.includes(selectedBadge) ? '#fff' : 'var(--color-text)'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {unlockedBadges.includes(selectedBadge) ? '✓ Unlocked' : '🔒 Locked'}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  +{selectedBadge.xpValue} XP
                </span>
              </div>
              {!unlockedBadges.includes(selectedBadge) && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'var(--color-info)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}>
                  <strong>How to unlock:</strong> {selectedBadge.unlockCondition}
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
