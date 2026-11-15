/**
 * Standard JSON-RPC 2.0 protocol error structure.
 * @interface
 */
export interface IMcpProtocolError {
  code: number;
  data?: unknown;
  message: string;
}
