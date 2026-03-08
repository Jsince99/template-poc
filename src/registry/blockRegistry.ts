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
