<script setup lang="ts">
import { computed } from "vue";
import type { SectionHeadingBlock } from "../../types/blocks";
import Select from "primevue/select";
import InputSwitch from "primevue/inputswitch";
import VariableInput from "../../components/VariableInput.vue";
import ColorPickerField from "../../components/ColorPickerField.vue";

const props = defineProps<{
  modelValue: SectionHeadingBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: SectionHeadingBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const levelOptions = [
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
  { label: "H4", value: 4 },
];

function updateProps<K extends keyof SectionHeadingBlock["props"]>(
  key: K,
  value: SectionHeadingBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="section-heading-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.title"
      label="Title"
      placeholder="Section title"
      @update:model-value="updateProps('title', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Level
      </label>
      <Select
        :model-value="block.props.level ?? 2"
        :options="levelOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('level', $event)"
      />
    </div>
    <div class="flex items-center justify-between gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Underline
      </label>
      <InputSwitch
        :model-value="block.props.underline ?? false"
        @update:model-value="updateProps('underline', $event)"
      />
    </div>
    <ColorPickerField
      :model-value="block.props.accentColor"
      label="Accent Color"
      @update:model-value="updateProps('accentColor', $event)"
    />
  </div>
</template>
