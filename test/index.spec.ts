import {
  BadRequestError,
  KitHttpError,
  KitHttpErrorConfig,
  NotFoundError,
} from "http-error-kit";
import {
  ClassLimits,
  DEFAULT_RECOVERY_HINTS,
  KitMcpErrorFormatter,
  MCP_ERROR_CODES,
  RETRYABLE_STATUS_CODES,
  STATUS_TO_CATEGORY_MAP,
  mapStatusToMcpCode,
  mcpErrorFormatter,
  resolveErrorMeta,
  toMcpProtocolError,
  toMcpToolResult,
} from "../src";

describe("*** Testing MCP_ERROR_CODES and Constants ***", () => {
  it("should verify standard MCP error code values", () => {
    expect(MCP_ERROR_CODES.PARSE_ERROR).toBe(-32700);
    expect(MCP_ERROR_CODES.INVALID_REQUEST).toBe(-32600);
    expect(MCP_ERROR_CODES.METHOD_NOT_FOUND).toBe(-32601);
    expect(MCP_ERROR_CODES.INVALID_PARAMS).toBe(-32602);
    expect(MCP_ERROR_CODES.INTERNAL_ERROR).toBe(-32603);
    expect(MCP_ERROR_CODES.UNAUTHORIZED).toBe(-32001);
    expect(MCP_ERROR_CODES.FORBIDDEN).toBe(-32003);
    expect(MCP_ERROR_CODES.NOT_FOUND).toBe(-32004);
    expect(MCP_ERROR_CODES.TIMEOUT).toBe(-32008);
    expect(MCP_ERROR_CODES.CONFLICT).toBe(-32009);
    expect(MCP_ERROR_CODES.TOO_MANY_REQUESTS).toBe(-32029);
    expect(MCP_ERROR_CODES.GENERIC_ERROR).toBe(-32000);
  });

  it("should verify exported constants", () => {
    expect(ClassLimits.ClientError.min).toBe(400);
    expect(ClassLimits.ServerError.max).toBe(599);
    expect(DEFAULT_RECOVERY_HINTS.VALIDATION).toBeDefined();
    expect(RETRYABLE_STATUS_CODES.has(429)).toBe(true);
    expect(STATUS_TO_CATEGORY_MAP[404]).toBe("RESOURCE");
  });
});

describe("*** Testing mapStatusToMcpCode ***", () => {
  it("should map specific HTTP status codes to corresponding MCP codes", () => {
    expect(mapStatusToMcpCode(400)).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
    expect(mapStatusToMcpCode(401)).toBe(MCP_ERROR_CODES.UNAUTHORIZED);
    expect(mapStatusToMcpCode(403)).toBe(MCP_ERROR_CODES.FORBIDDEN);
    expect(mapStatusToMcpCode(404)).toBe(MCP_ERROR_CODES.NOT_FOUND);
    expect(mapStatusToMcpCode(405)).toBe(MCP_ERROR_CODES.METHOD_NOT_FOUND);
    expect(mapStatusToMcpCode(408)).toBe(MCP_ERROR_CODES.TIMEOUT);
    expect(mapStatusToMcpCode(409)).toBe(MCP_ERROR_CODES.CONFLICT);
    expect(mapStatusToMcpCode(422)).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
    expect(mapStatusToMcpCode(429)).toBe(MCP_ERROR_CODES.TOO_MANY_REQUESTS);
    expect(mapStatusToMcpCode(500)).toBe(MCP_ERROR_CODES.INTERNAL_ERROR);
    expect(mapStatusToMcpCode(501)).toBe(MCP_ERROR_CODES.METHOD_NOT_FOUND);
    expect(mapStatusToMcpCode(502)).toBe(MCP_ERROR_CODES.INTERNAL_ERROR);
    expect(mapStatusToMcpCode(503)).toBe(MCP_ERROR_CODES.TIMEOUT);
    expect(mapStatusToMcpCode(504)).toBe(MCP_ERROR_CODES.TIMEOUT);
  });

  it("should map generic 5xx server errors to INTERNAL_ERROR", () => {
    expect(mapStatusToMcpCode(505)).toBe(MCP_ERROR_CODES.INTERNAL_ERROR);
    expect(mapStatusToMcpCode(599)).toBe(MCP_ERROR_CODES.INTERNAL_ERROR);
  });

  it("should map generic 4xx client errors not in table to INVALID_PARAMS", () => {
    expect(mapStatusToMcpCode(418)).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
    expect(mapStatusToMcpCode(451)).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
  });

  it("should map non-error status codes to GENERIC_ERROR", () => {
    expect(mapStatusToMcpCode(200)).toBe(MCP_ERROR_CODES.GENERIC_ERROR);
    expect(mapStatusToMcpCode(301)).toBe(MCP_ERROR_CODES.GENERIC_ERROR);
    expect(mapStatusToMcpCode(600)).toBe(MCP_ERROR_CODES.GENERIC_ERROR);
  });
});

