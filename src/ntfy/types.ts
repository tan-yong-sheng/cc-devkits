/**
 * ntfy notification types
 */

export type NtfyPriority = 'min' | 'low' | 'default' | 'high' | 'max' | 'urgent';

export interface NtfyOptions {
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Priority level (default: 'default') */
  priority?: NtfyPriority;
  /** Emoji or tag to display */
  tags?: string[];
  /** URL to open when notification is clicked */
  click?: string;
  /** URL to attach file/image */
  attach?: string;
  /** Request timeout in seconds (default: 10) */
  timeout?: number;
  /** ntfy topic (default: from NTFY_TOPIC env var) */
  topic?: string;
  /** ntfy server URL (default: from NTFY_BASE_URL env var) */
  baseUrl?: string;
  /** API key for authentication (default: from NTFY_API_KEY env var) */
  apiKey?: string;
}

export interface NtfyConfig {
  /** ntfy server URL */
  baseUrl: string;
  /** ntfy topic */
  topic: string;
  /** API key for authentication */
  apiKey?: string;
  /** Default priority */
  defaultPriority?: NtfyPriority;
}

export interface NtfyResponse {
  /** Message ID */
  id: string;
  /** Time when message was published */
  time: number;
  /** Event type */
  event: string;
  /** Topic name */
  topic: string;
  /** Message content */
  message?: string;
  /** Title */
  title?: string;
  /** Priority */
  priority?: number;
  /** Tags */
  tags?: string[];
}
