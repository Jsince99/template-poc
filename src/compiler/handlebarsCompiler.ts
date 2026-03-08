import Handlebars from "handlebars";
import type {
  Block,
  DocTemplate,
  ConditionalBlock,
  LoopBlock,
} from "../types/blocks";

// --- Register Handlebars helpers ---

Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);

Handlebars.registerHelper("formatCurrency", (value: unknown) => {
  if (value == null || value === "") return "";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(num);
});

Handlebars.registerHelper("formatDate", (value: unknown) => {
  if (value == null || value === "") return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime()))
    return String(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

Handlebars.registerHelper("formatNumber", (value: unknown) => {
  if (value == null || value === "") return "";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat().format(num);
});

// --- Block to HTML conversion ---

function wrapSection(html: string, block: Block): string {
  const inner = `<section data-block-type="${block.type}" data-block-id="${block.id}">${html}</section>`;
  if (block.visibilityCondition) {
    const path = block.visibilityCondition
      .replace(/^\{\{\s*/, "")
      .replace(/\s*\}\}$/, "")
      .trim();
    return `{{#if ${path}}}\n${inner}\n{{/if}}`;
  }
  return inner;
}

/** Extract Handlebars path from "{{path}}" or return as-is */
function extractPath(value: string): string {
  const m = value.match(/^\{\{\s*(.+?)\s*\}\}$/);
  return m ? m[1].trim() : value;
}

export function blockToHTML(block: Block): string {
  const wrap = (inner: string) => wrapSection(inner, block);

  switch (block.type) {
    case "document-header": {
      const p = block.props;
      const logo = p.logo
        ? `<img src="${p.logo}" alt="Logo" class="doc-logo" />`
        : "";
      return wrap(`
        <div class="document-header layout-${p.layout ?? "logo-left"}">
          ${logo}
          <div class="header-text">
            <div class="company-name">${p.companyName}</div>
            <h1 class="document-title">${p.documentTitle}</h1>
            ${p.documentSubtitle ? `<div class="document-subtitle">${p.documentSubtitle}</div>` : ""}
          </div>
        </div>
      `);
    }

    case "address-block": {
      const p = block.props;
      const extrasHtml = (p.extras ?? [])
        .map(
          (e) =>
            `<div class="extra-row"><span class="extra-label">${e.label}:</span> ${e.value}</div>`
        )
        .join("");
      const extras = extrasHtml
        ? `<div class="address-extras">${extrasHtml}</div>`
        : "";
      return wrap(`
        <div class="address-block">
          <div class="address-label">${p.label}</div>
          <div class="address-name">${p.name}</div>
          <div class="address-lines">${p.addressLines ?? ""}</div>
          ${p.city ? `<div class="address-city">${p.city}</div>` : ""}
          ${p.state ? `<div class="address-state">${p.state}</div>` : ""}
          ${p.zip ? `<div class="address-zip">${p.zip}</div>` : ""}
          ${p.country ? `<div class="address-country">${p.country}</div>` : ""}
          ${extras}
        </div>
      `);
    }

    case "address-pair": {
      const p = block.props;
      const left = p.left;
      const right = p.right;
      const leftExtras = (left.extras ?? [])
        .map(
          (e) =>
            `<div class="extra-row"><span class="extra-label">${e.label}:</span> ${e.value}</div>`
        )
        .join("");
      const rightExtras = (right.extras ?? [])
        .map(
          (e) =>
            `<div class="extra-row"><span class="extra-label">${e.label}:</span> ${e.value}</div>`
        )
        .join("");
      return wrap(`
        <div class="address-pair ratio-${p.columnRatio ?? "50-50"}">
          <div class="address-left">
            <div class="address-label">${left.label}</div>
            <div class="address-name">${left.name}</div>
            <div class="address-lines">${left.addressLines ?? ""}</div>
            ${leftExtras}
          </div>
          <div class="address-right">
            <div class="address-label">${right.label}</div>
            <div class="address-name">${right.name}</div>
            <div class="address-lines">${right.addressLines ?? ""}</div>
            ${rightExtras}
          </div>
        </div>
      `);
    }

    case "key-value-grid": {
      const p = block.props;
      const cols = p.columns ?? 2;
      const itemsHtml = (p.items ?? [])
        .map(
          (item) =>
            `<div class="kv-item"><span class="kv-label">${item.label}</span><span class="kv-value">${item.value}</span></div>`
        )
        .join("");
      return wrap(`
        <div class="key-value-grid cols-${cols} layout-${p.layout ?? "bordered"}">
          ${itemsHtml}
        </div>
      `);
    }

    case "data-table": {
      const p = block.props;
      const thead = p.columns
        .map((c) => `<th class="align-${c.align ?? "left"}">${c.header}</th>`)
        .join("");
      const cellTemplates = p.columns
        .map((c) => {
          const align = c.align ?? "left";
          const fmt = c.format;
          const field = c.field;
          if (fmt && fmt !== "none") {
            const h =
              fmt === "currency"
                ? "formatCurrency"
                : fmt === "number"
                  ? "formatNumber"
                  : fmt === "date"
                    ? "formatDate"
                    : "formatNumber";
            return `<td class="align-${align}">{{${h} (lookup . "${field}")}}</td>`;
          }
          return `<td class="align-${align}">{{lookup . "${field}"}}</td>`;
        })
        .join("");
      return wrap(`
        <table class="data-table border-${p.borderStyle ?? "full"} ${p.zebraStripe ? "zebra" : ""}">
          <thead><tr>${p.showIndex ? "<th>#</th>" : ""}${thead}</tr></thead>
          <tbody>
          {{#each ${p.each}}}
          <tr>${p.showIndex ? "<td>{{@index}}</td>" : ""}${cellTemplates}</tr>
          {{/each}}
          </tbody>
        </table>
      `);
    }

    case "summary-table": {
      const p = block.props;
      const itemEls = (p.items ?? []).map((item) => {
        const style = item.style ?? "normal";
        const fmt = item.format;
        const path = extractPath(item.value);
        let val: string;
        if (fmt === "currency") val = `{{formatCurrency ${path}}}`;
        else if (fmt === "number") val = `{{formatNumber ${path}}}`;
        else if (fmt === "percentage") val = `{{formatNumber ${path}}}%`;
        else val = `{{${path}}}`;
        return `<div class="summary-item style-${style}"><span class="summary-label">${item.label}</span><span class="summary-value">${val}</span></div>`;
      });
      return wrap(
        `<div class="summary-table alignment-${p.alignment ?? "right-aligned"}">${itemEls.join("")}</div>`
      );
    }

    case "text-block": {
      const p = block.props;
      const cls = [
        `font-${p.fontSize ?? "md"}`,
        `style-${p.textStyle ?? "normal"}`,
        `align-${p.textAlign ?? "left"}`,
      ].join(" ");
      return wrap(`<div class="text-block ${cls}">${p.content}</div>`);
    }

    case "bank-details": {
      const p = block.props;
      const labelHtml = p.label
        ? `<div class="bank-label">${p.label}</div>`
        : "";
      const fieldsHtml = (p.fields ?? [])
        .map(
          (f) =>
            `<div class="bank-field"><span class="field-label">${f.label}:</span> ${f.value}</div>`
        )
        .join("");
      return wrap(`
        <div class="bank-details border-${p.borderStyle ?? "card"}">
          ${labelHtml}
          <div class="bank-fields">${fieldsHtml}</div>
        </div>
      `);
    }

    case "signature-block": {
      const p = block.props;
      const sigHtml = (p.signatories ?? [])
        .map(
          (s) =>
            `<div class="signatory">
              ${s.showLine !== false ? '<div class="signature-line"></div>' : ""}
              <div class="signatory-name">${s.name}</div>
              <div class="signatory-label">${s.label}</div>
              <div class="signatory-designation">${s.designation}</div>
            </div>`
        )
        .join("");
      return wrap(
        `<div class="signature-block layout-${p.layout ?? "side-by-side"}">${sigHtml}</div>`
      );
    }

    case "divider": {
      const p = block.props;
      const style = p.dividerStyle ?? "solid";
      const margin = p.margin ?? "md";
      return wrap(
        `<div class="divider style-${style} margin-${margin}"></div>`
      );
    }

    case "section-heading": {
      const p = block.props;
      const level = p.level ?? 2;
      const tag = `h${level}`;
      const underline = p.underline ? " underline" : "";
      return wrap(
        `<${tag} class="section-heading${underline}">${p.title}</${tag}>`
      );
    }

    case "terms-conditions": {
      const p = block.props;
      const titleHtml = p.title ? `<div class="terms-title">${p.title}</div>` : "";
      const listTag = p.listStyle === "numbered" ? "ol" : "ul";
      const listClass = p.listStyle === "none" ? "list-none" : "";
      const itemsHtml = (p.items ?? [])
        .map((item) => `<li>${item}</li>`)
        .join("");
      return wrap(`
        <div class="terms-conditions font-${p.fontSize ?? "xs"}">
          ${titleHtml}
          <${listTag} class="terms-list ${listClass}">${itemsHtml}</${listTag}>
        </div>
      `);
    }

    case "document-footer": {
      const p = block.props;
      const border = p.showBorder ? " show-border" : "";
      return wrap(`
        <div class="document-footer font-${p.fontSize ?? "xs"}${border}">
          <div class="footer-left">${p.left ?? ""}</div>
          <div class="footer-center">${p.center ?? ""}</div>
          <div class="footer-right">${p.right ?? ""}</div>
        </div>
      `);
    }

    case "conditional": {
      const b = block as ConditionalBlock;
      const p = b.props;
      const childrenHtml = (b.children ?? []).map(blockToHTML).join("\n");
      let open: string;
      let close: string;
      if (p.operator === "unless") {
        open = `{{#unless ${p.expression}}}`;
        close = "{{/unless}}";
      } else if (p.operator === "equals" && p.compareValue != null) {
        const cv =
          typeof p.compareValue === "string"
            ? `"${String(p.compareValue).replace(/"/g, '\\"')}"`
            : String(p.compareValue);
        open = `{{#if (eq ${p.expression} ${cv})}}`;
        close = "{{/if}}";
      } else {
        open = `{{#if ${p.expression}}}`;
        close = "{{/if}}";
      }
      return wrap(`${open}\n${childrenHtml}\n${close}`);
    }

    case "loop": {
      const b = block as LoopBlock;
      const p = b.props;
      const alias = p.itemAlias ?? "this";
      const blockParams = p.indexAlias
        ? ` as |${alias} ${p.indexAlias}|`
        : ` as |${alias}|`;
      const childrenHtml = (b.children ?? []).map(blockToHTML).join("\n");
      return wrap(
        `{{#each ${p.each}${blockParams}}}\n${childrenHtml}\n{{/each}}`
      );
    }

    default: {
      const b = block as { type: string };
      return wrap(`<!-- Unknown block type: ${b.type} -->`);
    }
  }
}

export function templateToHTML(template: DocTemplate): string {
  return template.blocks.map(blockToHTML).join("\n");
}

export function compile(
  template: DocTemplate,
  data: Record<string, unknown>
): string {
  const htmlTemplate = templateToHTML(template);
  const compiled = Handlebars.compile(htmlTemplate);
  return compiled(data);
}
