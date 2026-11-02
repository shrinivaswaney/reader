// Pure scroll-progress math — no React, fully unit-testable.
// The reader rail renders one partition per percent of chapter read.

export const PROGRESS_PARTITIONS = 100;

export function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function progressFromScroll(
  contentOffsetY: number,
  contentSizeHeight: number,
  layoutMeasurementHeight: number
): number {
  const maxScroll = contentSizeHeight - layoutMeasurementHeight;
  return maxScroll > 0 ? clamp01(contentOffsetY / maxScroll) : 0;
}

export function filledPartitions(progress: number, partitions: number = PROGRESS_PARTITIONS): number {
  return Math.round(clamp01(progress) * partitions);
}
