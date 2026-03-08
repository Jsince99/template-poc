<script setup lang="ts">
import { computed } from "vue";
import type { SummaryTableBlock, SummaryItem } from "../../types/blocks";
import Select from "primevue/select";
import VariableInput from "../../components/VariableInput.vue";
import DynamicList from "../../components/DynamicList.vue";

const props = defineProps<{
  modelValue: SummaryTableBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: SummaryTableBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const formatOptions = [
  { label: "None", value: "none" },
  { label: "Currency", value: "currency" },
  { label: "Number", value: "number" },
  { label: "Percentage", value: "percentage" },
];

const styleOptions = [
  { label: "Normal", value: "normal" },
  { label: "Deduction", value: "deduction" },
  { label: "Subtotal", value: "subtotal" },
  { label: "Grand Total", value: "grand-total" },
];

const alignmentOptions = [
  { label: "Right Aligned", value: "right-aligned" },
  { label: "Full Width", value: "full-width" },
];

function updateProps<K extends keyof SummaryTableBlock["props"]>(
  key: K,
  value: SummaryTableBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

function createItem(): SummaryItem {
  return {
    label: "Label",
    value: "{{value}}",
    format: "currency",
    style: "normal",
  };
}

function updateItem(index: number, patch: Partial<SummaryItem>) {
  const arr = [...block.value.props.items];
  arr[index] = { ...arr[index], ...patch };
  updateProps("items", arr);
}

function getItemProp(item: unknown, key: keyof SummaryItem): string {
  const val = (item as SummaryItem)?.[key];
  return val !== undefined && val !== null ? String(val) : "";
}
</script>

<template>
  <div class="summary-table-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.labelWidth ?? ''"
      label="Label Width"
      placeholder="e.g. 70%"
      @update:model-value="updateProps('labelWidth', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Alignment
      </label>
      <Select
        :model-value="block.props.alignment ?? 'right-aligned'"
        :options="alignmentOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('alignment', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Items
      </label>
      <DynamicList
        :model-value="block.props.items"
        add-label="Add Row"
        :create-default="createItem"
        @update:model-value="updateProps('items', $event as SummaryItem[])"
      >
        <template #item="{ item, index }">
          <div class="flex flex-col gap-1">
            <VariableInput
              :model-value="getItemProp(item, 'label')"
              placeholder="Label"
              @update:model-value="updateItem(index, { label: $event })"
            />
            <VariableInput
              :model-value="getItemProp(item, 'value')"
              placeholder="Value"
              @update:model-value="updateItem(index, { value: $event })"
            />
            <div class="flex gap-2">
              <Select
                :model-value="getItemProp(item, 'format') || 'none'"
                :options="formatOptions"
                option-label="label"
                option-value="value"
                placeholder="Format"
                class="flex-1"
                @update:model-value="updateItem(index, { format: $event === 'none' ? undefined : $event })"
              />
              <Select
                :model-value="getItemProp(item, 'style') || 'normal'"
                :options="styleOptions"
                option-label="label"
                option-value="value"
                placeholder="Style"
                class="flex-1"
                @update:model-value="updateItem(index, { style: $event })"
              />
            </div>
          </div>
        </template>
      </DynamicList>
    </div>
  </div>
</template>
