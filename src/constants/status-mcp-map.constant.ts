import { INTERNAL_SERVER_ERROR } from "http-response-status-code";

import { MCP_ERROR_CODES } from "./mcp-error-codes.constant";

/**
 * HTTP error range boundaries for status code classification.
 * @constant
 */
export const ClassLimits = {
  ClientError: {
    max: 499,
    min: 400,
  },
  ServerError: {
    max: 599,
    min: 500,
  },
} as const;

/**
 * Fallback status code when none is provided by the error instance.
 * @constant {number}
 */
export const FALLBACK_STATUS_CODE: number = INTERNAL_SERVER_ERROR;

/**
 * Mapping table of specific HTTP status codes to standard MCP / JSON-RPC error codes.
 * @constant
 */
export const STATUS_TO_MCP_MAP: Record<number, number> = {
  400: MCP_ERROR_CODES.INVALID_REQUEST,
  401: MCP_ERROR_CODES.UNAUTHORIZED,
  403: MCP_ERROR_CODES.FORBIDDEN,
  404: MCP_ERROR_CODES.NOT_FOUND,
  405: MCP_ERROR_CODES.METHOD_NOT_FOUND,
  408: MCP_ERROR_CODES.TIMEOUT,
  409: MCP_ERROR_CODES.CONFLICT,
  422: MCP_ERROR_CODES.INVALID_PARAMS,
  429: MCP_ERROR_CODES.TOO_MANY_REQUESTS,
  500: MCP_ERROR_CODES.INTERNAL_ERROR,
  501: MCP_ERROR_CODES.METHOD_NOT_FOUND,
  502: MCP_ERROR_CODES.INTERNAL_ERROR,
  503: MCP_ERROR_CODES.TIMEOUT,
  504: MCP_ERROR_CODES.TIMEOUT,
};

