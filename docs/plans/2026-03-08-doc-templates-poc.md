# Doc Templates POC - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a client-side document template builder POC for trading/finance documents (invoices, confirmations, vouchers) with a block-based drag-and-drop editor, Handlebars compilation, and PDF/Word export.

**Architecture:** Vue 3 SPA with PrimeVue UI components. Templates are JSON trees of typed blocks (15 types: 13 content + 2 logic containers) stored in IndexedDB via Dexie.js. The builder is a three-panel layout (palette / canvas / properties). A playground view lets users inject JSON data and preview compiled output. Export uses jsPDF + html2canvas for PDF and docx for Word.

**Tech Stack:** Vue 3 (Composition API), Vite, PrimeVue 4, tailwindcss, Dexie.js, Handlebars.js, vuedraggable, jsPDF, html2canvas, docx, Monaco Editor, Vue Router, Pinia ( only for global states )

---

## Project Structure

```
doc-templates/
├── docs/plans/                        # This plan
├── src/
│   ├── main.ts                        # App entry
│   ├── App.vue                        # Root component + router-view
│   ├── router/
│   │   └── index.ts                   # Vue Router config
│   ├── stores/
│   │   └── templateStore.ts           # Pinia store for template CRUD
│   ├── db/
│   │   └── index.ts                   # Dexie.js database setup
│   ├── types/
│   │   └── blocks.ts                  # TypeScript types for all block types
│   ├── registry/
│   │   └── blockRegistry.ts           # Block type registry (metadata, defaults, schemas)
│   ├── blocks/
│   │   ├── renderers/                 # Vue components that render each block in preview
│   │   │   ├── DocumentHeaderRenderer.vue
│   │   │   ├── AddressBlockRenderer.vue
│   │   │   ├── AddressPairRenderer.vue
│   │   │   ├── KeyValueGridRenderer.vue
│   │   │   ├── DataTableRenderer.vue
│   │   │   ├── SummaryTableRenderer.vue
│   │   │   ├── TextBlockRenderer.vue
│   │   │   ├── BankDetailsRenderer.vue
│   │   │   ├── SignatureBlockRenderer.vue
│   │   │   ├── DividerRenderer.vue
│   │   │   ├── SectionHeadingRenderer.vue
│   │   │   ├── TermsConditionsRenderer.vue
│   │   │   ├── DocumentFooterRenderer.vue
│   │   │   ├── ConditionalRenderer.vue
│   │   │   ├── LoopRenderer.vue
│   │   │   └── BlockRenderer.vue      # Dispatcher: picks renderer by block.type
│   │   ├── editors/                   # Vue components for properties panel per block
│   │   │   ├── DocumentHeaderEditor.vue
│   │   │   ├── AddressBlockEditor.vue
│   │   │   ├── AddressPairEditor.vue
│   │   │   ├── KeyValueGridEditor.vue
│   │   │   ├── DataTableEditor.vue
│   │   │   ├── SummaryTableEditor.vue
│   │   │   ├── TextBlockEditor.vue
│   │   │   ├── BankDetailsEditor.vue
│   │   │   ├── SignatureBlockEditor.vue
│   │   │   ├── DividerEditor.vue
│   │   │   ├── SectionHeadingEditor.vue
│   │   │   ├── TermsConditionsEditor.vue
│   │   │   ├── DocumentFooterEditor.vue
│   │   │   ├── ConditionalEditor.vue
│   │   │   ├── LoopEditor.vue
│   │   │   └── BlockEditor.vue        # Dispatcher: picks editor by block.type
│   │   └── palette/
│   │       └── BlockPalette.vue       # Sidebar with draggable block type list
│   ├── compiler/
│   │   └── handlebarsCompiler.ts      # Template JSON → Handlebars HTML → rendered HTML
│   ├── export/
│   │   ├── pdfExport.ts              # html2canvas + jsPDF
│   │   └── wordExport.ts             # docx generation
│   ├── components/
│   │   ├── DynamicList.vue           # Reusable add/remove/reorder list component
│   │   ├── VariableInput.vue         # Text input with {{variable}} autocomplete hint
│   │   └── ColorPickerField.vue      # Labeled color picker wrapper
│   ├── views/
│   │   ├── DashboardView.vue         # Template list, CRUD
│   │   ├── BuilderView.vue           # Three-panel template builder
│   │   └── PlaygroundView.vue        # JSON editor + template picker + live preview
│   ├── data/
│   │   └── starterTemplates.ts       # 3 built-in templates (invoice, confirmation, voucher)
│   └── assets/
│       └── styles/
│           └── document.css           # Print/preview styles for rendered documents
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── env.d.ts
```

