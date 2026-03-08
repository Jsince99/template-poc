<script setup lang="ts">
import { computed } from "vue";
import type { BankDetailsBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: BankDetailsBlock;
  data: Record<string, unknown>;
}>();

const label = computed(() =>
  props.block.props.label
    ? compileProp(props.block.props.label, props.data)
    : ""
);

const fields = computed(() =>
  (props.block.props.fields ?? []).map((f) => ({
    label: compileProp(f.label, props.data),
    value: compileProp(f.value, props.data),
  }))
);
</script>

<template>
  <div
    class="doc-bank-details"
    :class="[`doc-bank-details--${block.props.borderStyle ?? 'card'}`]"
  >
    <div v-if="label" class="doc-bank-details__label">
      <i v-if="block.props.showIcon" class="pi pi-building doc-bank-details__icon"></i>
      {{ label }}
    </div>
    <div class="doc-bank-details__fields">
      <div
        v-for="(field, i) in fields"
        :key="i"
        class="doc-bank-details__field"
      >
        <span class="doc-bank-details__field-label">{{ field.label }}:</span>
        <span class="doc-bank-details__field-value">{{ field.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-bank-details {
  margin: 0.5rem 0;
}
.doc-bank-details--card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fafafa;
}
.doc-bank-details--minimal {
  padding: 0.5rem 0;
}
.doc-bank-details__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.doc-bank-details__icon {
  font-size: 0.875rem;
}
.doc-bank-details__fields {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.doc-bank-details__field-label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #4b5563;
}
</style>
