export function getFriendlyError(error, fallback = "Something went wrong") {
  const message =
    typeof error === "string"
      ? error
      : error?.friendlyMessage || error?.message || error?.error || fallback;

  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "Server connection failed. Please check that the backend is running.";
  }

  if (/jwt|token|unauthorized|forbidden/i.test(message)) {
    return "Your session needs attention. Please sign in again.";
  }

  if (/429|too many requests|rate limit/i.test(message)) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  if (/not allowed by cors|cors/i.test(message)) {
    return "This website URL is not allowed by the backend yet.";
  }

  return message || fallback;
}

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(getFriendlyError(message));
    this.name = "ApiError";
    this.status = details.status || 0;
    this.payload = details.payload || null;
    this.friendlyMessage = this.message;
  }
}
