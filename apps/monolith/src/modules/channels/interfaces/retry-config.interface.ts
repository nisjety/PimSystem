/**
 * Configuration for retry behavior in async operations
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   */
  maxRetries: number;

  /**
   * Base delay between retries in milliseconds
   */
  retryDelay: number;

  /**
   * Whether to use exponential backoff for retry delays
   * If true, each retry will wait retryDelay * (2^attempt)
   * If false, each retry will wait retryDelay milliseconds
   */
  exponentialBackoff?: boolean;
} 