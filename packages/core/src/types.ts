/**
 * Common TypeScript types for cc-devkits
 */

/**
 * Verbose logging option
 */
export interface VerboseOptions {
  verbose?: boolean;
}

/**
 * Common HTTP response
 */
export interface HttpResponse<T = string> {
  statusCode: number;
  body: T;
  headers: Record<string, string>;
}

/**
 * Claude Code context (from stdin)
 */
export interface ClaudeContext {
  cwd?: string;
  session_id?: string;
  model?: string;
  [key: string]: unknown;
}

/**
 * Notification options (common across services)
 */
export interface NotificationOptions {
  title: string;
  message: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max' | 'urgent';
  tags?: string;
  emoji?: string;
  click?: string;
  attach?: string;
  timeout?: number;
  includeCwd?: 'auto' | 'yes' | 'no';
}

/**
 * Environment configuration
 */
export interface EnvConfig {
  [key: string]: string | undefined;
}
