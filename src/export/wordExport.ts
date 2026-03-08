import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Extract plain text from an element, stripping HTML tags.
 */
function getTextContent(el: Element): string {
  return el.textContent?.trim() ?? "";
}

/**
 * Convert HTML string to docx Document children.
 * Best-effort mapping: tables -> Table, headings -> Heading, blocks -> Paragraph.
 */
function htmlToDocxChildren(html: string): (Paragraph | Table)[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  const children: (Paragraph | Table)[] = [];

  /**
   * Recursively collect block-level content in document order.
   * Tables and headings are emitted directly; divs/sections recurse and emit text as paragraphs.
   */
  function processNode(node: Node): void {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "table") {
      const table = htmlTableToDocx(el);
      if (table) children.push(table);
      return;
    }

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
      const level = parseInt(tag[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };
      const text = getTextContent(el);
      if (text) {
        children.push(
          new Paragraph({
            text,
            heading: headingMap[level],
          })
        );
      }
      return;
    }

    if (tag === "hr" || el.classList.contains("divider")) {
      children.push(new Paragraph({ text: "—".repeat(40) }));
      return;
    }

    // For sections and block containers: recurse first, then add own text if it's a leaf block
    const hasTable = el.querySelector("table");
    const hasHeading = el.querySelector("h1, h2, h3, h4, h5, h6");
    const blockClasses = [
      "document-header",
      "address-block",
      "address-left",
      "address-right",
      "address-pair",
      "key-value-grid",
      "kv-item",
      "summary-table",
      "summary-item",
      "text-block",
      "bank-details",
      "signature-block",
      "signatory",
      "section-heading",
      "terms-conditions",
      "terms-title",
      "terms-list",
      "document-footer",
    ];
    const isBlock = blockClasses.some((c) => el.classList.contains(c));

    if (tag === "section" || tag === "div" || isBlock) {
      Array.from(el.children).forEach(processNode);
      // If no table/heading in children and we have text, add as paragraph
      const text = getTextContent(el);
      const hasBlockChildren = Array.from(el.children).some(
        (c) =>
          c.nodeType === Node.ELEMENT_NODE &&
          ((c as Element).tagName === "TABLE" ||
            /^H[1-6]$/.test((c as Element).tagName) ||
            blockClasses.some((bc) => (c as Element).classList?.contains(bc)))
      );
      if (text && !hasTable && !hasHeading && !hasBlockChildren) {
        children.push(new Paragraph({ text }));
      }
      return;
    }

    if (tag === "p") {
      const text = getTextContent(el);
      if (text) children.push(new Paragraph({ text }));
      return;
    }

    // Default: recurse
    Array.from(el.children).forEach(processNode);
  }

  const sections = body.querySelectorAll("section");
  if (sections.length > 0) {
    sections.forEach((section) => Array.from(section.children).forEach(processNode));
  } else {
    Array.from(body.children).forEach(processNode);
  }

  if (children.length === 0) {
    const text = getTextContent(body);
    if (text) children.push(new Paragraph({ text }));
  }

  return children;
}

/**
 * Convert HTML table element to docx Table.
 */
function htmlTableToDocx(tableEl: Element): Table | null {
  const rows = tableEl.querySelectorAll("tr");
  if (rows.length === 0) return null;

  const docxRows = Array.from(rows).map((tr) => {
    const cells = tr.querySelectorAll("td, th");
    const docxCells = Array.from(cells).map((cell) => {
      const text = getTextContent(cell);
      return new TableCell({
        children: [new Paragraph({ text: text || " " })],
      });
    });
    // Ensure at least one cell
    if (docxCells.length === 0) {
      docxCells.push(new TableCell({ children: [new Paragraph({ text: " " })] }));
    }
    return new TableRow({
      children: docxCells,
      tableHeader: tr.querySelector("th") !== null,
    });
  });

  return new Table({
    rows: docxRows,
  });
}

/**
 * Export compiled HTML to a Word document.
 */
export async function exportToWord(
  compiledHTML: string,
  filename: string = "document.docx"
): Promise<void> {
  const children = htmlToDocxChildren(compiledHTML);

  if (children.length === 0) {
    children.push(new Paragraph({ text: "(No content)" }));
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
