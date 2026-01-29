/**
 * Comprehensive error handling utilities
 */

import { NextResponse } from 'next/server';
import { ErrorResponse, ApiResponse } from '@/types';

/**
 * Custom error classes
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_ERROR');
    this.name = 'InternalServerError';
  }
}

/**
 * Format error response
 */
export function formatErrorResponse(error: Error | AppError): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: error.name,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: 'Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create error response for API
 */
export function createErrorResponse<T = null>(
  statusCode: number,
  error: string,
  message: string,
  code?: string
): ApiResponse<T> {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle API errors with proper HTTP response
 */
export function handleError(error: Error | AppError): NextResponse {
  // Log error
  console.error('[API Error]', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      createErrorResponse(error.statusCode, error.name, error.message, error.code),
      { status: error.statusCode }
    );
  }

  // Unknown error - return 500
  return NextResponse.json(
    createErrorResponse(
      500,
      'InternalServerError',
      error.message || 'An unexpected error occurred'
    ),
    { status: 500 }
  );
}

/**
 * Validate required environment variables
 */
export function validateEnv(required: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Parse and validate JSON safely
 */
export function safeJsonParse<T = any>(data: string): T | null {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  pageSize?: string | number,
  page?: string | number
): { pageSize: number; page: number } {
  const size = Math.min(Math.max(parseInt(String(pageSize)) || 20, 1), 100);
  const p = Math.max(parseInt(String(page)) || 1, 1);

  return { pageSize: size, page: p };
}

/**
 * Validate date range
 */
export function validateDateRange(start?: string, end?: string): {
  startDate?: Date;
  endDate?: Date;
  error?: string;
} {
  try {
    const result: { startDate?: Date; endDate?: Date; error?: string } = {};

    if (start) {
      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return { error: 'Invalid start date format' };
      }
      result.startDate = startDate;
    }

    if (end) {
      const endDate = new Date(end);
      if (isNaN(endDate.getTime())) {
        return { error: 'Invalid end date format' };
      }
      result.endDate = endDate;
    }

    if (result.startDate && result.endDate && result.startDate > result.endDate) {
      return { error: 'Start date must be before end date' };
    }

    return result;
  } catch (error) {
    return { error: 'Date validation failed' };
  }
}

/**
 * Try-catch wrapper for async functions
 */
export function asyncHandler(
  fn: (req: any, res: any) => Promise<any>
) {
  return (req: any, res: any) => {
    return Promise.resolve(fn(req, res)).catch((error) => {
      return handleError(error);
    });
  };
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Circuit breaker for API calls
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly maxFailures: number = 5,
    private readonly resetTimeoutMs: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should reset
    if (
      this.state === 'OPEN' &&
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime > this.resetTimeoutMs
    ) {
      this.state = 'HALF_OPEN';
      this.failureCount = 0;
    }

    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await fn();

      // Success - reset if half-open
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.maxFailures) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = undefined;
  }
}

/**
 * Error logger with context
 */
export class ErrorLogger {
  static log(
    error: Error,
    context?: Record<string, any>,
    level: 'error' | 'warn' | 'info' = 'error'
  ): void {
    const timestamp = new Date().toISOString();
    const message = {
      timestamp,
      level,
      error: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    };

    console[level === 'warn' ? 'warn' : level === 'info' ? 'log' : 'error'](
      `[${level.toUpperCase()}]`,
      JSON.stringify(message)
    );
  }

  static async logAsync(
    fn: () => Promise<any>,
    context?: Record<string, any>
  ): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      this.log(error instanceof Error ? error : new Error(String(error)), context);
      throw error;
    }
  }
}
