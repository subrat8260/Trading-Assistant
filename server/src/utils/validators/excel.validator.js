import { z } from 'zod';

export const calculateMasanielloSchema = z.object({
  initialCapital: z.number().positive('Initial capital must be positive').optional().default(100),
  totalEvents: z.number().int().min(1).max(100).optional().default(6),
  expectedWins: z.number().int().min(1).optional().default(1),
  quota: z.number().positive('Quota/Odds must be positive').optional().default(1.82),
  masanielloType: z.enum(['normale']).optional().default('normale'),
  tradeResults: z.array(z.enum(['w', 'l', ''])).optional().default([]),
});