---

## Task 1: Project Scaffolding

**Files:**

- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `env.d.ts`, `src/main.ts`, `src/App.vue`

**Step 1: Scaffold Vue 3 + Vite project**

```bash
npm create vite@latest . -- --template vue-ts
```

Select Vue + TypeScript when prompted. This generates the base files.

**Step 2: Install all dependencies**

```bash
npm install primevue @primevue/themes primeicons vue-router@4 pinia dexie handlebars vuedraggable@next jspdf html2canvas docx @monaco-editor/loader monaco-editor nanoid
npm install -D @types/sortablejs
```

**Step 3: Configure PrimeVue in `src/main.ts`**

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import router from "./router";
import App from "./App.vue";
import "primeicons/primeicons.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.mount("#app");
```

**Step 4: Set up `src/App.vue`**

```vue
<template>
  <router-view />
</template>
```

**Step 5: Create router in `src/router/index.ts`**

```typescript
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
    },
    {
      path: "/builder/:id",
      name: "builder",
      component: () => import("../views/BuilderView.vue"),
    },
    {
      path: "/playground",
      name: "playground",
      component: () => import("../views/PlaygroundView.vue"),
    },
  ],
});

export default router;
```

**Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server on http://localhost:5173, blank page, no errors.

**Step 7: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold vue3 + vite + primevue + dependencies"
```

---

## Task 2: TypeScript Types & Block Registry

**Files:**

- Create: `src/types/blocks.ts`, `src/registry/blockRegistry.ts`

**Step 1: Define all block types in `src/types/blocks.ts`**

```typescript
import type { Component } from "vue";

export interface BaseBlock {
  id: string;
  type: string;
  style?: BlockStyle;
  visibilityCondition?: string;
  cssClass?: string;
}

export interface BlockStyle {
  marginTop?: "none" | "sm" | "md" | "lg";
  marginBottom?: "none" | "sm" | "md" | "lg";
  backgroundColor?: string;
}

// --- Content Blocks ---

export interface DocumentHeaderBlock extends BaseBlock {
  type: "document-header";
  props: {
    logo?: string;
    companyName: string;
    documentTitle: string;
    documentSubtitle?: string;
    accentColor?: string;
    layout?: "logo-left" | "centered" | "logo-right";
  };
}

export interface AddressBlockProps {
  label: string;
  name: string;
  addressLines?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  extras?: Array<{ label: string; value: string }>;
}

export interface AddressBlock extends BaseBlock {
  type: "address-block";
  props: AddressBlockProps;
}

export interface AddressPairBlock extends BaseBlock {
  type: "address-pair";
  props: {
    left: AddressBlockProps;
    right: AddressBlockProps;
    columnRatio?: "50-50" | "40-60" | "60-40";
  };
}

export interface KeyValueItem {
  label: string;
  value: string;
}

export interface KeyValueGridBlock extends BaseBlock {
  type: "key-value-grid";
  props: {
    columns?: 1 | 2 | 3 | 4;
    items: KeyValueItem[];
    layout?: "bordered" | "striped" | "minimal";
  };
}

export interface TableColumn {
  header: string;
  field: string;
  align?: "left" | "center" | "right";
  width?: string;
  format?: "none" | "currency" | "number" | "date" | "percentage";
}

export interface DataTableBlock extends BaseBlock {
  type: "data-table";
  props: {
    each: string;
    columns: TableColumn[];
    showIndex?: boolean;
    zebraStripe?: boolean;
    borderStyle?: "full" | "horizontal" | "minimal" | "none";
  };
}

export interface SummaryItem {
  label: string;
  value: string;
  format?: "currency" | "number" | "percentage";
  style?: "normal" | "deduction" | "subtotal" | "grand-total";
}

export interface SummaryTableBlock extends BaseBlock {
  type: "summary-table";
  props: {
    items: SummaryItem[];
    labelWidth?: string;
    alignment?: "right-aligned" | "full-width";
  };
}

export interface TextBlockBlock extends BaseBlock {
  type: "text-block";
  props: {
    content: string;
    fontSize?: "xs" | "sm" | "md" | "lg";
    textStyle?: "normal" | "muted" | "highlight" | "legal";
    textAlign?: "left" | "center" | "right" | "justify";
  };
}

export interface BankDetailsBlock extends BaseBlock {
  type: "bank-details";
  props: {
    label?: string;
    fields: Array<{ label: string; value: string }>;
    showIcon?: boolean;
    borderStyle?: "card" | "minimal" | "none";
  };
}

export interface Signatory {
  label: string;
  name: string;
  designation: string;
  showLine?: boolean;
}

export interface SignatureBlockBlock extends BaseBlock {
  type: "signature-block";
  props: {
    signatories: Signatory[];
    layout?: "side-by-side" | "stacked";
  };
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  props: {
    dividerStyle?: "solid" | "dashed" | "dotted" | "double" | "space-only";
    thickness?: number;
    color?: string;
    margin?: "sm" | "md" | "lg";
  };
}

export interface SectionHeadingBlock extends BaseBlock {
  type: "section-heading";
  props: {
    title: string;
    level?: 2 | 3 | 4;
    underline?: boolean;
    accentColor?: string;
  };
}

export interface TermsConditionsBlock extends BaseBlock {
  type: "terms-conditions";
  props: {
    title?: string;
    items: string[];
    listStyle?: "numbered" | "bulleted" | "none";
    fontSize?: "xs" | "sm";
  };
}

export interface DocumentFooterBlock extends BaseBlock {
  type: "document-footer";
  props: {
    left?: string;
    center?: string;
    right?: string;
    showBorder?: boolean;
    fontSize?: "xs" | "sm";
  };
}

// --- Logic / Container Blocks ---

export interface ConditionalBlock extends BaseBlock {
  type: "conditional";
  props: {
    expression: string;
    operator: "if" | "unless" | "equals";
    compareValue?: string;
    label?: string;
  };
  children: Block[];
}

export interface LoopBlock extends BaseBlock {
  type: "loop";
  props: {
    each: string;
    itemAlias?: string;
    indexAlias?: string;
    label?: string;
  };
  children: Block[];
}

// --- Union type ---

export type ContentBlock =
  | DocumentHeaderBlock
  | AddressBlock
  | AddressPairBlock
  | KeyValueGridBlock
  | DataTableBlock
  | SummaryTableBlock
  | TextBlockBlock
  | BankDetailsBlock
  | SignatureBlockBlock
  | DividerBlock
  | SectionHeadingBlock
  | TermsConditionsBlock
  | DocumentFooterBlock;

export type ContainerBlock = ConditionalBlock | LoopBlock;

export type Block = ContentBlock | ContainerBlock;

export function isContainerBlock(block: Block): block is ContainerBlock {
  return block.type === "conditional" || block.type === "loop";
}

// --- Template ---

export interface DocTemplate {
  id: string;
  name: string;
  description?: string;
  type: "invoice" | "confirmation" | "voucher" | "statement" | "other";
  blocks: Block[];
  sampleData?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
```

