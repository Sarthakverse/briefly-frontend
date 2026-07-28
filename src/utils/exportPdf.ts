import { jsPDF } from 'jspdf';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PDFSection {
  title: string;
  /** Draws the text body; returns the new Y position */
  body: (doc: jsPDF, startY: number) => number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Add document header – returns the Y coordinate immediately below the header line */
function addHeader(doc: jsPDF, title: string, metadata: string): number {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title, 180);
  doc.text(titleLines, 15, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const metaLines = doc.splitTextToSize(metadata, 180);
  const metaY = 20 + titleLines.length * 7 + 3;
  doc.text(metaLines, 15, metaY);

  doc.setDrawColor(200);
  const lineY = metaY + metaLines.length * 4 + 3;
  doc.line(15, lineY, 195, lineY);
  return lineY + 5; // next available Y
}

/** Add page numbers and timestamp to every page */
function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text(`Generated ${new Date().toLocaleString()}`, 15, 290);
  }
}

/**
 * Main export function.
 *
 * @param title      Document title
 * @param metadata   Additional info line (e.g., adapter / release)
 * @param sections   Ordered list of text-only sections
 * @param pageLink   Optional URL to the original page – rendered as a clickable link at the end
 */
export async function exportReportToPDF(
  title: string,
  metadata: string,
  sections: PDFSection[],
  pageLink?: string
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  let y = addHeader(doc, title, metadata);

  for (const section of sections) {
    // Section heading
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, y);
    y += 7;

    // Text body – returns new Y
    y = section.body(doc, y);

    // Spacing after text
    y += 3;

    // If section ended near page bottom, start next section on fresh page
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
  }

  // ---- Clickable link to the original page ----
  if (pageLink) {
    y += 10;
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('View online:', margin, y);
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(pageLink, margin + 25, y, { url: pageLink });
    doc.setTextColor(0);
  }

  addFooter(doc);
  doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}

/** Helper: format a detailed summary JSON into jspdf */
export function formatDetailedSummary(
  ds: any,
  doc: jsPDF,
  startY: number,
  margin: number = 15
): number {
  let y = startY;
  const write = (
    text: string,
    opts: { bold?: boolean; fontSize?: number } = {}
  ) => {
    doc.setFontSize(opts.fontSize || 10);
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, margin, y);
    return y + lines.length * 5;
  };

  if (ds?.objective) {
    y = write('Objective:', { bold: true }) + 2;
    y = write(ds.objective, { fontSize: 9 });
  }

  if (ds?.discussionTopics?.length) {
    y = write('Discussion Topics:', { bold: true }) + 2;
    for (const topic of ds.discussionTopics) {
      y = write(`• ${topic.topic} [${topic.status}]`, {
        bold: true,
        fontSize: 9,
      });
      y = write(`  ${topic.discussion}`, { fontSize: 9 });
    }
  }

  if (ds?.decisionsMade?.length) {
    y = write('Key Decisions:', { bold: true }) + 2;
    for (const d of ds.decisionsMade) {
      y = write(`• ${d}`, { fontSize: 9 });
    }
  }

  if (ds?.actionItems?.length) {
    y = write('Action Items:', { bold: true }) + 2;
    for (const ai of ds.actionItems) {
      y = write(
        `• [${ai.owner}] ${ai.task} (deadline: ${ai.deadline}, status: ${ai.status})`,
        { fontSize: 9 }
      );
      if (ai.notes) y = write(`  Notes: ${ai.notes}`, { fontSize: 9 });
    }
  }

  if (ds?.blockersAndRisks?.length) {
    y = write('Blockers & Risks:', { bold: true }) + 2;
    for (const br of ds.blockersAndRisks) {
      y = write(
        `• ${br.description} (Raised: ${br.raisedBy}, Owner: ${br.owner})`,
        { fontSize: 9 }
      );
      y = write(`  Mitigation: ${br.mitigation}`, { fontSize: 9 });
    }
  }

  return y;
}