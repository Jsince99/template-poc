<script setup lang="ts">
import { computed } from "vue";
import type { DividerBlock } from "../../types/blocks";
import Select from "primevue/select";
import Slider from "primevue/slider";
import ColorPickerField from "../../components/ColorPickerField.vue";

const props = defineProps<{
  modelValue: DividerBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: DividerBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const dividerStyleOptions = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" },
  { label: "Space Only", value: "space-only" },
];

const marginOptions = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

function updateProps<K extends keyof DividerBlock["props"]>(
  key: K,
  value: DividerBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="divider-editor flex flex-col gap-3">
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Style
      </label>
      <Select
        :model-value="block.props.dividerStyle ?? 'solid'"
        :options="dividerStyleOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('dividerStyle', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Thickness: {{ block.props.thickness ?? 1 }}px
      </label>
      <Slider
        :model-value="block.props.thickness ?? 1"
        :min="1"
        :max="8"
        class="w-full"
        @update:model-value="updateProps('thickness', Array.isArray($event) ? $event[0] : $event)"
      />
    </div>
    <ColorPickerField
      :model-value="block.props.color"
      label="Color"
      @update:model-value="updateProps('color', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Margin
      </label>
      <Select
        :model-value="block.props.margin ?? 'md'"
        :options="marginOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('margin', $event)"
      />
    </div>
  </div>
</template>
