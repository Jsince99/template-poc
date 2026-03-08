<script setup lang="ts">
import { computed } from "vue";
import Handlebars from "handlebars";
import type { DataTableBlock } from "../../types/blocks";

const props = defineProps<{
  block: DataTableBlock;
  data: Record<string, unknown> | null;
}>();

const rows = computed(() => {
  if (props.data === null) return [];
  const eachPath = props.block.props.each;
  if (!eachPath) return [];
  const parts = eachPath.split(".");
  let current: unknown = props.data;
  for (const p of parts) {
    current = (current as Record<string, unknown>)?.[p];
    if (!Array.isArray(current)) return [];
  }
  return current as unknown[];
});

const getCellValue = (row: unknown, field: string, format?: string) => {
  const parts = field.split(".");
  let val: unknown = row;
  for (const p of parts) {
    val = (val as Record<string, unknown>)?.[p];
  }
  if (val == null) return "";
  const str = String(val);
  if (format === "currency") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(val));
  if (format === "number") return new Intl.NumberFormat().format(Number(val));
  if (format === "date") return new Date(String(val)).toLocaleDateString();
  if (format === "percentage") return `${Number(val) * 100}%`;
  return str;
};

const compiledHeader = (header: string) => {
  if (props.data === null) return header;
  try {
    return Handlebars.compile(header, { noEscape: true })(props.data);
  } catch {
    return header;
  }
};
</script>

<template>
  <div class="doc-data-table">
    <table
      class="doc-data-table__table"
      :class="{
        'doc-data-table__table--zebra': block.props.zebraStripe,
        [`doc-data-table__table--border-${block.props.borderStyle ?? 'full'}`]: true,
      }"
    >
      <thead>
        <tr>
          <th v-if="block.props.showIndex" class="doc-data-table__index">#</th>
          <th
            v-for="(col, i) in block.props.columns"
            :key="i"
            class="doc-data-table__th"
            :style="{ textAlign: col.align ?? 'left' }"
          >
            {{ compiledHeader(col.header) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIdx) in rows" :key="rowIdx">
          <td v-if="block.props.showIndex" class="doc-data-table__index">
            {{ rowIdx + 1 }}
          </td>
          <td
            v-for="(col, colIdx) in block.props.columns"
            :key="colIdx"
            class="doc-data-table__td"
            :style="{ textAlign: col.align ?? 'left' }"
          >
            {{ getCellValue(row, col.field, col.format) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.doc-data-table {
  margin: 0.5rem 0;
  overflow-x: auto;
}
.doc-data-table__table {
  width: 100%;
  border-collapse: collapse;
}
.doc-data-table__table--border-full th,
.doc-data-table__table--border-full td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
}
.doc-data-table__table--border-horizontal th,
.doc-data-table__table--border-horizontal td {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
}
.doc-data-table__table--border-minimal td {
  padding: 0.25rem 0.5rem;
}
.doc-data-table__table--zebra tbody tr:nth-child(even) {
  background: #f9fafb;
}
.doc-data-table__th {
  font-weight: 600;
  font-size: 0.875rem;
  background: #f3f4f6;
}
.doc-data-table__index {
  width: 2.5rem;
  text-align: center !important;
}
</style>
