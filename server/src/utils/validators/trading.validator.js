import { z } from 'zod';

export const startSessionSchema = z.object({
  capital: z.number().positive('Initial capital must be positive').optional().default(25670),
  trades: z.number().int().min(1).max(100).optional().default(6),
  winsRequired: z.number().int().min(1).optional().default(1),
  payout: z.number().positive('Payout quota must be positive').optional().default(1.82),
});

export const recordResultSchema = z.object({
  sessionId: z.string().optional(),
  result: z.enum(['W', 'L', 'w', 'l'], {
    errorMap: () => ({ message: 'Result must be W or L' }),
  }),
  pair: z.string().min(1, 'Trading pair is required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  signal: z.string().min(1, 'Signal direction is required'),
  strength: z.string().optional().default(''),
  analyzer: z.string().optional().default(''),
});
