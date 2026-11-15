import {
  ClassLimits,
  DEFAULT_RECOVERY_HINTS,
  RETRYABLE_STATUS_CODES,
  STATUS_TO_CATEGORY_MAP,
} from "../constants";
import type {
  IMcpErrorMeta,
  IMcpToolResultOptions,
  McpErrorCategory,
} from "../interfaces";

/**
 * Extracts a normalized Retry-After header value if present.
 */
const extractRetryAfterHeader = (
  headers?: Record<string, string>
): number | string | undefined => {
  if (!headers) return undefined;

  const headerVal = headers["retry-after"] ?? headers["Retry-After"];
  if (!headerVal) return undefined;

  const numeric = Number(headerVal);
  return Number.isNaN(numeric) ? headerVal : numeric;
};

/**
 * Safely casts an unknown value to a non-null object record if applicable.
 */
const asObjectRecord = (
  value?: unknown
): Record<string, unknown> | undefined => {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
};

/**
 * Resolves the appropriate error category from status code, options, or range fallbacks.
 */
const resolveCategory = (
  statusCode: number,
  options?: IMcpToolResultOptions
): McpErrorCategory => {
  if (options?.category) {
    return options.category;
  }

  const direct = STATUS_TO_CATEGORY_MAP[statusCode];
  if (direct) {
    return direct;
  }

  if (
    statusCode >= ClassLimits.ServerError.min &&
    statusCode <= ClassLimits.ServerError.max
  ) {
    return "INTERNAL";
  }

  if (
    statusCode >= ClassLimits.ClientError.min &&
    statusCode <= ClassLimits.ClientError.max
  ) {
    return "VALIDATION";
  }

  return "GENERIC";
};

/**
 * Resolves whether an error is retryable based on options or HTTP status codes.
 */
const resolveRetryable = (
  statusCode: number,
  options?: IMcpToolResultOptions
): boolean => {
  return typeof options?.retryable === "boolean"
    ? options.retryable
    : RETRYABLE_STATUS_CODES.has(statusCode);
};

/**
 * Resolves an actionable recovery hint from options, details, or default dictionary.
 */
const resolveRecoveryHint = (
  category: McpErrorCategory,
  detailsObj?: Record<string, unknown>,
  options?: IMcpToolResultOptions
): string => {
  if (options?.recoveryHint) {
    return options.recoveryHint;
  }

  if (typeof detailsObj?.recoveryHint === "string") {
    return detailsObj.recoveryHint;
  }

  return DEFAULT_RECOVERY_HINTS[category];
};

/**
 * Resolves retry delay in seconds or timestamp from options, headers, or details.
 */
const resolveRetryAfter = (
  headers?: Record<string, string>,
  detailsObj?: Record<string, unknown>,
  options?: IMcpToolResultOptions
): number | string | undefined => {
  if (options?.retryAfter !== undefined) {
    return options.retryAfter;
  }

  const fromHeader = extractRetryAfterHeader(headers);
  if (fromHeader !== undefined) {
    return fromHeader;
  }

  const detailsVal = detailsObj?.retryAfter;
  if (typeof detailsVal === "number" || typeof detailsVal === "string") {
    return detailsVal;
  }

  return undefined;
};

/**
 * Resolves structured MCP error metadata for AI agent reasoning and autonomous self-healing.
 *
 * @param {number} statusCode - HTTP status code.
 * @param {number} mcpCode - Standard MCP / JSON-RPC error code.
 * @param {Record<string, string>} [headers] - Response headers (e.g. Retry-After).
 * @param {unknown} [details] - Error details payload.
 * @param {IMcpToolResultOptions} [options] - Optional custom overrides.
 * @returns {IMcpErrorMeta} Structured, sanitized error metadata.
 *
 * @example
 * ```typescript
 * const meta = resolveErrorMeta(429, -32029, { "retry-after": "30" });
 * // { category: "RATE_LIMIT", code: -32029, recoveryHint: "...", retryable: true, retryAfter: 30 }
 * ```
 */
export const resolveErrorMeta = (
  statusCode: number,
  mcpCode: number,
  headers?: Record<string, string>,
  details?: unknown,
  options?: IMcpToolResultOptions
): IMcpErrorMeta => {
  const category = resolveCategory(statusCode, options);
  const detailsObj = asObjectRecord(details);
  const retryable = resolveRetryable(statusCode, options);
  const recoveryHint = resolveRecoveryHint(category, detailsObj, options);
  const retryAfter = resolveRetryAfter(headers, detailsObj, options);

  const meta: IMcpErrorMeta = {
    category,
    code: mcpCode,
    recoveryHint,
    retryable,
  };

  if (retryAfter !== undefined) {
    meta.retryAfter = retryAfter;
  }

  return meta;
};