**Step 2: Create block registry in `src/registry/blockRegistry.ts`**

This file registers metadata for all 15 block types: display name, icon, category, default props factory. The registry drives the block palette and creates new block instances with defaults.

```typescript
import { nanoid } from "nanoid";
import type { Block } from "../types/blocks";

export interface BlockMeta {
  type: string;
  label: string;
  icon: string;
  category: "content" | "logic";
  description: string;
  createDefault: () => Block;
}

function id() {
  return `blk_${nanoid(8)}`;
}

export const blockRegistry: BlockMeta[] = [
  {
    type: "document-header",
    label: "Document Header",
    icon: "pi pi-id-card",
    category: "content",
    description: "Logo, company name, document title",
    createDefault: () => ({
      id: id(),
      type: "document-header",
      props: {
        companyName: "{{company.name}}",
        documentTitle: "DOCUMENT",
        layout: "logo-left",
      },
    }),
  },
  {
    type: "address-block",
    label: "Address Block",
    icon: "pi pi-map-marker",
    category: "content",
    description: "Labeled address card with optional extras",
    createDefault: () => ({
      id: id(),
      type: "address-block",
      props: {
        label: "Bill To",
        name: "{{customer.name}}",
        addressLines: "{{customer.address}}",
        extras: [],
      },
    }),
  },
  {
    type: "address-pair",
    label: "Address Pair",
    icon: "pi pi-arrows-h",
    category: "content",
    description: "Two address blocks side by side",
    createDefault: () => ({
      id: id(),
      type: "address-pair",
      props: {
        left: {
          label: "From",
          name: "{{company.name}}",
          addressLines: "{{company.address}}",
          extras: [],
        },
        right: {
          label: "Bill To",
          name: "{{customer.name}}",
          addressLines: "{{customer.address}}",
          extras: [],
        },
        columnRatio: "50-50",
      },
    }),
  },
  {
    type: "key-value-grid",
    label: "Key-Value Grid",
    icon: "pi pi-th-large",
    category: "content",
    description: "Label/value pairs in a grid layout",
    createDefault: () => ({
      id: id(),
      type: "key-value-grid",
      props: {
        columns: 2,
        items: [{ label: "Label", value: "{{value}}" }],
        layout: "bordered",
      },
    }),
  },
  {
    type: "data-table",
    label: "Data Table",
    icon: "pi pi-table",
    category: "content",
    description: "Repeating table bound to an array",
    createDefault: () => ({
      id: id(),
      type: "data-table",
      props: {
        each: "items",
        columns: [
          { header: "Description", field: "description", align: "left" },
          {
            header: "Amount",
            field: "amount",
            align: "right",
            format: "currency",
          },
        ],
        showIndex: false,
        zebraStripe: true,
        borderStyle: "full",
      },
    }),
  },
  {
    type: "summary-table",
    label: "Summary Table",
    icon: "pi pi-calculator",
    category: "content",
    description: "Totals, tax, discounts",
    createDefault: () => ({
      id: id(),
      type: "summary-table",
      props: {
        items: [
          {
            label: "Subtotal",
            value: "{{subtotal}}",
            format: "currency",
            style: "normal",
          },
          {
            label: "Total",
            value: "{{total}}",
            format: "currency",
            style: "grand-total",
          },
        ],
        labelWidth: "70%",
      },
    }),
  },
  {
    type: "text-block",
    label: "Text Block",
    icon: "pi pi-align-left",
    category: "content",
    description: "Free-form text with variables",
    createDefault: () => ({
      id: id(),
      type: "text-block",
      props: {
        content: "Enter text here...",
        fontSize: "md",
        textStyle: "normal",
        textAlign: "left",
      },
    }),
  },
  {
    type: "bank-details",
    label: "Bank Details",
    icon: "pi pi-building",
    category: "content",
    description: "Payment/settlement instructions",
    createDefault: () => ({
      id: id(),
      type: "bank-details",
      props: {
        label: "Bank Details",
        fields: [
          { label: "Bank Name", value: "{{bank.name}}" },
          { label: "Account No.", value: "{{bank.accountNumber}}" },
        ],
        showIcon: true,
        borderStyle: "card",
      },
    }),
  },
  {
    type: "signature-block",
    label: "Signature Block",
    icon: "pi pi-pencil",
    category: "content",
    description: "Signatory lines with labels",
    createDefault: () => ({
      id: id(),
      type: "signature-block",
      props: {
        signatories: [
          {
            label: "Authorized Signatory",
            name: "",
            designation: "",
            showLine: true,
          },
        ],
        layout: "side-by-side",
      },
    }),
  },
  {
    type: "divider",
    label: "Divider",
    icon: "pi pi-minus",
    category: "content",
    description: "Horizontal line or spacer",
    createDefault: () => ({
      id: id(),
      type: "divider",
      props: {
        dividerStyle: "solid",
        thickness: 1,
        color: "#cccccc",
        margin: "md",
      },
    }),
  },
  {
    type: "section-heading",
    label: "Section Heading",
    icon: "pi pi-bookmark",
    category: "content",
    description: "Section title with optional underline",
    createDefault: () => ({
      id: id(),
      type: "section-heading",
      props: { title: "Section Title", level: 2, underline: true },
    }),
  },
  {
    type: "terms-conditions",
    label: "Terms & Conditions",
    icon: "pi pi-list",
    category: "content",
    description: "Numbered or bulleted list of terms",
    createDefault: () => ({
      id: id(),
      type: "terms-conditions",
      props: {
        title: "Terms & Conditions",
        items: ["Term 1"],
        listStyle: "numbered",
        fontSize: "xs",
      },
    }),
  },
  {
    type: "document-footer",
    label: "Document Footer",
    icon: "pi pi-window-minimize",
    category: "content",
    description: "Page footer with three columns",
    createDefault: () => ({
      id: id(),
      type: "document-footer",
      props: {
        left: "",
        center: "Page {{pageNumber}}",
        right: "",
        showBorder: true,
        fontSize: "xs",
      },
    }),
  },
  {
    type: "conditional",
    label: "Conditional (if/unless)",
    icon: "pi pi-question-circle",
    category: "logic",
    description: "Show child blocks based on a condition",
    createDefault: () => ({
      id: id(),
      type: "conditional",
      props: {
        expression: "condition",
        operator: "if",
        label: "Conditional section",
      },
      children: [],
    }),
  },
  {
    type: "loop",
    label: "Loop (each)",
    icon: "pi pi-replay",
    category: "logic",
    description: "Repeat child blocks for each item in an array",
    createDefault: () => ({
      id: id(),
      type: "loop",
      props: { each: "items", itemAlias: "item", label: "Loop section" },
      children: [],
    }),
  },
];

export function getBlockMeta(type: string): BlockMeta | undefined {
  return blockRegistry.find((b) => b.type === type);
}

export function createBlock(type: string): Block {
  const meta = getBlockMeta(type);
  if (!meta) throw new Error(`Unknown block type: ${type}`);
  return meta.createDefault();
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add block type definitions and block registry"
```

