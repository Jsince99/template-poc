<script setup lang="ts">
import ColorPicker from "primevue/colorpicker";

defineProps<{
  modelValue?: string;
  label?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <div class="color-picker-field flex flex-col gap-2">
    <label
      v-if="label"
      class="text-sm font-medium text-surface-700 dark:text-surface-300"
    >
      {{ label }}
    </label>
    <ColorPicker
      :model-value="modelValue"
      format="hex"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
