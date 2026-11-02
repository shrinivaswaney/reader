import {
  offsetForPage,
  pageForFraction,
  pageFromOffset,
  fractionForPage,
} from '../rtl-pagination';

describe('offsetForPage', () => {
  it('puts page 0 at the far right end of the content', () => {
    // 10 pages, 400px each → max offset 9 * 400
    expect(offsetForPage(0, 400, 10)).toBe(3600);
  });

  it('puts the last logical page at offset 0 (leftmost)', () => {
    expect(offsetForPage(9, 400, 10)).toBe(0);
  });

  it('clamps out-of-range pages', () => {
    expect(offsetForPage(-3, 400, 10)).toBe(3600);
    expect(offsetForPage(99, 400, 10)).toBe(0);
  });

  it('degrades safely on degenerate input', () => {
    expect(offsetForPage(2, 0, 10)).toBe(0);
    expect(offsetForPage(2, 400, 0)).toBe(0);
  });
});

describe('pageFromOffset', () => {
  it('round-trips with offsetForPage', () => {
    for (let p = 0; p < 10; p++) {
      expect(pageFromOffset(offsetForPage(p, 320, 10), 320, 10)).toBe(p);
    }
  });

  it('snaps mid-scroll offsets to the nearest page', () => {
    // physical index 7.4 → rounds to 7 → logical 10-1-7 = 2
    expect(pageFromOffset(7.4 * 320, 320, 10)).toBe(2);
  });

  it('clamps rubber-band overscroll past both ends', () => {
    expect(pageFromOffset(-500, 320, 10)).toBe(9);   // dragged past right end → page 1
    expect(pageFromOffset(99999, 320, 10)).toBe(0);  // scrolled to leftmost
  });
});

describe('pageForFraction / fractionForPage', () => {
  it('maps rail fractions onto visible pages', () => {
    expect(pageForFraction(0, 20)).toBe(0);
    expect(pageForFraction(1, 20)).toBe(19);
    expect(pageForFraction(0.5, 20)).toBe(10);
  });

  it('never returns an out-of-bounds page at fraction 1', () => {
    expect(pageForFraction(1, 5)).toBe(4);
  });

  it('is monotonic and invertible within a page', () => {
    const page = pageForFraction(0.42, 8);
    const f = fractionForPage(page, 8);
    expect(f).toBeLessThanOrEqual(0.42);
    expect(fractionForPage(page + 1, 8)).toBeGreaterThan(0.42);
  });
});
