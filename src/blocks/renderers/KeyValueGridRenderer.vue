<script setup lang="ts">
import { computed } from "vue";
import type { KeyValueGridBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: KeyValueGridBlock;
  data: Record<string, unknown>;
}>();

const items = computed(() =>
  (props.block.props.items ?? []).map((item) => ({
    label: compileProp(item.label, props.data),
    value: compileProp(item.value, props.data),
  }))
);

const columns = computed(() => props.block.props.columns ?? 2);
</script>

<template>
  <div
    class="doc-key-value-grid"
    :class="[`doc-key-value-grid--${block.props.layout ?? 'bordered'}`, `doc-key-value-grid--cols-${columns}`]"
  >
    <div
      v-for="(item, i) in items"
      :key="i"
      class="doc-key-value-grid__item"
    >
      <span class="doc-key-value-grid__label">{{ item.label }}</span>
      <span class="doc-key-value-grid__value">{{ item.value }}</span>
    </div>
  </div>
</template>

<style scoped>
.doc-key-value-grid {
  display: grid;
  gap: 0.5rem;
  margin: 0.5rem 0;
}
.doc-key-value-grid--cols-1 {
  grid-template-columns: 1fr;
}
.doc-key-value-grid--cols-2 {
  grid-template-columns: 1fr 1fr;
}
.doc-key-value-grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.doc-key-value-grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}
.doc-key-value-grid__item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.doc-key-value-grid--bordered .doc-key-value-grid__item {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
.doc-key-value-grid--striped .doc-key-value-grid__item:nth-child(even) {
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 4px;
}
.doc-key-value-grid__label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}
.doc-key-value-grid__value {
  font-weight: 500;
}
</style>
