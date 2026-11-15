import {
  ClassLimits,
  MCP_ERROR_CODES,
  STATUS_TO_MCP_MAP,
} from "../constants";

/**
 * Maps an HTTP status code to a corresponding standard MCP / JSON-RPC 2.0 error code.
 *
 * @param {number} statusCode - The HTTP status code to map.
 * @returns {number} The corresponding JSON-RPC / MCP error code.
 *
 * @example
 * ```typescript
 * import { mapStatusToMcpCode } from "@wthek/mcp-error-formatter";
 *
 * const code = mapStatusToMcpCode(404); // -32004
 * ```
 */
export const mapStatusToMcpCode = (statusCode: number): number => {
  const directMapping = STATUS_TO_MCP_MAP[statusCode];
  if (directMapping !== undefined) {
    return directMapping;
  }

  if (
    statusCode >= ClassLimits.ServerError.min &&
    statusCode <= ClassLimits.ServerError.max
  ) {
    return MCP_ERROR_CODES.INTERNAL_ERROR;
  }

  if (
    statusCode >= ClassLimits.ClientError.min &&
    statusCode <= ClassLimits.ClientError.max
  ) {
    return MCP_ERROR_CODES.INVALID_PARAMS;
  }

  return MCP_ERROR_CODES.GENERIC_ERROR;
};

