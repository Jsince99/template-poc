import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  orientation?: "portrait" | "landscape";
  pageSize?: "a4" | "letter";
}

// A4 in mm
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;

/**
 * Find natural page-break positions by scanning block-level children.
 * Returns an array of Y offsets (in px, relative to the element) where
 * a page break should occur — i.e. just before a block that would cross
 * a page boundary.
 */
function findBreakPositions(el: HTMLElement, pageHeightPx: number): number[] {
  const containerTop = el.getBoundingClientRect().top + window.scrollY;
  const breaks: number[] = [];

  // Collect all direct section children and major block elements
  const candidates = el.querySelectorAll<HTMLElement>(
    "section, .document-header, .address-pair, .address-block, " +
    ".key-value-grid, .data-table, .summary-table, .bank-details, " +
    ".signature-block, .terms-conditions, .document-footer, " +
    ".section-heading, .text-block, tr"
  );

  let currentPageEnd = pageHeightPx;

  candidates.forEach((child) => {
    const rect = child.getBoundingClientRect();
    const top = rect.top + window.scrollY - containerTop;
    const bottom = rect.bottom + window.scrollY - containerTop;

    // If this element crosses the current page boundary, break before it
    if (top < currentPageEnd && bottom > currentPageEnd) {
      // Only break before the element if it's not a table row
      // (rows inside a table: break before the row's top)
      const breakAt = top > 0 ? top : currentPageEnd;
      breaks.push(breakAt);
      // Advance page boundary past this element
      while (currentPageEnd < bottom) {
        currentPageEnd += pageHeightPx;
      }
    } else if (bottom > currentPageEnd) {
      currentPageEnd += pageHeightPx;
    }
  });

  return breaks;
}

/**
 * Export an HTML element to PDF.
 * Slices at block boundaries to avoid cutting through content.
 * Returns a Blob URL for preview, or saves directly if filename given.
 */
export async function exportToPDF(
  htmlElement: HTMLElement,
  filename: string = "document.pdf",
  options?: PDFExportOptions
): Promise<void> {
  const blob = await renderToPdfBlob(htmlElement, options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function renderToPdfBlob(
  htmlElement: HTMLElement,
  options?: PDFExportOptions
): Promise<Blob> {
  // Override min-height so html2canvas captures only actual content height,
  // not the A4 min-height that would produce a blank trailing page.
  const prevMinHeight = htmlElement.style.minHeight;
  htmlElement.style.minHeight = "0";

  const canvas = await html2canvas(htmlElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    scrollY: -window.scrollY,
    windowWidth: htmlElement.scrollWidth,
    windowHeight: htmlElement.scrollHeight,
  });

  htmlElement.style.minHeight = prevMinHeight;

  const pdf = new jsPDF({
    orientation: options?.orientation ?? "portrait",
    unit: "mm",
    format: options?.pageSize ?? "a4",
  });

  const pageWMm = pdf.internal.pageSize.getWidth();
  const pageHMm = pdf.internal.pageSize.getHeight();

  // Scale: how many canvas pixels = 1mm
  const pxPerMm = canvas.width / pageWMm;
  const pageHPx = pageHMm * pxPerMm;

  const totalHeightPx = canvas.height;

  // Find natural break positions in the source element (in px, unscaled)
  // html2canvas uses scale:2 so canvas pixels = element pixels * 2
  const elementPxPerMm = htmlElement.offsetWidth / pageWMm;
  const pageHElementPx = pageHMm * elementPxPerMm;
  const breakPositionsElementPx = findBreakPositions(htmlElement, pageHElementPx);

  // Convert break positions to canvas pixels
  const breakPositionsCanvasPx = breakPositionsElementPx.map(
    (p) => (p / htmlElement.offsetHeight) * totalHeightPx
  );

  // Build page slices: [startPx, endPx]
  const slices: Array<[number, number]> = [];
  let cursor = 0;

  for (const breakPx of breakPositionsCanvasPx) {
    if (breakPx > cursor && breakPx - cursor > 10) {
      slices.push([cursor, breakPx]);
      cursor = breakPx;
    }
  }
  // Last slice
  if (cursor < totalHeightPx) {
    slices.push([cursor, totalHeightPx]);
  }
  if (slices.length === 0) {
    slices.push([0, totalHeightPx]);
  }

  let firstPage = true;

  for (const [startPx, endPx] of slices) {
    const sliceHeightPx = endPx - startPx;
    const sliceHeightMm = sliceHeightPx / pxPerMm;

    // Create a temporary canvas for this slice
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const ctx = sliceCanvas.getContext("2d")!;
    ctx.drawImage(canvas, 0, -startPx);

    const imgData = sliceCanvas.toDataURL("image/png");

    if (!firstPage) {
      pdf.addPage(options?.pageSize ?? "a4", options?.orientation ?? "portrait");
    }
    firstPage = false;

    // Place image at top of page; if slice is shorter than page height, it just doesn't fill
    pdf.addImage(imgData, "PNG", 0, 0, pageWMm, sliceHeightMm);
  }

  return pdf.output("blob");
}
