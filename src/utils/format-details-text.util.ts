/**
 * Builds a readable string representation of error details for AI agents.
 *
 * @param {unknown} details - Optional details object or value.
 * @returns {string} Formatted details text or empty string.
 *
 * @example
 * ```typescript
 * formatDetailsText({ field: "email" });
 * // '\nDetails: {\n  "field": "email"\n}'
 *
 * formatDetailsText(undefined);
 * // ''
 * ```
 */
export const formatDetailsText = (details?: unknown): string => {
  if (details === undefined || details === null) {
    return "";
  }

  if (typeof details === "string") {
    return `\nDetails: ${details}`;
  }

  try {
    return `\nDetails: ${JSON.stringify(details, null, 2)}`;
  } catch {
    return `\nDetails: ${String(details)}`;
  }
};

