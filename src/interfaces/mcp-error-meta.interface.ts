/**
 * High-level error category classification for AI coding agents.
 */
export type McpErrorCategory =
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "CONFLICT"
  | "GENERIC"
  | "INTERNAL"
  | "RATE_LIMIT"
  | "RESOURCE"
  | "TIMEOUT"
  | "VALIDATION";

/**
 * Structured error metadata for AI agent reasoning and autonomous self-healing.
 * Compatible with the Model Context Protocol (MCP) `_meta` specification.
 * @interface
 */
export interface IMcpErrorMeta {
  category: McpErrorCategory;
  code: number;
  recoveryHint: string;
  retryAfter?: number | string;
  retryable: boolean;
}

/**
 * MCP `_meta` wrapper holding structured error diagnostics.
 * @interface
 */
export interface IMcpResultMeta {
  error: IMcpErrorMeta;
  [key: string]: unknown;
}

