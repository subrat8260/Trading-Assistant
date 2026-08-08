import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['dark', 'light']).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR']).optional(),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  defaultLeverage: z.number().min(1).max(100).optional(),
});
