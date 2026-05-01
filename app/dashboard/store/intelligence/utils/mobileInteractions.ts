export function getSwipeTabDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold = 50
) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
    return 0;
  }

  return deltaX < 0 ? 1 : -1;
}