describe("*** Testing toMcpToolResult ***", () => {
  it("should convert KitHttpError into standard MCP tool result with _meta", () => {
    const error = new NotFoundError("Resource not found", { id: "res_123" });
    const result = toMcpToolResult(error);

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("[HTTP 404] Resource not found");
    expect(result.content[0].text).toContain('"id": "res_123"');

    expect(result._meta).toBeDefined();
    expect(result._meta?.error).toBeDefined();
    expect(result._meta?.error.code).toBe(MCP_ERROR_CODES.NOT_FOUND);
    expect(result._meta?.error.category).toBe("RESOURCE");
    expect(result._meta?.error.retryable).toBe(false);
    expect(result._meta?.error.recoveryHint).toContain("identifier exists");
  });

  it("should respect includeMeta option when false", () => {
    const error = new NotFoundError("Missing item");
    const result = toMcpToolResult(error, { includeMeta: false });

    expect(result._meta).toBeUndefined();
    expect(result.isError).toBe(true);
  });

  it("should handle error with string details", () => {
    const error = new BadRequestError("Invalid payload", "Email is required");
    const result = toMcpToolResult(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Details: Email is required");
    expect(result._meta?.error.category).toBe("VALIDATION");
    expect(result._meta?.error.retryable).toBe(false);
  });

  it("should respect includeStatusCode option when false", () => {
    const error = new NotFoundError("Missing item");
    const result = toMcpToolResult(error, { includeStatusCode: false });

    expect(result.content[0].text).toBe("Missing item");
    expect(result.content[0].text).not.toContain("[HTTP");
  });

  it("should respect includeDetails option when false", () => {
    const error = new BadRequestError("Validation failed", { field: "age" });
    const result = toMcpToolResult(error, { includeDetails: false });

    expect(result.content[0].text).toBe("[HTTP 400] Validation failed");
    expect(result.content[0].text).not.toContain("Details");
  });

  it("should convert standard Error instance", () => {
    const error = new Error("Database connection dropped");
    const result = toMcpToolResult(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("[HTTP 500] Database connection dropped");
    expect(result._meta?.error.category).toBe("INTERNAL");
  });

  it("should convert string error", () => {
    const result = toMcpToolResult("Gateway timeout reached");

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("[HTTP 500] Gateway timeout reached");
  });

  it("should convert arbitrary unknown error object or primitive", () => {
    const resultObj = toMcpToolResult({ code: "ERR_CUSTOM" });
    expect(resultObj.isError).toBe(true);
    expect(resultObj.content[0].text).toContain("[HTTP 500]");

    const resultNum = toMcpToolResult(42);
    expect(resultNum.isError).toBe(true);
    expect(resultNum.content[0].text).toBe("[HTTP 500] 42");
  });

  it("should safely handle circular details object in formatDetailsText", () => {
    const circular: Record<string, unknown> = { name: "test" };
    circular.self = circular;

    const error = new KitHttpError(400, "Circular issue", circular);
    const result = toMcpToolResult(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Details: [object Object]");
  });

  it("should handle KitError with direct message and deleted statusCode fallback", () => {
    const error = new KitHttpError(404, "Direct message");
    // @ts-ignore
    delete error.statusCode;

    const result = toMcpToolResult(error);
    expect(result.content[0].text).toContain("[HTTP 404] Direct message");
  });

  it("should extract retryAfter from error headers", () => {
    const error = new KitHttpError(429, "Too Many Requests")
      .setHeader("retry-after", "60");
    const result = toMcpToolResult(error);

    expect(result._meta?.error.category).toBe("RATE_LIMIT");
    expect(result._meta?.error.retryable).toBe(true);
    expect(result._meta?.error.retryAfter).toBe(60);
  });

  it("should handle non-numeric retry-after header value", () => {
    const error = new KitHttpError(503, "Service Unavailable")
      .setHeader("Retry-After", "Wed, 21 Oct 2026 07:28:00 GMT");
    const result = toMcpToolResult(error);

    expect(result._meta?.error.category).toBe("TIMEOUT");
    expect(result._meta?.error.retryable).toBe(true);
    expect(result._meta?.error.retryAfter).toBe("Wed, 21 Oct 2026 07:28:00 GMT");
  });

  it("should handle headers without retry-after", () => {
    const error = new KitHttpError(500, "Internal Server Error")
      .setHeader("Content-Type", "application/json");
    const result = toMcpToolResult(error);

    expect(result._meta?.error.retryAfter).toBeUndefined();
  });

  it("should respect custom options overrides for metadata", () => {
    const error = new BadRequestError("Invalid payload");
    const result = toMcpToolResult(error, {
      category: "VALIDATION",
      recoveryHint: "Please provide a valid email format.",
      retryAfter: 5,
      retryable: true,
    });

    expect(result._meta?.error.category).toBe("VALIDATION");
    expect(result._meta?.error.recoveryHint).toBe("Please provide a valid email format.");
    expect(result._meta?.error.retryable).toBe(true);
    expect(result._meta?.error.retryAfter).toBe(5);
  });

  it("should extract recoveryHint and retryAfter from details object", () => {
    const error = new KitHttpError(400, "Bad Request", {
      recoveryHint: "Check schema constraints.",
      retryAfter: 15,
    });
    const result = toMcpToolResult(error);

    expect(result._meta?.error.recoveryHint).toBe("Check schema constraints.");
    expect(result._meta?.error.retryAfter).toBe(15);
  });
});

describe("*** Testing toMcpProtocolError ***", () => {
  it("should convert KitHttpError to JSON-RPC protocol error with data", () => {
    const error = new BadRequestError("Invalid parameter", { param: "username" });
    const rpcError = toMcpProtocolError(error);

    expect(rpcError.code).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
    expect(rpcError.message).toBe("Invalid parameter");
    expect(rpcError.data).toEqual({ param: "username" });
  });

  it("should convert error without details leaving data undefined", () => {
    const error = new NotFoundError("Page not found");
    const rpcError = toMcpProtocolError(error);

    expect(rpcError.code).toBe(MCP_ERROR_CODES.NOT_FOUND);
    expect(rpcError.message).toBe("Page not found");
    expect(rpcError.data).toBeUndefined();
  });

  it("should convert standard Error to internal error", () => {
    const error = new Error("Disk full");
    const rpcError = toMcpProtocolError(error);

    expect(rpcError.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR);
    expect(rpcError.message).toBe("Disk full");
  });
});

describe("*** Testing resolveErrorMeta ***", () => {
  it("should resolve correct categories for standard status codes", () => {
    expect(resolveErrorMeta(401, -32001).category).toBe("AUTHENTICATION");
    expect(resolveErrorMeta(403, -32003).category).toBe("AUTHORIZATION");
    expect(resolveErrorMeta(404, -32004).category).toBe("RESOURCE");
    expect(resolveErrorMeta(409, -32009).category).toBe("CONFLICT");
    expect(resolveErrorMeta(410, -32004).category).toBe("RESOURCE");
    expect(resolveErrorMeta(422, -32602).category).toBe("VALIDATION");
    expect(resolveErrorMeta(429, -32029).category).toBe("RATE_LIMIT");
    expect(resolveErrorMeta(500, -32603).category).toBe("INTERNAL");
    expect(resolveErrorMeta(503, -32008).category).toBe("TIMEOUT");
    expect(resolveErrorMeta(504, -32008).category).toBe("TIMEOUT");
  });

  it("should resolve fallback categories for unmapped status codes", () => {
    expect(resolveErrorMeta(499, -32602).category).toBe("VALIDATION");
    expect(resolveErrorMeta(599, -32603).category).toBe("INTERNAL");
    expect(resolveErrorMeta(200, -32000).category).toBe("GENERIC");
  });

  it("should correctly identify retryable status codes", () => {
    expect(resolveErrorMeta(408, -32008).retryable).toBe(true);
    expect(resolveErrorMeta(429, -32029).retryable).toBe(true);
    expect(resolveErrorMeta(502, -32603).retryable).toBe(true);
    expect(resolveErrorMeta(503, -32008).retryable).toBe(true);
    expect(resolveErrorMeta(504, -32008).retryable).toBe(true);
    expect(resolveErrorMeta(400, -32600).retryable).toBe(false);
    expect(resolveErrorMeta(404, -32004).retryable).toBe(false);
  });
});

describe("*** Testing mcpErrorFormatter and KitMcpErrorFormatter ***", () => {
  afterEach(() => {
    KitHttpErrorConfig.resetFormatter();
  });

  it("should format error payload with protocol, content, and _meta fields", () => {
    const payload = mcpErrorFormatter(404, "User not found", { id: 99 });

    expect(payload.isError).toBe(true);
    expect(payload.code).toBe(MCP_ERROR_CODES.NOT_FOUND);
    expect(payload.message).toBe("User not found");
    expect(payload.data).toEqual({ id: 99 });
    expect(payload.content).toHaveLength(1);
    expect(payload.content[0].text).toContain("[HTTP 404] User not found");
    expect(payload._meta?.error.category).toBe("RESOURCE");
    expect(payload._meta?.error.retryable).toBe(false);
  });

  it("should format error payload without details", () => {
    const payload = mcpErrorFormatter(500, "Internal failure");

    expect(payload.isError).toBe(true);
    expect(payload.code).toBe(MCP_ERROR_CODES.INTERNAL_ERROR);
    expect(payload.message).toBe("Internal failure");
    expect(payload.data).toBeUndefined();
    expect(payload._meta?.error.category).toBe("INTERNAL");
  });

  it("should integrate with KitHttpError instance setFormatter", () => {
    const error = new KitHttpError(401, "Token expired", { expiredAt: 123456 })
      .setFormatter(mcpErrorFormatter);

    const json = error.toJSON() as any;
    expect(json.isError).toBe(true);
    expect(json.code).toBe(MCP_ERROR_CODES.UNAUTHORIZED);
    expect(json.data).toEqual({ expiredAt: 123456 });
    expect(json._meta.error.category).toBe("AUTHENTICATION");
  });

  it("should integrate with KitHttpErrorConfig global formatter", () => {
    KitHttpErrorConfig.configureFormatter(mcpErrorFormatter);
    const error = new KitHttpError(429, "Rate limit reached");

    const json = JSON.parse(JSON.stringify(error));
    expect(json.isError).toBe(true);
    expect(json.code).toBe(MCP_ERROR_CODES.TOO_MANY_REQUESTS);
    expect(json._meta.error.category).toBe("RATE_LIMIT");
    expect(json._meta.error.retryable).toBe(true);
  });

  it("should verify KitMcpErrorFormatter is an alias for mcpErrorFormatter", () => {
    expect(KitMcpErrorFormatter).toBe(mcpErrorFormatter);
  });
});
