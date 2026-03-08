# Doc Templates POC — Session Context

**Purpose:** Minimal shared context for subagent-driven implementation. Each task gets only this + its task text. Reset context between tasks.

**Project:** Client-side document template builder for invoices, confirmations, vouchers (trading/finance).

**Tech stack:** Vue 3 (Composition API), Vite, PrimeVue 4, tailwindcss, Dexie.js, Handlebars.js, vuedraggable, jsPDF, html2canvas, docx, Monaco Editor, Vue Router, Pinia (global state only).

**Plan:** `docs/plans/2026-03-08-doc-templates-poc.md`

**Workspace:** `/Users/sravanth/Documents/doc-templates`

**Block types (15):** document-header, address-block, address-pair, key-value-grid, data-table, summary-table, text-block, bank-details, signature-block, divider, section-heading, terms-conditions, document-footer, conditional, loop.
