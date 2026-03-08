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
