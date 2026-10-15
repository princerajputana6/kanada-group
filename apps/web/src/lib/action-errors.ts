/**
 * Human message for a failed server-action call from the client. A tab
 * opened before a deploy calls action IDs that no longer exist; Next.js
 * surfaces that as "An unexpected response was received from the server".
 */
export function actionErrorMessage(err: unknown, fallback = "Something went wrong — please try again."): string {
  const msg = err instanceof Error ? err.message : "";
  if (/unexpected response was received from the server|Server action not found|Failed to find Server Action/i.test(msg)) {
    return "This page is out of date because the site was just updated. Please refresh the page and try again.";
  }
  if (err instanceof TypeError) return "Network problem — please check your connection and try again.";
  return msg || fallback;
}
