<script setup lang="ts">
import { computed } from "vue";
import type { KeyValueGridBlock, KeyValueItem } from "../../types/blocks";
import Select from "primevue/select";
import DynamicList from "../../components/DynamicList.vue";
import VariableInput from "../../components/VariableInput.vue";

const props = defineProps<{
  modelValue: KeyValueGridBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: KeyValueGridBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const columnsOptions = [
  { label: "1 Column", value: 1 },
  { label: "2 Columns", value: 2 },
  { label: "3 Columns", value: 3 },
  { label: "4 Columns", value: 4 },
];

const layoutOptions = [
  { label: "Bordered", value: "bordered" },
  { label: "Striped", value: "striped" },
  { label: "Minimal", value: "minimal" },
];

function updateProps<K extends keyof KeyValueGridBlock["props"]>(
  key: K,
  value: KeyValueGridBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

function createItem(): KeyValueItem {
  return { label: "Label", value: "{{value}}" };
}

function updateItemLabel(index: number, v: string) {
  const arr = [...block.value.props.items];
  arr[index] = { ...arr[index], label: v };
  updateProps("items", arr);
}

function updateItemValue(index: number, v: string) {
  const arr = [...block.value.props.items];
  arr[index] = { ...arr[index], value: v };
  updateProps("items", arr);
}

function getItemLabel(item: unknown): string {
  return (item as KeyValueItem)?.label ?? "";
}

function getItemValue(item: unknown): string {
  return (item as KeyValueItem)?.value ?? "";
}
</script>

<template>
  <div class="key-value-grid-editor flex flex-col gap-3">
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Columns
      </label>
      <Select
        :model-value="block.props.columns ?? 2"
        :options="columnsOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('columns', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Layout
      </label>
      <Select
        :model-value="block.props.layout ?? 'bordered'"
        :options="layoutOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('layout', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Items
      </label>
      <DynamicList
        :model-value="block.props.items"
        add-label="Add Item"
        :create-default="createItem"
        @update:model-value="updateProps('items', $event as KeyValueItem[])"
      >
        <template #item="{ item, index }">
          <div class="flex flex-col gap-1">
            <VariableInput
              :model-value="getItemLabel(item)"
              placeholder="Label"
              @update:model-value="updateItemLabel(index, $event)"
            />
            <VariableInput
              :model-value="getItemValue(item)"
              placeholder="Value"
              @update:model-value="updateItemValue(index, $event)"
            />
          </div>
        </template>
      </DynamicList>
    </div>
  </div>
</template>
