import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tradeService from '../services/tradeService';

export const TRADE_KEYS = {
  all: ['trades'],
  lists: () => [...TRADE_KEYS.all, 'list'],
  list: (filters) => [...TRADE_KEYS.lists(), { filters }],
  details: () => [...TRADE_KEYS.all, 'detail'],
  detail: (id) => [...TRADE_KEYS.details(), id],
};

/**
 * Custom React Query Hook to fetch list of trades
 */
export const useTrades = (filters = {}) => {
  return useQuery({
    queryKey: TRADE_KEYS.list(filters),
    queryFn: () => tradeService.getTrades(filters),
    keepPreviousData: true,
  });
};

/**
 * Custom React Query Hook to fetch single trade
 */
export const useTrade = (id) => {
  return useQuery({
    queryKey: TRADE_KEYS.detail(id),
    queryFn: () => tradeService.getTradeById(id),
    enabled: Boolean(id),
  });
};

/**
 * Custom React Query Hook to create trade
 */
export const useCreateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeData) => tradeService.createTrade(tradeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADE_KEYS.lists() });
    },
  });
};
