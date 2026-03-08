import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  orientation?: "portrait" | "landscape";
  pageSize?: "a4" | "letter";
}

/**
 * Export an HTML element to PDF using html2canvas and jsPDF.
 * Supports multi-page output when content exceeds page height.
 */
export async function exportToPDF(
  htmlElement: HTMLElement,
  filename: string = "document.pdf",
  options?: PDFExportOptions
): Promise<void> {
  const canvas = await html2canvas(htmlElement, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: options?.orientation ?? "portrait",
    unit: "mm",
    format: options?.pageSize ?? "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  let pageNum = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  pageNum = 1;

  while (heightLeft > 0) {
    pdf.addPage(options?.pageSize ?? "a4", options?.orientation ?? "portrait");
    position = -pageNum * pageHeight;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    pageNum++;
  }

  pdf.save(filename);
}