---

## Task 3: Database & Template Store

**Files:**

- Create: `src/db/index.ts`, `src/stores/templateStore.ts`, `src/data/starterTemplates.ts`

**Step 1: Set up Dexie database in `src/db/index.ts`**

```typescript
import Dexie, { type EntityTable } from "dexie";
import type { DocTemplate } from "../types/blocks";

const db = new Dexie("DocTemplatesDB") as Dexie & {
  templates: EntityTable<DocTemplate, "id">;
};

db.version(1).stores({
  templates: "id, name, type, createdAt, updatedAt",
});

export { db };
```

**Step 2: Create 3 starter templates in `src/data/starterTemplates.ts`**

Create complete starter templates for Invoice, Booking Confirmation, and Voucher. Each should have 6-10 blocks demonstrating the full range of block types, plus `sampleData` that populates the template for playground preview. (Full code is extensive -- implement the Invoice template with all realistic blocks including document-header, address-pair, key-value-grid, data-table, summary-table, bank-details, terms-conditions, signature-block, document-footer. Then Confirmation with conditional and loop blocks. Then Voucher as a simpler template.)

**Step 3: Create Pinia store in `src/stores/templateStore.ts`**

```typescript
import { defineStore } from "pinia";
import { ref } from "vue";
import { db } from "../db";
import type { DocTemplate } from "../types/blocks";
import { starterTemplates } from "../data/starterTemplates";
import { nanoid } from "nanoid";

export const useTemplateStore = defineStore("templates", () => {
  const templates = ref<DocTemplate[]>([]);
  const loading = ref(false);

  async function seedIfEmpty() {
    const count = await db.templates.count();
    if (count === 0) {
      await db.templates.bulkAdd(starterTemplates);
    }
  }

  async function loadAll() {
    loading.value = true;
    await seedIfEmpty();
    templates.value = await db.templates
      .orderBy("updatedAt")
      .reverse()
      .toArray();
    loading.value = false;
  }

  async function getById(id: string): Promise<DocTemplate | undefined> {
    return db.templates.get(id);
  }

  async function create(
    partial: Pick<DocTemplate, "name" | "type" | "description">,
  ): Promise<DocTemplate> {
    const now = Date.now();
    const template: DocTemplate = {
      id: nanoid(),
      name: partial.name,
      type: partial.type,
      description: partial.description,
      blocks: [],
      sampleData: {},
      createdAt: now,
      updatedAt: now,
    };
    await db.templates.add(template);
    await loadAll();
    return template;
  }

  async function update(id: string, changes: Partial<DocTemplate>) {
    await db.templates.update(id, { ...changes, updatedAt: Date.now() });
    await loadAll();
  }

  async function remove(id: string) {
    await db.templates.delete(id);
    await loadAll();
  }

  async function duplicate(id: string): Promise<DocTemplate | undefined> {
    const original = await getById(id);
    if (!original) return;
    const now = Date.now();
    const copy: DocTemplate = {
      ...structuredClone(original),
      id: nanoid(),
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    await db.templates.add(copy);
    await loadAll();
    return copy;
  }

  return {
    templates,
    loading,
    loadAll,
    getById,
    create,
    update,
    remove,
    duplicate,
  };
});
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Dexie DB, Pinia template store, starter templates"
```

