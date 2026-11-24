# Official @wthek Extension – MCP Error Formatter for `http-error-kit`

**MCP-native error formatting and JSON-RPC 2.0 error mapping for `http-error-kit`.**

A lightweight, TypeScript-first extension that transforms HTTP errors, validation failures, and unexpected runtime exceptions into structured, AI-agent-friendly Model Context Protocol (MCP) tool results and JSON-RPC 2.0 responses.

Built specifically for MCP servers and AI tool pipelines already using or adopting [`http-error-kit`][http-error-kit].

> 💡 **Extend your existing error-handling architecture into MCP.** If you already use `http-error-kit` across Express, Fastify, Hono, NestJS, or serverless backends, `@wthek/mcp-error-formatter` allows you to reuse the exact same error classes (`NotFoundError`, `BadRequestError`, etc.) in your MCP tool handlers without building a custom error-formatting layer.

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/skillnter/wthek-mcp-error-formatter/main.yml)
[![npm version](https://img.shields.io/npm/v/%40wthek%2Fmcp-error-formatter?color=brightgreen)](https://www.npmjs.com/package/@wthek/mcp-error-formatter)
[![GitHub license](https://img.shields.io/github/license/skillnter/wthek-mcp-error-formatter?color=brightgreen)](LICENSE)
![NPM Type Definitions](https://img.shields.io/npm/types/%40wthek%2Fmcp-error-formatter)
[![GitHub Issues](https://img.shields.io/github/issues/Skillnter/wthek-mcp-error-formatter)](https://github.com/Skillnter/wthek-mcp-error-formatter/issues)
![npm](https://img.shields.io/npm/dy/%40wthek%2Fmcp-error-formatter)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/%40wthek%2Fmcp-error-formatter)](https://bundlephobia.com/package/%40wthek%2Fmcp-error-formatter)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/96d64167e7044dc89decad6eb4b1f91d)](https://app.codacy.com/gh/Skillnter/wthek-mcp-error-formatter/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/96d64167e7044dc89decad6eb4b1f91d)](https://app.codacy.com/gh/Skillnter/wthek-mcp-error-formatter/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@wthek/mcp-error-formatter/)](https://socket.dev/npm/package/@wthek/mcp-error-formatter/overview/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white)](https://skillnter.github.io/wthek-mcp-error-formatter/)
[![Github Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-30363D?&logo=GitHub-Sponsors&logoColor=EA4AAA)](https://github.com/sponsors/Skillnter)
[![Open Collective](https://img.shields.io/badge/Open%20Collective-3385FF?logo=open-collective&logoColor=white)](https://opencollective.com/skillnter)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/skillnter)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/skillnter)
[![PayPal](https://img.shields.io/badge/PayPal-003087?logo=paypal&logoColor=fff)](https://www.paypal.me/skillnte)

---

## Features

- **MCP Tool Result Conversion** – Convert any error into a standard MCP `CallToolResult` structure with `isError: true`, formatted text content, and structured `_meta.error` diagnostics.
- **JSON-RPC 2.0 Error Mapping** – Map HTTP status codes to standard JSON-RPC codes (`-32700` to `-32600`) and reserved application-specific error ranges (`-32000` to `-32099`).
- **Structured Agent Diagnostics (`_meta.error`)** – Equip AI agents with machine-readable `category`, `retryable`, `recoveryHint`, and `retryAfter` metadata for autonomous self-healing.
- **Universal Error Handling** – Normalize `KitHttpError`, `KitGeneralError`, native JavaScript `Error` instances, string messages, and unknown thrown values into consistent MCP error responses.
- **Global Formatter Integration** – Plug directly into `KitHttpErrorConfig.configureFormatter()` to serialize `KitHttpError` instances into MCP format across your entire project.
- **AI-Agent-Friendly Responses** – Provide structured, contextual error information that helps AI agents identify failures and determine appropriate corrective actions.
- **Lightweight Dependencies** – Minimal runtime dependencies, relying only on `http-error-kit` and `http-response-status-code`.
- **TypeScript-First** – Full typings and structurally compatible with official `@modelcontextprotocol/sdk` types without forcing a heavy peer dependency.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [1. In MCP Tool Handlers (`toMcpToolResult`)](#1-in-mcp-tool-handlers-tomcptoolresult)
  - [2. Standard JSON-RPC Error Responses (`toMcpProtocolError`)](#2-standard-json-rpc-error-responses-tomcpprotocolerror)
  - [3. Pluggable `http-error-kit` Formatter (`mcpErrorFormatter`)](#3-pluggable-http-error-kit-formatter-mcperrorformatter)
  - [4. Structured Agent Diagnostics (`_meta.error`)](#4-structured-agent-diagnostics-_metaerror)
- [HTTP Status to JSON-RPC / MCP Error Code Mapping](#http-status-to-json-rpc--mcp-error-code-mapping)
- [API Reference](#api-reference)
  - [API Overview](#api-overview)
  - [`toMcpToolResult(error, options?)`](#tomcptoolresulterror-options)
  - [`toMcpProtocolError(error)`](#tomcpprotocolerrorerror)
  - [`mcpErrorFormatter(statusCode, message, details?)`](#mcperrorformatterstatuscode-message-details)
  - [`mapStatusToMcpCode(statusCode)`](#mapstatustomcpcodestatuscode)
  - [`MCP_ERROR_CODES`](#mcp_error_codes)
  - [Exported TypeScript Interfaces](#exported-typescript-interfaces)
- [SDK Compatibility](#sdk-compatibility)
- [Architecture Diagram](#architecture-diagram)
- [Security Considerations](#security-considerations)
- [Explore More WTHek Extensions](#explore-more-wthek-extensions)
- [People](#people)
- [Donations](#donations)
- [License](#license)

---

## Installation

```console
npm install @wthek/mcp-error-formatter http-error-kit
```

---

## Quick Start

```typescript
import { NotFoundError } from "http-error-kit";
import { toMcpToolResult } from "@wthek/mcp-error-formatter";

try {
  throw new NotFoundError("User not found", {
    userId: 123
  });
} catch (error: unknown) {
  const result = toMcpToolResult(error);
  console.log(JSON.stringify(result, null, 2));
}
```

Output:

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "[HTTP 404] User not found\nDetails: {\n  \"userId\": 123\n}"
    }
  ],
  "_meta": {
    "error": {
      "category": "RESOURCE",
      "code": -32004,
      "recoveryHint": "Verify that the requested resource identifier exists.",
      "retryable": false
    }
  }
}
```

---

## Usage

### 1. In MCP Tool Handlers (`toMcpToolResult`)

When defining MCP tools with `@modelcontextprotocol/sdk`, handlers return a `CallToolResult`. Catch errors and delegate directly to `toMcpToolResult`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NotFoundError, BadRequestError } from "http-error-kit";
import { toMcpToolResult } from "@wthek/mcp-error-formatter";

const server = new McpServer({
  name: "user-management-server",
  version: "1.0.0",
});

server.tool(
  "get_user",
  "Fetches user record by ID",
  { id: z.string().describe("User ID") },
  async ({ id }) => {
    try {
      const user = await database.findUser(id);
      if (!user) {
        throw new NotFoundError(`User with id "${id}" does not exist`);
      }
      return {
        content: [{ type: "text", text: JSON.stringify(user) }],
      };
    } catch (err: unknown) {
      return toMcpToolResult(err);
    }
  }
);
```

#### Customizing Tool Output Options

```typescript
toMcpToolResult(err, {
  includeStatusCode: false, // Omit "[HTTP 404]" prefix from text
  includeDetails: true,    // Include structured issue details in text
  includeMeta: true,       // Attach _meta.error structured diagnostics (default: true)
  recoveryHint: "Check account permissions before retrying.", // Custom agent guidance
  retryable: false,        // Explicit retryability override
  retryAfter: 30,          // Retry delay in seconds (also extracted automatically from Retry-After headers)
});
```

---

### 2. Standard JSON-RPC Error Responses (`toMcpProtocolError`)

Convert any error into a standard JSON-RPC 2.0 error object with numeric protocol codes:

```typescript
import { toMcpProtocolError } from "@wthek/mcp-error-formatter";
import { BadRequestError } from "http-error-kit";

const error = new BadRequestError("Invalid payload", { field: "email" });
const rpcError = toMcpProtocolError(error);

console.log(rpcError);
// {
//   code: -32600,
//   message: "Invalid payload",
//   data: { field: "email" }
// }
```

---

### 3. Pluggable `http-error-kit` Formatter (`mcpErrorFormatter`)

Configure `mcpErrorFormatter` globally to serialize all `KitHttpError` instances into MCP payloads:

```typescript
import { KitHttpErrorConfig, NotFoundError } from "http-error-kit";
import { mcpErrorFormatter } from "@wthek/mcp-error-formatter";

// Configure once at server startup
KitHttpErrorConfig.configureFormatter(mcpErrorFormatter);

const error = new NotFoundError("Project not found", { slug: "alpha" });
console.log(error.toJSON());
// {
//   isError: true,
//   code: -32004,
//   message: "Project not found",
//   data: { slug: "alpha" },
//   content: [
//     { type: "text", text: "[HTTP 404] Project not found\nDetails: {\n  \"slug\": \"alpha\"\n}" }
//   ],
//   _meta: {
//     error: {
//       category: "RESOURCE",
//       code: -32004,
//       recoveryHint: "Verify that the requested resource identifier exists.",
//       retryable: false
//     }
//   }
// }
```

---

### 4. Structured Agent Diagnostics (`_meta.error`)

AI coding agents use the `_meta.error` payload to determine whether to self-correct arguments, authenticate, wait for rate limits, or alert the user:

```json
{
  "_meta": {
    "error": {
      "category": "VALIDATION",
      "code": -32602,
      "recoveryHint": "Verify tool arguments against the required schema and correct validation errors.",
      "retryable": false
    }
  }
}
```

#### Diagnostic Fields:
- **`category`**: Semantic error classification (`VALIDATION`, `AUTHENTICATION`, `AUTHORIZATION`, `RESOURCE`, `CONFLICT`, `RATE_LIMIT`, `TIMEOUT`, `INTERNAL`, `GENERIC`).
- **`code`**: Numeric JSON-RPC / MCP error code.
- **`recoveryHint`**: Human- and agent-readable suggestion for resolving the error.
- **`retryable`**: Boolean flag indicating whether repeating the operation without code changes could succeed (e.g. `408`, `429`, `502`, `503`, `504` are `true`).
- **`retryAfter`**: Optional delay in seconds or HTTP date string (extracted automatically from `Retry-After` headers).

---

## HTTP Status to JSON-RPC / MCP Error Code Mapping

The formatter maps HTTP status codes to JSON-RPC-compatible numeric error codes using a predefined mapping strategy.

Standard JSON-RPC error codes are used where appropriate (`-32700` to `-32600`), while additional application-specific codes use the reserved server error range (`-32000` to `-32099`):

| HTTP Status Code | MCP Error Code | Meaning | Standard / Specification |
| :--- | :--- | :--- | :--- |
| `400 Bad Request` | `-32600` | `INVALID_REQUEST` | Standard JSON-RPC 2.0 |
| `401 Unauthorized` | `-32001` | `UNAUTHORIZED` | Reserved Application Range |
| `403 Forbidden` | `-32003` | `FORBIDDEN` | Reserved Application Range |
| `404 Not Found` | `-32004` | `NOT_FOUND` | Reserved Application Range |
| `405 Method Not Allowed` | `-32601` | `METHOD_NOT_FOUND` | Standard JSON-RPC 2.0 |
| `408 Request Timeout` | `-32008` | `TIMEOUT` | Reserved Application Range |
| `409 Conflict` | `-32009` | `CONFLICT` | Reserved Application Range |
| `422 Unprocessable Content` | `-32602` | `INVALID_PARAMS` | Standard JSON-RPC 2.0 |
| `429 Too Many Requests` | `-32029` | `TOO_MANY_REQUESTS` | Reserved Application Range |
| `500 Internal Server Error` | `-32603` | `INTERNAL_ERROR` | Standard JSON-RPC 2.0 |
| `501 Not Implemented` | `-32601` | `METHOD_NOT_FOUND` | Standard JSON-RPC 2.0 |
| `502 Bad Gateway` | `-32603` | `INTERNAL_ERROR` | Standard JSON-RPC 2.0 |
| `503 Service Unavailable` | `-32008` | `TIMEOUT` | Reserved Application Range |
| `504 Gateway Timeout` | `-32008` | `TIMEOUT` | Reserved Application Range |
| `Unlisted 4xx` | `-32602` | `INVALID_PARAMS` | Standard JSON-RPC 2.0 Fallback |
| `Unlisted 5xx` | `-32603` | `INTERNAL_ERROR` | Standard JSON-RPC 2.0 Fallback |
| `All other codes` | `-32000` | `GENERIC_ERROR` | Reserved Application Range |

---

## API Reference

### API Overview

| Export | Kind | Description | Returns |
| :--- | :--- | :--- | :--- |
| `toMcpToolResult(error, options?)` | Function | Converts any error into an MCP `CallToolResult` | `IMcpToolResult` |
| `toMcpProtocolError(error)` | Function | Converts any error into a JSON-RPC 2.0 protocol error | `IMcpProtocolError` |
| `mcpErrorFormatter(statusCode, message, details?)` | Function | Formats errors adhering to `http-error-kit` `IFormatter` | `IMcpErrorPayload` |
| `mapStatusToMcpCode(statusCode)` | Function | Maps HTTP status codes to JSON-RPC-compatible codes | `number` |
| `resolveErrorMeta(statusCode, code, headers?, details?, options?)` | Function | Generates structured diagnostic metadata | `IMcpErrorMeta` |
| `MCP_ERROR_CODES` | Constant | Predefined JSON-RPC and MCP error code constants | `object` |
| `KitMcpErrorFormatter` | Alias | Alias for `mcpErrorFormatter` adhering to Kit naming | `function` |

---

### `toMcpToolResult(error, options?)`

Converts any error (e.g. `KitHttpError`, `KitGeneralError`, standard `Error`, string, or unknown) into a standard MCP tool call result.

* **Parameters:**
  * `error` (`unknown`): The caught error instance or value.
  * `options` (`IMcpToolResultOptions`, optional):
    * `includeStatusCode?: boolean` (default: `true`) — Prefix message with `[HTTP 404]`.
    * `includeDetails?: boolean` (default: `true`) — Append formatted error details.
    * `includeMeta?: boolean` (default: `true`) — Attach structured `_meta.error` diagnostics.
    * `category?: McpErrorCategory` — Explicit category override.
    * `recoveryHint?: string` — Explicit recovery guidance for the AI agent.
    * `retryable?: boolean` — Explicit retryable flag.
    * `retryAfter?: number | string` — Delay before retrying.
* **Returns:** `IMcpToolResult`

---

### `toMcpProtocolError(error)`

Converts any error into a JSON-RPC 2.0 error object.

* **Parameters:**
  * `error` (`unknown`): The caught error.
* **Returns:** `IMcpProtocolError` (`{ code: number, message: string, data?: unknown }`)

---

### `mcpErrorFormatter(statusCode, message, details?)`

Pluggable formatter conforming to the `http-error-kit` `IFormatter` interface.

* **Parameters:**
  * `statusCode` (`number`): The HTTP status code.
  * `message` (`string`): The error message.
  * `details` (`unknown`, optional): Additional error details.
* **Returns:** `IMcpErrorPayload`

---

### `mapStatusToMcpCode(statusCode)`

Maps a numeric HTTP status code to its corresponding JSON-RPC / MCP error code.

* **Parameters:**
  * `statusCode` (`number`): HTTP status code.
* **Returns:** `number`

---

### `MCP_ERROR_CODES`

Dictionary of standard JSON-RPC 2.0 and reserved application error codes:

```typescript
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
```

---

### Exported TypeScript Interfaces

All core interfaces are exported for strict typing:

```typescript
import type {
  IMcpContentItem,
  IMcpErrorMeta,
  IMcpErrorPayload,
  IMcpProtocolError,
  IMcpResultMeta,
  IMcpToolResult,
  IMcpToolResultOptions,
  McpErrorCategory,
} from "@wthek/mcp-error-formatter";
```

---

## SDK Compatibility

`IMcpToolResult` is **structurally compatible** with the official `@modelcontextprotocol/sdk` `CallToolResult` type:

```typescript
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { toMcpToolResult } from "@wthek/mcp-error-formatter";

// IMcpToolResult is directly assignable to CallToolResult without casting
const result: CallToolResult = toMcpToolResult(new Error("Database offline"));
```

You do not need to install `@modelcontextprotocol/sdk` to use `@wthek/mcp-error-formatter`. It produces compatible result shapes with zero SDK coupling.

---

## Architecture Diagram

[![](https://mermaid.ink/img/pako:eNptU11v2jAU_StXliqBlEAhUEoeptFQPrp1oMLTlmnyEkOsOnbkOKUU-O-7dsrYpPISX-ucc8-51xxIolJGQhLLjVC7JKPawHocS8Df6EdMRkUheEINVxLasGL6hScsJj_B9z_BHQLutVYaFklS6TKOZeMLNzNjivq6DedvJZ-l2skmUmvxO6cQocLnncnYcztPCp9ZtL9ROqfGMO3ANfzqCtaZZgy4NGyra0MFNdmO7ssaElnFY0zWSgmYUZkKpsHofRvtJ1lMjjDGbkY9JoWFPLGyEqZxcXTmL7UyKkGNNjwtI_hK99bJEe7P7DPAZftAYCrUbyoAJwGTS5QjTFAAUzra5OOMtSkut7CoTFEZWGW0YO8Bx25kU1SJqBCXDHbsicK5SOMBL52-B79yZujF3L0jz5D8sFp8822ybuu63k8tkDIPclaWdIuHlP5LnjjyHMn4AjgV_I2l76td0r1QNLUSL5yC22DLKNuk0Wz-n27CJc4lUrKsckzurqdO-gGlH6MlRIJjCpz8aA6jLR6tbiRoZc1F-MRsspE0HJ_ACzf7i8VZrVMX83NBPLLVPCWh0RXzCHbNqS3JwQJxnxnL8TmHeNQsrV79lOpnH3eLQ8H_xAn5BZXflcrPElpV24yEGypKrKoCB8XGnKKf_O-tZjJlOlKVNCTsBk6DhAfyitVNrzUMbvvDQa83DHo3PY_sSdjrtIJO56YbDIb9YdDtByePvLmm163bQf_0B_qIJ-A?type=png)](https://mermaid.live/edit#pako:eNptkl9v2jAUxb_KlaVKICVQIECTh2k0lD_tOlDhacs0vMQQC8eOHAdKge--m6SMTmpeYlv3_HzO9T2SUEWMeGS1WiVMJ5RHgVwLtQ9jqg0sh4EE_AY_AzJIU8FDariS0IQF0zsesoD8Atv-AvdY8KC10jALw1xnQSBrT9xMjEmr4yZc_rncSrWXdZRW8PuS4CPh697EbNtMwtRmRbW9VmjJGKbL4qr85gaWsWYMuDRsoytDKTXxnh6yqsQviKeALJUSMKEyEkyD0Ycm2g_jgJxgiLcZ9RymRckLy3JhaldHF_1cK6NCZDThZe7DN3oonJzg4aK-FJTZPgGMhfpDBWAnYHSNcoIRAjBlKRt9nrEyxeUGZrlJcwOLmKbsPeCwbNkYKT4V4pqhaHuosC_SWMCzkm_B74QZejX3UIonKH5czL7bRbJ247Z6nwoQMQsSlmV0g4uIfhSPSvEUxTgBnAr-xqL3p53Tg1A0KhA7TqF8wYZRxSW1ev3_dCMusS--klmOY1cdj0v0I6Kf_Tn4gmMK7PxgCoMNLguuL2hemPNxxIpkA2k4jsCOm8PV4qTiVJvpZUMsstE8Ip7RObPI-7Dj5B-LQnzPmCU4zh4uNYvyVzuiemvj22JTSCDPqE-p_KFUckFolW9i4q2pyHCXp9goNuQU_ST_TjWTEdO-yqUhXsstGcQ7klfitXtOw-3cdd2-47gdp-dY5EA8p9XotFq9dqfvdt1Ou9s5W-StvPS2cdd33I_f-S_tcS7I)

---

## Security Considerations

1. **Information Disclosure**:
   In production MCP servers connecting to external agents, ensure sensitive credentials, database connection strings, or full stack traces are not passed inside `details`. `toMcpToolResult` serializes `details` into text content for transparency.
2. **Defensive Formatting**:
   `toMcpToolResult` safely handles circular reference objects and non-standard status codes without throwing exceptions or crashing the MCP server process.
3. **No Unsanitized Prototype Mutations**:
   All error properties are read defensively without direct bracket assignments into prototypes or sinks.

---

## AI Agent Integration

When building with AI coding assistants (Claude Code, Cursor, GitHub Copilot, Antigravity, Devin), add the following directive to your project's `.cursorrules`, `.github/copilot-instructions.md`, or system prompt:

```markdown
### MCP Error Formatter Rule
- When implementing Model Context Protocol (MCP) tool handlers, format error responses using `@wthek/mcp-error-formatter`.
- Catch tool execution errors and transform them with `toMcpToolResult(err)`.
- Use `mcpErrorFormatter` with `KitHttpErrorConfig.configureFormatter()` to serialize `http-error-kit` errors across MCP servers.
- Inspect `_meta.error` diagnostics (`category`, `retryable`, `recoveryHint`) for autonomous recovery.
```

## Explore More WTHek Extensions

The WTHek ecosystem continues to grow with new extensions to simplify error handling across various frameworks and libraries. Stay updated with the latest tools that integrate seamlessly with `http-error-kit`.

**Check out the official list of extensions**: [Official Extensions List](https://github.com/Skillnter/http-error-kit/wiki/Official-Extensions-List)

- [`http-error-kit`][http-error-kit] – Core library offering structured, extensible HTTP error classes.
- [`http-response-status-code`][http-response-status-code] – Comprehensive HTTP status codes with descriptions.
- [`@wthek/mcp`][wthek-mcp] – Standalone local MCP server providing HTTP error diagnostic tools for AI coding agents.
- [`@wthek/express-middleware`][wthek-express] – Production-safe Express.js error middleware.
- [`@wthek/fastify-middleware`][wthek-fastify] – Fastify error-handling plugin.
- [`@wthek/hono-middleware`][wthek-hono] – Lightweight error handling middleware for Hono.
- [`@wthek/koa-middleware`][wthek-koa] – Robust error middleware for Koa.
- [`@wthek/nestjs-middleware`][wthek-nestjs] – NestJS global exception filter for `http-error-kit`.
- [`@wthek/restify-middleware`][wthek-restify] – Centralized error-handling for Restify.
- [`@wthek/zod-transformer`][wthek-zod] – Transform Zod errors into `http-error-kit` errors.
- [`@wthek/valibot-transformer`][wthek-valibot] – Transform Valibot validation errors into `http-error-kit` errors.
- [`@wthek/typebox-transformer`][wthek-typebox] – Transform TypeBox errors into `http-error-kit` errors.

---

## People

The original author of the project is [Himanshu Bansal][skillnter]

## Donations

**This is all voluntary work**, so if you want to support my efforts you can

-   [Buy Me A Coffee](https://www.buymeacoffee.com/skillnter)
-   [Paypal](https://www.paypal.me/skillnte)
-   [GitHub Sponsor](https://github.com/sponsors/Skillnter)
-   [Patreon](https://www.patreon.com/skillnter)
-   [Open Collective](https://opencollective.com/skillnter)

You can also use the following:

![BNB: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/BNB-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

![BTC: bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf](https://img.shields.io/badge/BTC-bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf-brightgreen)

![ETH: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/ETH-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

---

## License

`@wthek/mcp-error-formatter` project is open-sourced software licensed under the [MIT license](LICENSE) by [Himanshu Bansal][skillnter].

[skillnter]: https://github.com/Skillnter/
[himanshu-bansal]: https://github.com/Skillnter
[http-error-kit]: https://www.npmjs.com/package/http-error-kit
[http-response-status-code]: https://www.npmjs.com/package/http-response-status-code
[wthek-mcp]: https://www.npmjs.com/package/@wthek/mcp
[wthek-express]: https://www.npmjs.com/package/@wthek/express-middleware
[wthek-fastify]: https://www.npmjs.com/package/@wthek/fastify-middleware
[wthek-hono]: https://www.npmjs.com/package/@wthek/hono-middleware
[wthek-koa]: https://www.npmjs.com/package/@wthek/koa-middleware
[wthek-nestjs]: https://www.npmjs.com/package/@wthek/nestjs-middleware
[wthek-restify]: https://www.npmjs.com/package/@wthek/restify-middleware
[wthek-zod]: https://www.npmjs.com/package/@wthek/zod-transformer
[wthek-valibot]: https://www.npmjs.com/package/@wthek/valibot-transformer
[wthek-typebox]: https://www.npmjs.com/package/@wthek/typebox-transformer
[github-sponsors]: https://github.com/sponsors/Skillnter
[open-collective]: https://opencollective.com/skillnter
[buy-me-a-coffee]: https://www.buymeacoffee.com/skillnter
[patreon]: https://www.patreon.com/skillnter
[paypal]: https://www.paypal.me/skillnter
