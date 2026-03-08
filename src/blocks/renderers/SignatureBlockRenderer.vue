<script setup lang="ts">
import { computed } from "vue";
import type { SignatureBlockBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: SignatureBlockBlock;
  data: Record<string, unknown>;
}>();

const signatories = computed(() =>
  (props.block.props.signatories ?? []).map((s) => ({
    label: compileProp(s.label, props.data),
    name: compileProp(s.name, props.data),
    designation: compileProp(s.designation, props.data),
    showLine: s.showLine ?? true,
  }))
);
</script>

<template>
  <div
    class="doc-signature-block"
    :class="`doc-signature-block--${block.props.layout ?? 'side-by-side'}`"
  >
    <div
      v-for="(sig, i) in signatories"
      :key="i"
      class="doc-signature-block__signatory"
    >
      <div v-if="sig.label" class="doc-signature-block__label">{{ sig.label }}</div>
      <div v-if="sig.showLine" class="doc-signature-block__line"></div>
      <div v-if="sig.name" class="doc-signature-block__name">{{ sig.name }}</div>
      <div v-if="sig.designation" class="doc-signature-block__designation">
        {{ sig.designation }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-signature-block {
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
}
.doc-signature-block--stacked {
  flex-direction: column;
  gap: 1.5rem;
}
.doc-signature-block__signatory {
  flex: 1;
  min-width: 120px;
}
.doc-signature-block__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
}
.doc-signature-block__line {
  width: 100%;
  height: 1px;
  border-bottom: 1px solid #111;
  margin: 2rem 0 0.25rem;
}
.doc-signature-block__name {
  font-weight: 600;
}
.doc-signature-block__designation {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