---

## Task 4: Dashboard View

**Files:**

- Create: `src/views/DashboardView.vue`

**Step 1: Build the dashboard**

Full-featured dashboard using PrimeVue components:

- **Top bar:** App title + "New Template" button (opens a Dialog with name, type, description fields)
- **Filter bar:** Tabs or SelectButton to filter by type (All / Invoice / Confirmation / Voucher / Statement / Other)
- **Template cards:** Use PrimeVue `Card` in a responsive grid. Each card shows name, type badge, description, updated date, and action buttons (Edit → navigate to `/builder/:id`, Duplicate, Delete with confirm dialog)
- **Empty state:** Illustrated empty state when no templates match filter
- Use PrimeVue components: `Button`, `Card`, `Dialog`, `InputText`, `Select`, `Toolbar`, `Tag`, `ConfirmDialog`, `Toast`

**Step 2: Verify CRUD works**

Start dev server. Dashboard should show 3 starter templates. Create a new template, duplicate one, delete one, verify IndexedDB persistence across page reload.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add dashboard view with template CRUD"
```

---

## Task 5: Reusable Components

**Files:**

- Create: `src/components/DynamicList.vue`, `src/components/VariableInput.vue`, `src/components/ColorPickerField.vue`

**Step 1: Build `DynamicList.vue`**

Generic reusable component for add/remove/reorder lists. Uses vuedraggable for reordering.

Props:

- `modelValue: any[]` (v-model)
- `addLabel?: string` (default "Add Item")
- `createDefault: () => any` (factory for new items)

Slots:

- `#item="{ item, index }"` (renders each item's form fields)

