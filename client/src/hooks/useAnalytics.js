import { useQuery } from '@tanstack/react-query';
import analyticsService from '../services/analyticsService';

export const ANALYTICS_KEYS = {
  all: ['analytics'],
  overview: (filters) => [...ANALYTICS_KEYS.all, 'overview', { filters }],
  performance: (filters) => [...ANALYTICS_KEYS.all, 'performance', { filters }],
  charts: (filters) => [...ANALYTICS_KEYS.all, 'charts', { filters }],
  history: (filters) => [...ANALYTICS_KEYS.all, 'history', { filters }],
};

export const useAnalyticsOverview = (filters = {}) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.overview(filters),
    queryFn: () => analyticsService.getOverview(filters),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

export const useAnalyticsPerformance = (filters = {}) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.performance(filters),
    queryFn: () => analyticsService.getPerformance(filters),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

export const useAnalyticsCharts = (filters = {}) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.charts(filters),
    queryFn: () => analyticsService.getCharts(filters),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

export const useAnalyticsHistory = (filters = {}) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.history(filters),
    queryFn: () => analyticsService.getHistory(filters),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};
