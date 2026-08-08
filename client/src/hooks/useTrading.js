import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tradingService from '../services/tradingService';

export const TRADING_KEYS = {
  all: ['trading'],
  currentSession: () => [...TRADING_KEYS.all, 'current-session'],
  history: (filters) => [...TRADING_KEYS.all, 'history', { filters }],
};

/**
 * Hook to get current active trading session
 */
export const useCurrentSession = () => {
  return useQuery({
    queryKey: TRADING_KEYS.currentSession(),
    queryFn: () => tradingService.getCurrentSession(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to start a new session
 */
export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => tradingService.startSession(data),
    onSuccess: (res) => {
      const newSession = res?.data?.session;
      if (newSession) {
        queryClient.setQueryData(TRADING_KEYS.currentSession(), (old) => ({
          ...old,
          data: {
            session: newSession,
            recentTrades: [],
          },
        }));
      }
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.currentSession() });
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.all });
    },
  });
};

/**
 * Hook to record trade result (WIN / LOSS)
 */
export const useRecordResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => tradingService.recordResult(data),
    onSuccess: (res) => {
      const updatedSession = res?.data?.session;
      const newTradeLog = res?.data?.tradeLog;

      if (updatedSession) {
        queryClient.setQueryData(TRADING_KEYS.currentSession(), (old) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              session: updatedSession,
              recentTrades: newTradeLog
                ? [newTradeLog, ...(old.data?.recentTrades || [])]
                : old.data?.recentTrades,
            },
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.currentSession() });
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.all });
    },
  });
};

/**
 * Hook to reset current session
 */
export const useResetSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => tradingService.resetSession(data),
    onSuccess: (res) => {
      const updatedSession = res?.data?.session;
      queryClient.setQueryData(TRADING_KEYS.currentSession(), (old) => ({
        ...old,
        data: {
          session: updatedSession || null,
          recentTrades: [],
        },
      }));
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.currentSession() });
      queryClient.invalidateQueries({ queryKey: TRADING_KEYS.all });
    },
  });
};

/**
 * Hook to fetch trade history
 */
export const useTradeHistory = (params = {}) => {
  return useQuery({
    queryKey: TRADING_KEYS.history(params),
    queryFn: () => tradingService.getTradeHistory(params),
  });
};

/**
 * Hook to generate signal from Signal24x7
 */
export const useGenerateSignal = () => {
  return useMutation({
    mutationFn: (data) => tradingService.generateSignal(data),
  });
};
