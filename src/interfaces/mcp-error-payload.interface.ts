import type { IMcpContentItem } from "./mcp-content-item.interface";
import type { IMcpResultMeta } from "./mcp-error-meta.interface";

/**
 * Formatted error payload matching http-error-kit formatter specifications.
 * Enriched with optional structured `_meta` diagnostics.
 * @interface
 */
export interface IMcpErrorPayload {
  _meta?: IMcpResultMeta;
  code: number;
  content: IMcpContentItem[];
  data?: unknown;
  isError: boolean;
  message: string;
}
