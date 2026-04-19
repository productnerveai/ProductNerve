/**
 * File upload validation utilities.
 * Enforces type restrictions and size limits.
 */

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileUpload(file: File): FileValidationResult {
  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
    };
  }

  // Type check
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type || "unknown"}" is not allowed. Accepted: PDF, JPG, PNG, WebP.`,
    };
  }

  // Extension check
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed. Accepted: ${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}.`,
    };
  }

  return { valid: true };
}

export { MAX_FILE_SIZE_MB, ALLOWED_DOCUMENT_EXTENSIONS };
