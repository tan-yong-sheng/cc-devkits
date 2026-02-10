/**
 * Retry utilities - Exponential backoff with jitter
 */


export interface RetryOptions<T> {
  fn: () => Promise<T>;
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  jitter?: number;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  attempts: number;
  result?: T;
  error?: Error;
}

/**
 * Default retry predicate - retries on all errors except auth failures
 */
function defaultShouldRetry(error: Error): boolean {
  const message = error.message.toLowerCase();
  // Don't retry on authentication errors
  if (message.includes('401') || message.includes('403') || message.includes('authentication')) {
    return false;
  }
  return true;
}

/**
 * Retry a function with exponential backoff and jitter
 */
export async function retry<T>(options: RetryOptions<T>): Promise<T> {
  const {
    fn,
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    jitter = 100,
    onRetry,
    shouldRetry = defaultShouldRetry,
  } = options;

  let attempt = 1;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (!shouldRetry(err)) {
        throw err;
      }

      // Check if we've exhausted attempts
      if (attempt >= maxAttempts) {
        throw err;
      }

      // Call retry callback
      if (onRetry) {
        onRetry(err, attempt, delay);
      }

      // Wait with jitter
      const jitterAmount = Math.floor(Math.random() * jitter);
      await new Promise((resolve) => setTimeout(resolve, delay + jitterAmount));

      // Exponential backoff
      delay = Math.min(delay * 2, maxDelay);
      attempt++;
    }
  }
}

/**
 * Retry with result tracking
 */
export async function retryWithResult<T>(options: RetryOptions<T>): Promise<RetryResult<T>> {
  try {
    const result = await retry(options);
    return {
      success: true,
      attempts: 1,
      result,
    };
  } catch (error) {
    return {
      success: false,
      attempts: options.maxAttempts || 3,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
