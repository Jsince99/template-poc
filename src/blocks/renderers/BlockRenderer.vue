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
  data: Record<string, unknown>;
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
</script>

<template>
  <component
    v-if="rendererComponent"
    :is="rendererComponent"
    :block="block"
    :data="data ?? {}"
    @select="$emit('select', $event)"
  />
</template>
