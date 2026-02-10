/**
 * Serper API types
 */

export interface SearchOptions {
  /** Search query */
  query: string;
  /** Number of results (default: 10) */
  num?: number;
  /** Country code (default: 'us') */
  gl?: string;
  /** Language code (default: 'en') */
  hl?: string;
  /** Geographic location */
  location?: string;
  /** Page number (default: 1) */
  page?: number;
  /** API key (falls back to SERPER_API_KEY env var) */
  apiKey?: string;
  /** Verbose logging */
  verbose?: boolean;
}

export interface ScrapeOptions {
  /** URL to scrape */
  url: string;
  /** Include markdown output */
  markdown?: boolean;
  /** API key (falls back to SERPER_API_KEY env var) */
  apiKey?: string;
  /** Verbose logging */
  verbose?: boolean;
}

export interface SearchResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
}

export interface SearchResponse {
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
    num: number;
    page: number;
  };
  organic?: SearchResult[];
  knowledgeGraph?: unknown;
  answerBox?: unknown;
}

export interface ScrapeResponse {
  url: string;
  title?: string;
  text?: string;
  markdown?: string;
  links?: string[];
  images?: string[];
}
