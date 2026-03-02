import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Capture an element and export as a PDF.
 * Supports multi-page when content exceeds a single A4 page.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName = 'report.pdf'
) {
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // calculate the image height to preserve aspect ratio
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}

export async function exportById(id: string, fileName?: string) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element with id '${id}' not found`);
  }
  await exportElementToPdf(el, fileName || `${id}.pdf`);
}
