/**
 * Standard Model Context Protocol (MCP) and JSON-RPC 2.0 error codes.
 *
 * @constant
 *
 * @example
 * ```typescript
 * import { MCP_ERROR_CODES } from "@wthek/mcp-error-formatter";
 *
 * console.log(MCP_ERROR_CODES.NOT_FOUND); // -32004
 * ```
 */
export const MCP_ERROR_CODES = {
  CONFLICT: -32009,
  FORBIDDEN: -32003,
  GENERIC_ERROR: -32000,
  INTERNAL_ERROR: -32603,
  INVALID_PARAMS: -32602,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  NOT_FOUND: -32004,
  PARSE_ERROR: -32700,
  TIMEOUT: -32008,
  TOO_MANY_REQUESTS: -32029,
  UNAUTHORIZED: -32001,
} as const;
