<script setup lang="ts">
import { computed } from "vue";
import type { TermsConditionsBlock } from "../../types/blocks";
import Select from "primevue/select";
import VariableInput from "../../components/VariableInput.vue";
import DynamicList from "../../components/DynamicList.vue";

const props = defineProps<{
  modelValue: TermsConditionsBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: TermsConditionsBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const listStyleOptions = [
  { label: "Numbered", value: "numbered" },
  { label: "Bulleted", value: "bulleted" },
  { label: "None", value: "none" },
];

const fontSizeOptions = [
  { label: "Extra Small", value: "xs" },
  { label: "Small", value: "sm" },
];

function updateProps<K extends keyof TermsConditionsBlock["props"]>(
  key: K,
  value: TermsConditionsBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

function createItem() {
  return "Term item";
}

function updateTermItem(index: number, v: string) {
  const arr = [...block.value.props.items];
  arr[index] = v;
  updateProps("items", arr);
}

function getTermItem(item: unknown): string {
  return typeof item === "string" ? item : "";
}
</script>

<template>
  <div class="terms-conditions-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.title ?? ''"
      label="Title"
      placeholder="Terms & Conditions"
      @update:model-value="updateProps('title', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Items
      </label>
      <DynamicList
        :model-value="block.props.items"
        add-label="Add Term"
        :create-default="createItem"
        @update:model-value="updateProps('items', $event as string[])"
      >
        <template #item="{ item, index }">
          <VariableInput
            :model-value="getTermItem(item)"
            multiline
            placeholder="Term text..."
            @update:model-value="updateTermItem(index, $event)"
          />
        </template>
      </DynamicList>
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        List Style
      </label>
      <Select
        :model-value="block.props.listStyle ?? 'numbered'"
        :options="listStyleOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('listStyle', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Font Size
      </label>
      <Select
        :model-value="block.props.fontSize ?? 'xs'"
        :options="fontSizeOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('fontSize', $event)"
      />
    </div>
  </div>
</template>
