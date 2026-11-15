import type { IMcpProtocolError } from "../interfaces";
import { extractErrorComponents } from "../utils";
import { mapStatusToMcpCode } from "./map-status-to-mcp-code.lib";

/**
 * Converts any caught error into a JSON-RPC 2.0 protocol error structure.
 *
 * @param {unknown} error - The caught error.
 * @returns {IMcpProtocolError} Standard JSON-RPC protocol error object.
 *
 * @example
 * ```typescript
 * import { toMcpProtocolError } from "@wthek/mcp-error-formatter";
 *
 * const rpcError = toMcpProtocolError(new BadRequestError("Invalid payload", { id: "required" }));
 * // { code: -32602, message: "Invalid payload", data: { id: "required" } }
 * ```
 */
export const toMcpProtocolError = (error: unknown): IMcpProtocolError => {
  const { details, message, statusCode } = extractErrorComponents(error);
  const code = mapStatusToMcpCode(statusCode);

  const result: IMcpProtocolError = {
    code,
    message,
  };

  if (details !== undefined) {
    result.data = details;
  }

  return result;
};

