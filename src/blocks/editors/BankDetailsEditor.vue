<script setup lang="ts">
import { computed } from "vue";
import type { BankDetailsBlock } from "../../types/blocks";
import Select from "primevue/select";
import InputSwitch from "primevue/inputswitch";
import VariableInput from "../../components/VariableInput.vue";
import DynamicList from "../../components/DynamicList.vue";

const props = defineProps<{
  modelValue: BankDetailsBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: BankDetailsBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const borderStyleOptions = [
  { label: "Card", value: "card" },
  { label: "Minimal", value: "minimal" },
  { label: "None", value: "none" },
];

function updateProps<K extends keyof BankDetailsBlock["props"]>(
  key: K,
  value: BankDetailsBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

function createField() {
  return { label: "Label", value: "{{value}}" };
}

function updateFieldLabel(index: number, v: string) {
  const fields = block.value.props.fields;
  const arr = fields.map((e, i) =>
    i === index ? { ...e, label: v } : e
  );
  updateProps("fields", arr);
}

function updateFieldValue(index: number, v: string) {
  const fields = block.value.props.fields;
  const arr = fields.map((e, i) =>
    i === index ? { ...e, value: v } : e
  );
  updateProps("fields", arr);
}

function getFieldLabel(item: unknown): string {
  return (item as { label: string; value: string })?.label ?? "";
}

function getFieldValue(item: unknown): string {
  return (item as { label: string; value: string })?.value ?? "";
}
</script>

<template>
  <div class="bank-details-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.label ?? ''"
      label="Label"
      placeholder="Bank Details"
      @update:model-value="updateProps('label', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Fields
      </label>
      <DynamicList
        :model-value="block.props.fields"
        add-label="Add Field"
        :create-default="createField"
        @update:model-value="updateProps('fields', $event as Array<{ label: string; value: string }>)"
      >
        <template #item="{ item, index }">
          <div class="flex flex-col gap-1">
            <VariableInput
              :model-value="getFieldLabel(item)"
              placeholder="Label"
              @update:model-value="updateFieldLabel(index, $event)"
            />
            <VariableInput
              :model-value="getFieldValue(item)"
              placeholder="Value"
              @update:model-value="updateFieldValue(index, $event)"
            />
          </div>
        </template>
      </DynamicList>
    </div>
    <div class="flex items-center justify-between gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Show Icon
      </label>
      <InputSwitch
        :model-value="block.props.showIcon ?? true"
        @update:model-value="updateProps('showIcon', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Border Style
      </label>
      <Select
        :model-value="block.props.borderStyle ?? 'card'"
        :options="borderStyleOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('borderStyle', $event)"
      />
    </div>
  </div>
</template>
