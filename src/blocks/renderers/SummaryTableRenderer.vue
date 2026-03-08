<script setup lang="ts">
import { computed } from "vue";
import type { SummaryTableBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: SummaryTableBlock;
  data: Record<string, unknown> | null;
}>();

const items = computed(() =>
  (props.block.props.items ?? []).map((item) => ({
    label: compileProp(item.label, props.data),
    value: compileProp(item.value, props.data),
    format: item.format,
    style: item.style ?? "normal",
  }))
);

const formatValue = (val: string, format?: string) => {
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  if (format === "currency") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  if (format === "number") return new Intl.NumberFormat().format(num);
  if (format === "percentage") return `${num * 100}%`;
  return val;
};
</script>

<template>
  <div
    class="doc-summary-table"
    :class="`doc-summary-table--${block.props.alignment ?? 'right-aligned'}`"
  >
    <table
      class="doc-summary-table__table"
      :style="{ '--label-width': block.props.labelWidth ?? '70%' }"
    >
      <tbody>
        <tr
          v-for="(item, i) in items"
          :key="i"
          class="doc-summary-table__row"
          :class="`doc-summary-table__row--${item.style}`"
        >
          <td class="doc-summary-table__label">{{ item.label }}</td>
          <td class="doc-summary-table__value">
            {{ formatValue(item.value, item.format) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.doc-summary-table__table {
  width: 100%;
  border-collapse: collapse;
}
.doc-summary-table--right-aligned .doc-summary-table__table {
  margin-left: auto;
  max-width: 320px;
}
.doc-summary-table__row td {
  padding: 0.25rem 0;
  border-bottom: 1px solid #f3f4f6;
}
.doc-summary-table__label {
  width: var(--label-width);
  text-align: right;
  padding-right: 1rem;
  color: #6b7280;
}
.doc-summary-table__value {
  text-align: right;
  font-weight: 500;
}
.doc-summary-table__row--deduction .doc-summary-table__value {
  color: #dc2626;
}
.doc-summary-table__row--subtotal .doc-summary-table__value {
  font-weight: 600;
}
.doc-summary-table__row--grand-total .doc-summary-table__label,
.doc-summary-table__row--grand-total .doc-summary-table__value {
  font-weight: 700;
  font-size: 1.05rem;
  padding-top: 0.5rem;
  border-bottom: 2px solid #111;
}
</style>
