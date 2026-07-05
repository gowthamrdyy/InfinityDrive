// ============================================
// InfinityDrive — Exponential Backoff Utility
// ============================================
// Wraps async operations (especially Google Drive API calls) with
// automatic retry logic using exponential backoff + jitter.
// Handles 403 (Rate Limit Exceeded) and 429 (Too Many Requests).

interface BackoffOptions {
  maxRetries?: number;
  baseDelay?: number;  // milliseconds
  maxDelay?: number;   // milliseconds
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

/**
 * Wraps an async function with exponential backoff retry logic.
 * 
 * On retryable errors (403/429), waits 2^attempt * baseDelay ms (with jitter)
 * before retrying. Gives up after maxRetries.
 * 
 * @param fn - Async function to execute
 * @param options - Backoff configuration
 * @returns Result of fn()
 * @throws Last error if all retries exhausted
 */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  options: BackoffOptions = {}
): Promise<T> {
  const {
    maxRetries = 5,
    baseDelay = 1000,
    maxDelay = 32000,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if the error is retryable (rate limit)
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay: 2^attempt * baseDelay, capped at maxDelay
      const exponentialDelay = Math.min(
        Math.pow(2, attempt) * baseDelay,
        maxDelay
      );

      // Add jitter (±25%) to prevent thundering herd
      const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
      const delay = Math.round(exponentialDelay + jitter);

      // Notify caller of retry
      if (onRetry) {
        onRetry(attempt + 1, lastError, delay);
      } else {
        console.warn(
          `[Backoff] Attempt ${attempt + 1}/${maxRetries} failed. ` +
          `Retrying in ${delay}ms... Error: ${lastError.message}`
        );
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Backoff exhausted with no error');
}

/**
 * Check if a Google API error is retryable (rate limited).
 */
function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { code?: number; status?: number; response?: { status?: number } };

  // Direct status codes
  const status = err.code || err.status || err.response?.status;
  if (status === 403 || status === 429) return true;

  // Check error message for rate limit keywords
  const message = (error as Error).message?.toLowerCase() || '';
  return (
    message.includes('rate limit') ||
    message.includes('quota exceeded') ||
    message.includes('too many requests') ||
    message.includes('user rate limit exceeded')
  );
}

/**
 * Promise-based sleep utility.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