Emits:

- `update:modelValue`

Features:

- Drag handle (`≡`) via vuedraggable
- Remove button (PrimeVue `Button` with `pi-trash` icon, severity danger, text mode)
- "Add" button at bottom (PrimeVue `Button` with `pi-plus`)
- Smooth transitions on add/remove

**Step 2: Build `VariableInput.vue`**

Wrapper around PrimeVue `InputText` / `Textarea` that visually hints when the value contains `{{...}}` expressions (subtle highlight/badge).

Props:

- `modelValue: string`
- `multiline?: boolean`
- `label?: string`
- `placeholder?: string`

**Step 3: Build `ColorPickerField.vue`**

Labeled PrimeVue `ColorPicker` wrapper.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add DynamicList, VariableInput, ColorPickerField components"
```

---

## Task 6: Block Renderers (Preview Components)

**Files:**

- Create: all files in `src/blocks/renderers/`

**Step 1: Build `BlockRenderer.vue` (dispatcher)**

```vue
<template>
  <component
    :is="rendererComponent"
    :block="block"
    :data="data"
    @select="$emit('select', block)"
  />
</template>
```

Resolves `block.type` to the correct renderer component. For container blocks (`conditional`, `loop`), renders children recursively by embedding `<BlockRenderer>` for each child.

**Step 2: Build each content block renderer (13 components)**

Each renderer receives `block` (typed) and `data` (the compiled context). It renders the block as styled HTML matching document output. Use scoped CSS for print-friendly styles.

Build in this order (simplest → most complex):

1. `DividerRenderer.vue` — just a styled `<hr>`
2. `SectionHeadingRenderer.vue` — dynamic heading tag
3. `TextBlockRenderer.vue` — compiled Handlebars content
4. `DocumentHeaderRenderer.vue` — logo + title layout
5. `DocumentFooterRenderer.vue` — three-column footer
6. `AddressBlockRenderer.vue` — card with extras
7. `AddressPairRenderer.vue` — two-column layout using AddressBlockRenderer
8. `KeyValueGridRenderer.vue` — CSS grid of label/value pairs
9. `DataTableRenderer.vue` — `<table>` with `{{#each}}` iteration
10. `SummaryTableRenderer.vue` — right-aligned totals
11. `BankDetailsRenderer.vue` — card with icon
12. `SignatureBlockRenderer.vue` — signature lines
13. `TermsConditionsRenderer.vue` — ordered/unordered list

**Step 3: Build container block renderers (2 components)**

- `ConditionalRenderer.vue` — evaluates expression, renders children if truthy. In builder mode shows dashed border + badge; in preview mode renders only if condition met.
- `LoopRenderer.vue` — iterates array from data, renders children per iteration with scoped context. In builder shows border + badge; in preview repeats children.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add all block renderers including container blocks"
```

---

## Task 7: Block Editors (Properties Panel Components)

**Files:**

- Create: all files in `src/blocks/editors/`

**Step 1: Build `BlockEditor.vue` (dispatcher)**

Same pattern as `BlockRenderer.vue` — resolves `block.type` to the correct editor. Also renders the **common config** fields (margin, background, visibility condition, CSS class) shared by all blocks.

**Step 2: Build each editor (15 components)**

Each editor receives the block via `v-model` and renders PrimeVue form fields for that block's props. Use `DynamicList` for array props. Use `VariableInput` for text props that support `{{variables}}`.

Build in dependency order:

1. `DividerEditor.vue` — select + slider + color picker
2. `SectionHeadingEditor.vue` — text input + select + toggle
3. `TextBlockEditor.vue` — textarea + selects
4. `DocumentHeaderEditor.vue` — inputs + select + color
5. `DocumentFooterEditor.vue` — 3 inputs + toggle + select
6. `AddressBlockEditor.vue` — inputs + DynamicList for extras
7. `AddressPairEditor.vue` — two nested AddressBlockEditor + ratio select
8. `KeyValueGridEditor.vue` — column select + DynamicList + layout select
9. `DataTableEditor.vue` — input for `each` + DynamicList of column configs (header, field, align, width, format)
10. `SummaryTableEditor.vue` — DynamicList with label, value, format, style per row
11. `BankDetailsEditor.vue` — input + DynamicList + toggle + select
12. `SignatureBlockEditor.vue` — DynamicList of signatories + layout select
13. `TermsConditionsEditor.vue` — input + DynamicList of text items + selects
14. `ConditionalEditor.vue` — expression input, operator select, compare value (conditional on operator)
15. `LoopEditor.vue` — each input, item alias, index alias, label

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add all block property editors"
```

---

## Task 8: Builder View (Three-Panel Layout)

**Files:**

- Create: `src/views/BuilderView.vue`, `src/blocks/palette/BlockPalette.vue`

**Step 1: Build `BlockPalette.vue`**

Left sidebar listing all block types from `blockRegistry`, grouped into "Content" and "Logic" sections. Each item is draggable (clone mode via vuedraggable) — dragging from palette creates a new block instance via `createDefault()` and drops it onto the canvas.

**Step 2: Build `BuilderView.vue`**

Three-panel layout:

- **Left panel (250px):** `BlockPalette` — drag blocks from here
- **Center panel (flex):** Canvas — a nested vuedraggable list rendering `BlockRenderer` for each block. Container blocks have their own nested vuedraggable for children. Click a block to select it.
- **Right panel (320px):** Properties — `BlockEditor` for the selected block. Empty state message when nothing selected.
- **Top bar:** Template name (editable), back to dashboard button, save button, "Open in Playground" button

Canvas should show blocks in builder mode (with selection highlight, drag handles, type labels) not in final preview mode. Selected block gets a blue border.

Use PrimeVue `Splitter` or CSS grid for the layout. Use `Toolbar` for the top bar.

**Step 3: Wire up persistence**

On save: call `templateStore.update(id, { blocks, updatedAt })`. Also auto-save on block changes with a debounce (1-2 seconds).

**Step 4: Test the builder**

Open a starter template in the builder. Verify:

- Palette blocks can be dragged to canvas
- Blocks on canvas can be reordered
- Clicking a block shows its properties
- Editing properties updates the block in real-time
- Container blocks accept child blocks via drag
- Save persists to IndexedDB

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add template builder with drag-and-drop canvas and properties panel"
```

---

## Task 9: Handlebars Compiler

**Files:**

- Create: `src/compiler/handlebarsCompiler.ts`

**Step 1: Implement the compiler**

```typescript
import Handlebars from 'handlebars'
import type { Block, DocTemplate } from '../types/blocks'
import { isContainerBlock } from '../types/blocks'

// Register helpers
Handlebars.registerHelper('eq', (a, b) => a === b)
Handlebars.registerHelper('formatCurrency', (value) => /* format number as currency */)
Handlebars.registerHelper('formatDate', (value) => /* format ISO date */)
Handlebars.registerHelper('formatNumber', (value) => /* format with commas */)

export function blockToHTML(block: Block): string {
  // Switch on block.type, return Handlebars template string
  // For container blocks, recursively process children
  // Each block wraps in <section data-block-type="..." data-block-id="...">
}

export function templateToHTML(template: DocTemplate): string {
  return template.blocks.map(blockToHTML).join('\n')
}

export function compile(template: DocTemplate, data: Record<string, unknown>): string {
  const htmlTemplate = templateToHTML(template)
  const compiled = Handlebars.compile(htmlTemplate)
  return compiled(data)
}
```

The `blockToHTML` function is the core — it converts each block type's props into a Handlebars HTML template string. For example, a `data-table` block produces `<table>` with `{{#each}}` rows. A `conditional` block produces `{{#if expression}}` wrapping its compiled children.

**Step 2: Test with a starter template**

Call `compile(invoiceTemplate, invoiceSampleData)` in the console. Verify the output is valid HTML with all variables replaced.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Handlebars compiler with block-to-HTML conversion"
```

---

## Task 10: Playground View

**Files:**

- Create: `src/views/PlaygroundView.vue`

**Step 1: Build the playground layout**

Two-panel layout:

- **Left panel:** Monaco Editor for JSON data input (syntax highlighting, validation, line numbers)
- **Right panel top:** Template selector (PrimeVue `Select` listing all templates) + "Compile" button
- **Right panel bottom:** Live preview iframe/div showing the compiled HTML output

**Step 2: Wire up compilation**

When user clicks "Compile" (or on auto-compile with debounce):

1. Parse JSON from Monaco editor
2. Fetch selected template from store
3. Call `compile(template, data)`
4. Render result into a sandboxed `<div>` (with document.css styles) or `<iframe>` for style isolation

**Step 3: Pre-populate with sample data**

When user selects a template, auto-fill the Monaco editor with that template's `sampleData` as formatted JSON.

**Step 4: Add export buttons**

"Export PDF" and "Export Word" buttons above the preview. These call the export functions from Task 11.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add playground view with Monaco editor and live preview"
```

---

## Task 11: PDF & Word Export

**Files:**

- Create: `src/export/pdfExport.ts`, `src/export/wordExport.ts`

**Step 1: Implement PDF export in `src/export/pdfExport.ts`**

```typescript
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(
  htmlElement: HTMLElement,
  filename: string = "document.pdf",
  options?: {
    orientation?: "portrait" | "landscape";
    pageSize?: "a4" | "letter";
  },
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

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
```

**Step 2: Implement Word export in `src/export/wordExport.ts`**

Use the `docx` npm package to generate .docx files. Map the compiled HTML structure into docx paragraphs, tables, and sections. This is a best-effort translation — tables map to docx tables, text maps to paragraphs, etc.

```typescript
import { Document, Packer, Paragraph, Table, ... } from 'docx'
import { saveAs } from 'file-saver'

export async function exportToWord(
  compiledHTML: string,
  filename: string = 'document.docx'
): Promise<void> {
  // Parse HTML, convert to docx elements
  // This is a simplified mapping — tables, paragraphs, headings
  const doc = new Document({ sections: [{ children: [...] }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
```

Note: Also install `file-saver`:

```bash
npm install file-saver && npm install -D @types/file-saver
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add PDF and Word export"
```

---

## Task 12: Document Styles & Polish

**Files:**

- Create: `src/assets/styles/document.css`
- Modify: various view components for polish

**Step 1: Create print-friendly document styles**

`document.css` contains styles for the rendered document preview. These styles should produce clean, professional output for finance documents:

- A4 page dimensions (210mm × 297mm) simulated in preview
- Typography: clean sans-serif, appropriate heading sizes
- Table styles: borders, zebra stripes, aligned amounts
- Summary table: right-aligned with grand-total emphasis
- Address cards: subtle borders/backgrounds
- Signature lines: bottom borders with spacing
- Print media queries to remove builder chrome

**Step 2: Polish the builder UX**

- Block selection highlight (blue left border + subtle background)
- Drag ghost styling (semi-transparent, type label visible)
- Container blocks: dashed border with colored badge (blue for IF, green for EACH)
- Empty canvas state: "Drag blocks here to start building"
- Tooltips on palette items
- Toast notifications on save/delete/duplicate

**Step 3: Add responsive layout adjustments**

Make the builder work reasonably on smaller screens (collapse palette to icons, hide properties panel behind a slide-over).

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add document styles and builder UX polish"
```

---

## Task Summary

| Task | Description               | Estimated Effort |
| ---- | ------------------------- | ---------------- |
| 1    | Project scaffolding       | 10 min           |
| 2    | Types & block registry    | 20 min           |
| 3    | Database & template store | 20 min           |
| 4    | Dashboard view            | 30 min           |
| 5    | Reusable components       | 25 min           |
| 6    | Block renderers (15)      | 60 min           |
| 7    | Block editors (15)        | 60 min           |
| 8    | Builder view              | 45 min           |
| 9    | Handlebars compiler       | 30 min           |
| 10   | Playground view           | 35 min           |
| 11   | PDF & Word export         | 30 min           |
| 12   | Styles & polish           | 30 min           |

---

## Future Work (Post-POC)

- [ ] Image block, Chart/Graph block, Watermark block, QR Code block
- [ ] Code editor mode (Monaco) with HTML ↔ Block JSON bidirectional conversion
- [ ] Template versioning & history
- [ ] Template sharing (import/export JSON)
- [ ] Server-side rendering for high-fidelity PDF (Puppeteer)
- [ ] Custom Handlebars helpers UI
- [ ] Undo/redo in builder
- [ ] Block copy/paste
- [ ] Template categories & tagging
