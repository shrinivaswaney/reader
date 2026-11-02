import {
  clamp01,
  progressFromScroll,
  filledPartitions,
  PROGRESS_PARTITIONS,
} from '../scroll-progress';

describe('clamp01', () => {
  it('keeps in-range values unchanged', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });

  it('clamps out-of-range values', () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(1.4)).toBe(1);
  });
});

describe('progressFromScroll', () => {
  it('returns 0 when content fits the viewport (nothing to scroll)', () => {
    expect(progressFromScroll(0, 500, 500)).toBe(0);
    expect(progressFromScroll(120, 400, 500)).toBe(0);
  });

  it('interpolates scroll offset between top and bottom', () => {
    // content 2000 tall, viewport 1000 → maxScroll 1000
    expect(progressFromScroll(0, 2000, 1000)).toBe(0);
    expect(progressFromScroll(250, 2000, 1000)).toBeCloseTo(0.25);
    expect(progressFromScroll(1000, 2000, 1000)).toBeCloseTo(1);
  });

  it('clamps overscroll (iOS rubber-banding) to [0, 1]', () => {
    expect(progressFromScroll(-80, 2000, 1000)).toBe(0);
    expect(progressFromScroll(1400, 2000, 1000)).toBe(1);
  });
});

describe('filledPartitions', () => {
  it('rounds to nearest partition', () => {
    expect(filledPartitions(0)).toBe(0);
    expect(filledPartitions(0.104)).toBe(10);
    expect(filledPartitions(0.995)).toBe(100); // rounding up at the boundary
    expect(filledPartitions(1)).toBe(PROGRESS_PARTITIONS);
  });

  it('supports arbitrary partition counts', () => {
    expect(filledPartitions(0.5, 4)).toBe(2);
  });
});
