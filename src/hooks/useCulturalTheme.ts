import { useState, useEffect } from 'react';
import { 
  culturalThemeService, 
  ColorScheme, 
  FestivalEvent, 
  GamificationElement,
  CulturalTheme 
} from '@/src/services/CulturalThemeService';
import { IndianRegion } from '@/src/types/localization';

/**
 * React hook for accessing cultural theme features
 */
export function useCulturalTheme(region: IndianRegion) {
  const [theme, setTheme] = useState<CulturalTheme>(() => 
    culturalThemeService.getTheme(region)
  );
  const [upcomingFestivals, setUpcomingFestivals] = useState<FestivalEvent[]>([]);
  const [todaysFestival, setTodaysFestival] = useState<FestivalEvent | null>(null);

  useEffect(() => {
    // Update theme when region changes
    const newTheme = culturalThemeService.getTheme(region);
    setTheme(newTheme);

    // Apply theme to CSS variables
    culturalThemeService.applyCulturalTheme(region);

    // Get upcoming festivals
    const festivals = culturalThemeService.getUpcomingFestivals(region, 30);
    setUpcomingFestivals(festivals);

    // Check if today is a festival
    const festival = culturalThemeService.isFestivalToday(region);
    setTodaysFestival(festival);
  }, [region]);

  return {
    theme,
    colorScheme: theme.colorScheme,
    patterns: theme.patterns,
    icons: theme.icons,
    gamificationElements: theme.gamificationElements,
    upcomingFestivals,
    todaysFestival,
    applyCulturalTheme: () => culturalThemeService.applyCulturalTheme(region),
    getUpcomingFestivals: (days: number) => 
      culturalThemeService.getUpcomingFestivals(region, days),
    isFestivalToday: () => culturalThemeService.isFestivalToday(region)
  };
}

/**
 * Hook for accessing color scheme only
 */
export function useColorScheme(region: IndianRegion): ColorScheme {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => 
    culturalThemeService.getColorScheme(region)
  );

  useEffect(() => {
    const newColorScheme = culturalThemeService.getColorScheme(region);
    setColorScheme(newColorScheme);
  }, [region]);

  return colorScheme;
}

/**
 * Hook for accessing festival calendar
 */
export function useFestivalCalendar(region: IndianRegion) {
  const [upcomingFestivals, setUpcomingFestivals] = useState<FestivalEvent[]>([]);
  const [todaysFestival, setTodaysFestival] = useState<FestivalEvent | null>(null);

  useEffect(() => {
    const festivals = culturalThemeService.getUpcomingFestivals(region, 30);
    setUpcomingFestivals(festivals);

    const festival = culturalThemeService.isFestivalToday(region);
    setTodaysFestival(festival);

    // Update daily at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      const newFestival = culturalThemeService.isFestivalToday(region);
      setTodaysFestival(newFestival);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [region]);

  return {
    upcomingFestivals,
    todaysFestival,
    getUpcomingFestivals: (days: number) => 
      culturalThemeService.getUpcomingFestivals(region, days),
    getFestivalByDate: (date: Date) => 
      culturalThemeService.getFestivalByDate(date, region)
  };
}

/**
 * Hook for accessing gamification elements
 */
export function useGamification(region: IndianRegion) {
  const [elements, setElements] = useState<GamificationElement[]>([]);

  useEffect(() => {
    const gamificationElements = culturalThemeService.getGamificationElements(region);
    setElements(gamificationElements);
  }, [region]);

  return {
    elements,
    getElementByCondition: (condition: string) => 
      elements.find(el => el.unlockCondition === condition),
    getTotalXP: () => 
      elements.reduce((sum, el) => sum + el.xpValue, 0)
  };
}
