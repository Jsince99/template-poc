<script setup lang="ts">
import { computed } from "vue";
import type { TextBlockBlock } from "../../types/blocks";
import Select from "primevue/select";
import VariableInput from "../../components/VariableInput.vue";

const props = defineProps<{
  modelValue: TextBlockBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: TextBlockBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const fontSizeOptions = [
  { label: "Extra Small", value: "xs" },
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

const textStyleOptions = [
  { label: "Normal", value: "normal" },
  { label: "Muted", value: "muted" },
  { label: "Highlight", value: "highlight" },
  { label: "Legal", value: "legal" },
];

const textAlignOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
];

function updateProps<K extends keyof TextBlockBlock["props"]>(
  key: K,
  value: TextBlockBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="text-block-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.content"
      label="Content"
      multiline
      placeholder="Enter text..."
      @update:model-value="updateProps('content', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Font Size
      </label>
      <Select
        :model-value="block.props.fontSize ?? 'md'"
        :options="fontSizeOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('fontSize', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Text Style
      </label>
      <Select
        :model-value="block.props.textStyle ?? 'normal'"
        :options="textStyleOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('textStyle', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Text Align
      </label>
      <Select
        :model-value="block.props.textAlign ?? 'left'"
        :options="textAlignOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('textAlign', $event)"
      />
    </div>
  </div>
</template>
