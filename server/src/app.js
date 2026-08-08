import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import config from './config/index.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';
import notFoundHandler from './middlewares/notFound.middleware.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS with credentials for HTTP-only cookies
const allowedOrigins = [
  config.corsOrigin,
  'https://trading-assistant-ivory-nine.vercel.app',
  'http://trading-assistant-ivory-nine.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed = allowedOrigins.some((allowed) => {
        if (!allowed) return false;
        const cleanAllowed = allowed.replace(/\/$/, '');
        return (
          cleanOrigin === cleanAllowed ||
          cleanOrigin.replace(/^https?:\/\//, '') === cleanAllowed.replace(/^https?:\/\//, '')
        );
      });

      if (isAllowed) {
        callback(null, origin);
      } else {
        // Fallback reflect requested origin for credentials support
        callback(null, origin);
      }
    },
    credentials: true,
  })
);

// HTTP request logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting configuration (2,000 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2,000 requests per 15 minutes
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2,000 requests per 15 minutes
  message: {
    status: 'fail',
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api', apiLimiter);

// Cookie Parser
app.use(cookieParser());

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// API v1 Routes
app.use('/api/v1', routes);

// Handle Unhandled Routes (404)
app.use(notFoundHandler);

// Centralized Global Error Handling Middleware
app.use(errorHandler);

export default app;
