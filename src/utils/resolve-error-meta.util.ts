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

  const retryable =
    typeof options?.retryable === "boolean"
      ? options.retryable
      : RETRYABLE_STATUS_CODES.has(statusCode);

  const detailsObj =
    typeof details === "object" && details !== null
      ? (details as Record<string, unknown>)
      : undefined;

  const recoveryHint =
    options?.recoveryHint ??
    (typeof detailsObj?.recoveryHint === "string"
      ? (detailsObj.recoveryHint as string)
      : DEFAULT_RECOVERY_HINTS[category]);

  const retryAfter =
    options?.retryAfter ??
    extractRetryAfterHeader(headers) ??
    (typeof detailsObj?.retryAfter === "number" ||
    typeof detailsObj?.retryAfter === "string"
      ? (detailsObj.retryAfter as number | string)
      : undefined);

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

