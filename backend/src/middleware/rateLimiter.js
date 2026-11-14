import rateLimit from 'express-rate-limit'

/**
 * General API Rate Limiter
 * 300 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
})

/**
 * Strict Authentication & Login Rate Limiter
 * 15 login attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many consecutive login attempts. Account protected. Please try again after 15 minutes.',
  },
})

