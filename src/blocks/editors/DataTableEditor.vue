<script setup lang="ts">
import { computed } from "vue";
import type { DataTableBlock, TableColumn } from "../../types/blocks";
import Select from "primevue/select";
import InputSwitch from "primevue/inputswitch";
import VariableInput from "../../components/VariableInput.vue";
import DynamicList from "../../components/DynamicList.vue";

const props = defineProps<{
  modelValue: DataTableBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: DataTableBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const alignOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const formatOptions = [
  { label: "None", value: "none" },
  { label: "Currency", value: "currency" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Percentage", value: "percentage" },
];

const borderStyleOptions = [
  { label: "Full", value: "full" },
  { label: "Horizontal", value: "horizontal" },
  { label: "Minimal", value: "minimal" },
  { label: "None", value: "none" },
];

function updateProps<K extends keyof DataTableBlock["props"]>(
  key: K,
  value: DataTableBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

function createColumn(): TableColumn {
  return {
    header: "Column",
    field: "field",
    align: "left",
  };
}

function updateColumn(
  index: number,
  patch: Partial<TableColumn>
) {
  const arr = [...block.value.props.columns];
  arr[index] = { ...arr[index], ...patch };
  updateProps("columns", arr);
}

function getColumnProp(item: unknown, key: keyof TableColumn): string {
  return String((item as TableColumn)?.[key] ?? "");
}
</script>

<template>
  <div class="data-table-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.each"
      label="Data Source (each)"
      placeholder="items"
      @update:model-value="updateProps('each', $event)"
    />
    <div class="flex items-center justify-between gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Show Index
      </label>
      <InputSwitch
        :model-value="block.props.showIndex ?? false"
        @update:model-value="updateProps('showIndex', $event)"
      />
    </div>
    <div class="flex items-center justify-between gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Zebra Stripe
      </label>
      <InputSwitch
        :model-value="block.props.zebraStripe ?? true"
        @update:model-value="updateProps('zebraStripe', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Border Style
      </label>
      <Select
        :model-value="block.props.borderStyle ?? 'full'"
        :options="borderStyleOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('borderStyle', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Columns
      </label>
      <DynamicList
        :model-value="block.props.columns"
        add-label="Add Column"
        :create-default="createColumn"
        @update:model-value="updateProps('columns', $event as TableColumn[])"
      >
        <template #item="{ item, index }">
          <div class="flex flex-col gap-1">
            <VariableInput
              :model-value="getColumnProp(item, 'header')"
              placeholder="Header"
              @update:model-value="updateColumn(index, { header: $event })"
            />
            <VariableInput
              :model-value="getColumnProp(item, 'field')"
              placeholder="Field"
              @update:model-value="updateColumn(index, { field: $event })"
            />
            <div class="flex gap-2">
              <Select
                :model-value="getColumnProp(item, 'align') || 'left'"
                :options="alignOptions"
                option-label="label"
                option-value="value"
                placeholder="Align"
                class="flex-1"
                @update:model-value="updateColumn(index, { align: $event })"
              />
              <VariableInput
                :model-value="getColumnProp(item, 'width')"
                placeholder="Width"
                class="flex-1"
                @update:model-value="updateColumn(index, { width: $event || undefined })"
              />
              <Select
                :model-value="getColumnProp(item, 'format') || 'none'"
                :options="formatOptions"
                option-label="label"
                option-value="value"
                placeholder="Format"
                class="flex-1"
                @update:model-value="updateColumn(index, { format: $event })"
              />
            </div>
          </div>
        </template>
      </DynamicList>
    </div>
  </div>
</template>
