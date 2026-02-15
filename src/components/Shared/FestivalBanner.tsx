import React from 'react';
import { useFestivalCalendar } from '@/src/hooks/useCulturalTheme';
import { IndianRegion } from '@/src/types/localization';

interface FestivalBannerProps {
  region: IndianRegion;
  onClose?: () => void;
}

/**
 * Festival Banner Component
 * Displays a banner when it's a festival day
 */
export const FestivalBanner: React.FC<FestivalBannerProps> = ({ region, onClose }) => {
  const { todaysFestival } = useFestivalCalendar(region);

  if (!todaysFestival) {
    return null;
  }

  return (
    <div 
      className="festival-banner"
      style={{
        backgroundColor: todaysFestival.colorTheme,
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>{todaysFestival.icon}</span>
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>
            Happy {todaysFestival.name}! 🎉
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', color: '#fff', opacity: 0.9, fontSize: '0.9rem' }}>
            {todaysFestival.description}
          </p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * Upcoming Festivals Widget
 * Shows upcoming festivals in a compact widget
 */
export const UpcomingFestivalsWidget: React.FC<{ region: IndianRegion }> = ({ region }) => {
  const { upcomingFestivals } = useFestivalCalendar(region);

  if (upcomingFestivals.length === 0) {
    return null;
  }

  return (
    <div className="upcoming-festivals-widget" style={{
      padding: '1rem',
      borderRadius: '8px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      marginTop: '1rem'
    }}>
      <h4 style={{ 
        margin: '0 0 0.75rem 0', 
        color: 'var(--color-text)',
        fontSize: '1rem',
        fontWeight: 600
      }}>
        Upcoming Festivals 🎊
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {upcomingFestivals.slice(0, 3).map((festival) => {
          const daysUntil = Math.ceil(
            (festival.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return (
            <div 
              key={festival.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '6px',
                background: 'var(--color-background)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{festival.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 500, 
                  color: 'var(--color-text)',
                  fontSize: '0.9rem'
                }}>
                  {festival.name}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px'
                }}>
                  {daysUntil === 0 ? 'Today' : 
                   daysUntil === 1 ? 'Tomorrow' : 
                   `In ${daysUntil} days`}
                </div>
              </div>
              {festival.isNational && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 500
                }}>
                  National
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
