import type { McpErrorCategory } from "./mcp-error-meta.interface";

/**
 * Configuration options for converting errors into MCP tool results.
 * @interface
 */
export interface IMcpToolResultOptions {
  category?: McpErrorCategory;
  includeDetails?: boolean;
  includeMeta?: boolean;
  includeStatusCode?: boolean;
  recoveryHint?: string;
  retryAfter?: number | string;
  retryable?: boolean;
}
