import { isKitError } from "http-error-kit";

import { FALLBACK_STATUS_CODE } from "../constants";
import { IExtractedErrorComponents } from "../interfaces";

/**
 * Safely extracts error components (statusCode, message, details, headers) from an unknown error.
 *
 * @param {unknown} error - The caught error value.
 * @returns {IExtractedErrorComponents} Extracted error components.
 *
 * @example
 * ```typescript
 * import { NotFoundError } from "http-error-kit";
 *
 * const components = extractErrorComponents(new NotFoundError("Missing"));
 * // { statusCode: 404, message: "Missing", details: undefined }
 * ```
 */
export const extractErrorComponents = (
  error: unknown
): IExtractedErrorComponents => {
  if (isKitError(error)) {
    const raw = error.getInputs();
    const message = error.message !== "" ? error.message : raw.message;
    const headers =
      typeof (error as { headers?: Record<string, string> }).headers ===
        "object"
        ? (error as { headers?: Record<string, string> }).headers
        : undefined;

    return {
      details: error.details ?? raw.details,
      headers,
      message,
      statusCode: error.statusCode ?? raw.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: FALLBACK_STATUS_CODE,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      statusCode: FALLBACK_STATUS_CODE,
    };
  }

  return {
    message: String(error),
    statusCode: FALLBACK_STATUS_CODE,
  };
};
