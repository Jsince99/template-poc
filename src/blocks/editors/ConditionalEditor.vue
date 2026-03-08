<script setup lang="ts">
import { computed } from "vue";
import type { ConditionalBlock } from "../../types/blocks";
import Select from "primevue/select";
import VariableInput from "../../components/VariableInput.vue";

const props = defineProps<{
  modelValue: ConditionalBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ConditionalBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const operatorOptions = [
  { label: "If (show when truthy)", value: "if" },
  { label: "Unless (show when falsy)", value: "unless" },
  { label: "Equals (compare value)", value: "equals" },
];

function updateProps<K extends keyof ConditionalBlock["props"]>(
  key: K,
  value: ConditionalBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

const showCompareValue = computed(
  () => block.value.props.operator === "equals"
);
</script>

<template>
  <div class="conditional-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.expression"
      label="Expression"
      placeholder="e.g. {{showSection}}"
      @update:model-value="updateProps('expression', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Operator
      </label>
      <Select
        :model-value="block.props.operator ?? 'if'"
        :options="operatorOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('operator', $event)"
      />
    </div>
    <VariableInput
      v-if="showCompareValue"
      :model-value="block.props.compareValue ?? ''"
      label="Compare Value"
      placeholder="Value when using equals"
      @update:model-value="updateProps('compareValue', $event)"
    />
    <VariableInput
      :model-value="block.props.label ?? ''"
      label="Label"
      placeholder="Conditional section"
      @update:model-value="updateProps('label', $event)"
    />
  </div>
</template>
