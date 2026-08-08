import { z } from 'zod';

export const signalLoginSchema = z.object({
  sessionCookie: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const generateSignalSchema = z.object({
  currencyPair: z.string().min(1, 'Currency pair is required'),
  time: z.string().optional().default('01:00'),
  news: z.string().optional().default('neutral'),
  volatility: z.string().optional().default('High'),
  options: z
    .array(z.string())
    .optional()
    .default(['option1', 'option2', 'option3', 'option4', 'option5', 'option6']),
});
