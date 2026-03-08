<script setup lang="ts">
import { computed } from "vue";
import type { DocumentHeaderBlock } from "../../types/blocks";
import Select from "primevue/select";
import VariableInput from "../../components/VariableInput.vue";
import ColorPickerField from "../../components/ColorPickerField.vue";

const props = defineProps<{
  modelValue: DocumentHeaderBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: DocumentHeaderBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const layoutOptions = [
  { label: "Logo Left", value: "logo-left" },
  { label: "Centered", value: "centered" },
  { label: "Logo Right", value: "logo-right" },
];

function updateProps<K extends keyof DocumentHeaderBlock["props"]>(
  key: K,
  value: DocumentHeaderBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="document-header-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.logo ?? ''"
      label="Logo URL"
      placeholder="https://..."
      @update:model-value="updateProps('logo', $event)"
    />
    <VariableInput
      :model-value="block.props.companyName"
      label="Company Name"
      placeholder="{{company.name}}"
      @update:model-value="updateProps('companyName', $event)"
    />
    <VariableInput
      :model-value="block.props.documentTitle"
      label="Document Title"
      placeholder="DOCUMENT"
      @update:model-value="updateProps('documentTitle', $event)"
    />
    <VariableInput
      :model-value="block.props.documentSubtitle ?? ''"
      label="Document Subtitle"
      placeholder="Optional subtitle"
      @update:model-value="updateProps('documentSubtitle', $event)"
    />
    <ColorPickerField
      :model-value="block.props.accentColor"
      label="Accent Color"
      @update:model-value="updateProps('accentColor', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Layout
      </label>
      <Select
        :model-value="block.props.layout ?? 'logo-left'"
        :options="layoutOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('layout', $event)"
      />
    </div>
  </div>
</template>
