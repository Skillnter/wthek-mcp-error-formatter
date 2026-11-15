/**
 * Extracted core error components.
 * @interface
 */
export interface IExtractedErrorComponents {
  details?: unknown;
  headers?: Record<string, string>;
  message: string;
  statusCode: number;
}