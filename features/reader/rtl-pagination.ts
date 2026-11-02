// Pure math for right-to-left paginated reading.
//
// Physical layout trick: pages are rendered in REVERSE order [N … 2, 1] so
// page 1 sits at the far RIGHT end of the scroll content — like the first
// page of a physical manga volume. Opening the chapter scrolls to that right
// end; turning to the next page (page 2, sitting to its LEFT) means dragging
// content rightward, exactly like flipping a book page.

export function offsetForPage(page: number, pageWidth: number, pageCount: number): number {
  if (pageWidth <= 0 || pageCount <= 0) return 0;
  const clamped = Math.min(Math.max(page, 0), pageCount - 1);
  return (pageCount - 1 - clamped) * pageWidth;
}

export function pageFromOffset(offset: number, pageWidth: number, pageCount: number): number {
  if (pageWidth <= 0 || pageCount <= 0) return 0;
  const physical = Math.round(offset / pageWidth);
  const logical = pageCount - 1 - physical;
  return Math.min(Math.max(logical, 0), pageCount - 1);
}

// Maps a rail fraction (0 = start of chapter) to a logical page index.
export function pageForFraction(fraction: number, pageCount: number): number {
  if (pageCount <= 1) return 0;
  const clamped = Math.min(Math.max(fraction, 0), 1);
  // At fraction 1 we want the LAST page visible in full — not one past it.
  return Math.min(Math.floor(clamped * pageCount), pageCount - 1);
}

// Inverse: progress fraction at which a given logical page is centered.
export function fractionForPage(page: number, pageCount: number): number {
  if (pageCount <= 1) return 0;
  const clamped = Math.min(Math.max(page, 0), pageCount - 1);
  return clamped / pageCount;
}
