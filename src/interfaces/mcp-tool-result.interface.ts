import type { IMcpContentItem } from "./mcp-content-item.interface";
import type { IMcpResultMeta } from "./mcp-error-meta.interface";

/**
 * Standard MCP CallToolResult structure returned to AI agents.
 * Compatible with @modelcontextprotocol/sdk CallToolResult.
 * @interface
 */
export interface IMcpToolResult {
  _meta?: IMcpResultMeta;
  content: IMcpContentItem[];
  isError: boolean;
  [key: string]: unknown;
}
