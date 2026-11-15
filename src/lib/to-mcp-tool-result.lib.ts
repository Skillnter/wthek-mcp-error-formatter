import type { IMcpToolResult, IMcpToolResultOptions } from "../interfaces";
import {
  extractErrorComponents,
  formatDetailsText,
  resolveErrorMeta,
} from "../utils";
import { mapStatusToMcpCode } from "./map-status-to-mcp-code.lib";

/**
 * Converts any caught error into a standard Model Context Protocol (MCP) tool result.
 * Returned directly from MCP tool handlers to provide AI agents with clear, actionable error feedback,
 * enriched with optional structured `_meta.error` diagnostics for autonomous self-healing.
 *
 * @param {unknown} error - The caught error (KitHttpError, KitGeneralError, Error, or unknown).
 * @param {IMcpToolResultOptions} [options] - Formatting and metadata options.
 * @returns {IMcpToolResult} An MCP tool call result with `isError: true` and structured `_meta`.
 *
 * @example
 * ```typescript
 * import { toMcpToolResult } from "@wthek/mcp-error-formatter";
 * import { NotFoundError } from "http-error-kit";
 *
 * server.tool("get_user", async ({ id }) => {
 *   try {
 *     const user = await db.find(id);
 *     if (!user) throw new NotFoundError(`User ${id} not found`);
 *     return { content: [{ type: "text", text: JSON.stringify(user) }] };
 *   } catch (err) {
 *     return toMcpToolResult(err);
 *   }
 * });
 * ```
 */
export const toMcpToolResult = (
  error: unknown,
  options?: IMcpToolResultOptions
): IMcpToolResult => {
  const { details, headers, message, statusCode } =
    extractErrorComponents(error);
  const includeStatus = options?.includeStatusCode ?? true;
  const includeDetails = options?.includeDetails ?? true;
  const includeMeta = options?.includeMeta ?? true;

  const statusPrefix = includeStatus ? `[HTTP ${statusCode}] ` : "";
  const detailsSuffix = includeDetails ? formatDetailsText(details) : "";
  const fullText = `${statusPrefix}${message}${detailsSuffix}`;

  const result: IMcpToolResult = {
    content: [
      {
        text: fullText,
        type: "text",
      },
    ],
    isError: true,
  };

  if (includeMeta) {
    const mcpCode = mapStatusToMcpCode(statusCode);
    const errorMeta = resolveErrorMeta(
      statusCode,
      mcpCode,
      headers,
      details,
      options
    );
    result._meta = {
      error: errorMeta,
    };
  }

  return result;
};
