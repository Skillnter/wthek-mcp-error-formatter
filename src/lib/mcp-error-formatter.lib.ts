import type { IMcpErrorPayload } from "../interfaces";
import { formatDetailsText, resolveErrorMeta } from "../utils";
import { mapStatusToMcpCode } from "./map-status-to-mcp-code.lib";

/**
 * Formatter function conforming to `http-error-kit` IFormatter specification.
 * Serializes KitHttpError instances into an MCP-compatible error payload containing
 * JSON-RPC protocol fields, MCP content items, and structured `_meta.error` diagnostics.
 *
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Error message.
 * @param {unknown} [details] - Error details or issues.
 * @returns {IMcpErrorPayload} MCP formatted error payload with `_meta`.
 *
 * @example
 * ```typescript
 * import { KitHttpErrorConfig } from "http-error-kit";
 * import { mcpErrorFormatter } from "@wthek/mcp-error-formatter";
 *
 * KitHttpErrorConfig.configureFormatter(mcpErrorFormatter);
 * ```
 */
export const mcpErrorFormatter = (
  statusCode: number,
  message: string,
  details?: unknown
): IMcpErrorPayload => {
  const code = mapStatusToMcpCode(statusCode);
  const detailsSuffix = formatDetailsText(details);
  const text = `[HTTP ${statusCode}] ${message}${detailsSuffix}`;

  const errorMeta = resolveErrorMeta(statusCode, code, undefined, details);

  const payload: IMcpErrorPayload = {
    _meta: {
      error: errorMeta,
    },
    code,
    content: [
      {
        text,
        type: "text",
      },
    ],
    isError: true,
    message,
  };

  if (details !== undefined) {
    payload.data = details;
  }

  return payload;
};

/**
 * Alias for mcpErrorFormatter adhering to Kit naming convention.
 *
 * @example
 * ```typescript
 * import { KitHttpErrorConfig } from "http-error-kit";
 * import { KitMcpErrorFormatter } from "@wthek/mcp-error-formatter";
 *
 * KitHttpErrorConfig.configureFormatter(KitMcpErrorFormatter);
 * ```
 */
export const KitMcpErrorFormatter = mcpErrorFormatter;
