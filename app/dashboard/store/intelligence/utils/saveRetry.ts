export function getRetryDelay(attempt: number) {
  return 1000 * 2 ** Math.max(0, attempt - 1);
}