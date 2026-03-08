<script setup lang="ts">
import { computed } from "vue";
import type { DocumentFooterBlock } from "../../types/blocks";
import Select from "primevue/select";
import InputSwitch from "primevue/inputswitch";
import VariableInput from "../../components/VariableInput.vue";

const props = defineProps<{
  modelValue: DocumentFooterBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: DocumentFooterBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const fontSizeOptions = [
  { label: "Extra Small", value: "xs" },
  { label: "Small", value: "sm" },
];

function updateProps<K extends keyof DocumentFooterBlock["props"]>(
  key: K,
  value: DocumentFooterBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="document-footer-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.left ?? ''"
      label="Left"
      placeholder="Left column"
      @update:model-value="updateProps('left', $event)"
    />
    <VariableInput
      :model-value="block.props.center ?? ''"
      label="Center"
      placeholder="Center (e.g. Page {{pageNumber}})"
      @update:model-value="updateProps('center', $event)"
    />
    <VariableInput
      :model-value="block.props.right ?? ''"
      label="Right"
      placeholder="Right column"
      @update:model-value="updateProps('right', $event)"
    />
    <div class="flex items-center justify-between gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Show Border
      </label>
      <InputSwitch
        :model-value="block.props.showBorder ?? true"
        @update:model-value="updateProps('showBorder', $event)"
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
