/**
 * Represents a single content item in an MCP tool call result.
 * @interface
 */
export interface IMcpContentItem {
  data?: string;
  mimeType?: string;
  text?: string;
  type: "image" | "resource" | "text";
}

