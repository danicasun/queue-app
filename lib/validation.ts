export function validateRequiredText(value: string, label: string) {
  if (!value.trim()) {
    return `${label} is required.`;
  }
  return null;
}

export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
  return hasProtocol ? trimmed : `https://${trimmed}`;
}

export function validateUrl(value: string) {
  if (!value.trim()) return null;
  try {
    const url = new URL(normalizeUrl(value));
    if (!url.host) {
      return "URL must include a valid domain.";
    }
    return null;
  } catch {
    return "URL must be a valid format.";
  }
}
/**
 * Validation helpers for queue CRUD.
 * Title required; URL must be valid format when provided.
 */

export type ValidationResult =
  | { success: true }
  | { success: false; message: string };

export function validateTopicTitle(title: string): ValidationResult {
  const trimmed = title?.trim() ?? "";
  if (!trimmed) {
    return { success: false, message: "Title is required." };
  }
  return { success: true };
}

export function validateResourceTitle(title: string): ValidationResult {
  const trimmed = title?.trim() ?? "";
  if (!trimmed) {
    return { success: false, message: "Title is required." };
  }
  return { success: true };
}

export function validateResourceUrl(
  url: string | null | undefined
): ValidationResult {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return { success: true };
  }
  try {
    new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return { success: true };
  } catch {
    return { success: false, message: "Please enter a valid URL." };
  }
}
