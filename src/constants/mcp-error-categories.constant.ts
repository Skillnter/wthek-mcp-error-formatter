import type { McpErrorCategory } from "../interfaces/mcp-error-meta.interface";

/**
 * Mapping of HTTP status codes to standardized error categories.
 * @constant
 *
 * @example
 * ```typescript
 * import { STATUS_TO_CATEGORY_MAP } from "@wthek/mcp-error-formatter";
 *
 * const category = STATUS_TO_CATEGORY_MAP[404]; // "RESOURCE"
 * ```
 */
export const STATUS_TO_CATEGORY_MAP: Record<number, McpErrorCategory> = {
  400: "VALIDATION",
  401: "AUTHENTICATION",
  403: "AUTHORIZATION",
  404: "RESOURCE",
  405: "RESOURCE",
  408: "TIMEOUT",
  409: "CONFLICT",
  410: "RESOURCE",
  422: "VALIDATION",
  429: "RATE_LIMIT",
  500: "INTERNAL",
  501: "INTERNAL",
  502: "INTERNAL",
  503: "TIMEOUT",
  504: "TIMEOUT",
};

/**
 * Set of HTTP status codes that represent transient, retryable errors.
 * @constant
 *
 * @example
 * ```typescript
 * import { RETRYABLE_STATUS_CODES } from "@wthek/mcp-error-formatter";
 *
 * const isRetryable = RETRYABLE_STATUS_CODES.has(503); // true
 * ```
 */
export const RETRYABLE_STATUS_CODES = new Set<number>([
  408, // Request Timeout
  429, // Too Many Requests
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

/**
 * Standard recovery hints guiding agent self-correction.
 * @constant
 *
 * @example
 * ```typescript
 * import { DEFAULT_RECOVERY_HINTS } from "@wthek/mcp-error-formatter";
 *
 * const hint = DEFAULT_RECOVERY_HINTS["VALIDATION"];
 * ```
 */
export const DEFAULT_RECOVERY_HINTS: Record<McpErrorCategory, string> = {
  AUTHENTICATION: "Provide valid authentication credentials.",
  AUTHORIZATION: "Ensure the caller has required permissions to perform this operation.",
  CONFLICT: "Resolve conflicting resource state before repeating the request.",
  GENERIC: "An unexpected error occurred. Review the error message for details.",
  INTERNAL: "An internal server error occurred. Inspect server logs or retry later.",
  RATE_LIMIT: "Rate limit reached. Reduce request frequency and wait before retrying.",
  RESOURCE: "Verify that the requested resource identifier exists.",
  TIMEOUT: "The operation timed out. Verify network connectivity and retry.",
  VALIDATION: "Verify tool arguments against the required schema and correct validation errors.",
};

