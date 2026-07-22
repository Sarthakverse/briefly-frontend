import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string = 'export.pdf'
): Promise<void> {
  
  // 1. PREPARE THE DOM FOR EXPORT
  const originalOverflow = element.style.overflow;
  const originalHeight = element.style.height;

  // Temporarily reveal the hidden .pdf-header
  const pdfHeader = element.querySelector('.pdf-header') as HTMLElement;
  let headerOriginalDisplay = '';
  if (pdfHeader) {
    headerOriginalDisplay = pdfHeader.style.display;
    pdfHeader.style.display = 'block';
  }

  // --- NEW: Temporarily hide unwanted elements ---
  const elementsToHide = element.querySelectorAll('.hide-in-pdf');
  const hiddenOriginalStyles: { el: HTMLElement; display: string }[] = [];
  elementsToHide.forEach((child) => {
    const el = child as HTMLElement;
    hiddenOriginalStyles.push({ el, display: el.style.display });
    el.style.display = 'none'; // Remove it from layout so it doesn't leave an empty gap
  });
  // ----------------------------------------------

  // Find all scrollable child containers inside your workspace/meeting views
  const scrollContainers = element.querySelectorAll('.overflow-y-auto, .overflow-auto');
  const scrollOriginalStyles: { el: HTMLElement; overflow: string; height: string }[] = [];
  
  // Force all scroll containers to expand to their full height
  scrollContainers.forEach((child) => {
    const el = child as HTMLElement;
    scrollOriginalStyles.push({ el, overflow: el.style.overflow, height: el.style.height });
    el.style.overflow = 'visible';
    el.style.height = 'auto';
  });

  // Force the main wrapper to expand to fit the newly unrolled content
  element.style.overflow = 'visible';
  element.style.height = 'auto';

  // Give the browser 150ms to repaint the expanded layout before snapping the picture
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    // 2. CAPTURE THE FULL ELEMENT
    const imgData = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2, // High DPI for crisp text
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // 3. GENERATE THE PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // Calculate the total height of the image in PDF terms
    const imgHeight = (element.scrollHeight * imgWidth) / element.scrollWidth;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle pagination (if the content is taller than 1 page, add new pages)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
    
  } finally {
    // 4. RESTORE THE DOM
    // Put everything exactly back to how it was instantly
    element.style.overflow = originalOverflow;
    element.style.height = originalHeight;

    if (pdfHeader) {
      pdfHeader.style.display = headerOriginalDisplay;
    }

    // --- NEW: Restore hidden elements ---
    hiddenOriginalStyles.forEach(({ el, display }) => {
      el.style.display = display;
    });
    // ------------------------------------

    scrollOriginalStyles.forEach(({ el, overflow, height }) => {
      el.style.overflow = overflow;
      el.style.height = height;
    });
  }
}