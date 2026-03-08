<script setup lang="ts">
import { computed } from "vue";
import type { Block } from "../../types/blocks";
import DividerRenderer from "./DividerRenderer.vue";
import SectionHeadingRenderer from "./SectionHeadingRenderer.vue";
import TextBlockRenderer from "./TextBlockRenderer.vue";
import DocumentHeaderRenderer from "./DocumentHeaderRenderer.vue";
import DocumentFooterRenderer from "./DocumentFooterRenderer.vue";
import AddressBlockRenderer from "./AddressBlockRenderer.vue";
import AddressPairRenderer from "./AddressPairRenderer.vue";
import KeyValueGridRenderer from "./KeyValueGridRenderer.vue";
import DataTableRenderer from "./DataTableRenderer.vue";
import SummaryTableRenderer from "./SummaryTableRenderer.vue";
import BankDetailsRenderer from "./BankDetailsRenderer.vue";
import SignatureBlockRenderer from "./SignatureBlockRenderer.vue";
import TermsConditionsRenderer from "./TermsConditionsRenderer.vue";
import ConditionalRenderer from "./ConditionalRenderer.vue";
import LoopRenderer from "./LoopRenderer.vue";

const props = defineProps<{
  block: Block;
  /** Pass null to render raw template strings (builder preview mode) */
  data: Record<string, unknown> | null;
}>(); 

defineEmits<{
  select: [block: Block];
}>();

const rendererMap: Record<string, object> = {
  "document-header": DocumentHeaderRenderer,
  "address-block": AddressBlockRenderer,
  "address-pair": AddressPairRenderer,
  "key-value-grid": KeyValueGridRenderer,
  "data-table": DataTableRenderer,
  "summary-table": SummaryTableRenderer,
  "text-block": TextBlockRenderer,
  "bank-details": BankDetailsRenderer,
  "signature-block": SignatureBlockRenderer,
  divider: DividerRenderer,
  "section-heading": SectionHeadingRenderer,
  "terms-conditions": TermsConditionsRenderer,
  "document-footer": DocumentFooterRenderer,
  conditional: ConditionalRenderer,
  loop: LoopRenderer,
};

const rendererComponent = computed(() => rendererMap[props.block.type] ?? null);

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((cur: unknown, key) => (cur as Record<string, unknown>)?.[key], obj);
}

const isVisible = computed(() => {
  const cond = props.block.visibilityCondition;
  if (!cond || props.data === null) return true;
  const path = cond.replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "").trim();
  return !!getNestedValue(props.data, path);
});

const marginMap: Record<string, string> = {
  none: "0",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
};

const blockStyle = computed(() => {
  const s = props.block.style;
  if (!s) return {};
  return {
    marginTop: s.marginTop ? marginMap[s.marginTop] : undefined,
    marginBottom: s.marginBottom ? marginMap[s.marginBottom] : undefined,
    backgroundColor: s.backgroundColor || undefined,
  };
});
</script>

<template>
  <div
    v-if="rendererComponent && isVisible"
    :style="blockStyle"
    :class="block.cssClass"
  >
    <component
      :is="rendererComponent"
      :block="block"
      :data="data"
      @select="$emit('select', $event)"
    />
  </div>
</template>
