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
    <div class="flex items-center gap-2">
      <ColorPicker
        :model-value="modelValue?.replace('#', '')"
        format="hex"
        @update:model-value="emit('update:modelValue', $event ? `#${$event}` : '')"
      />
      <span class="text-sm text-surface-600 dark:text-surface-400">
        {{ modelValue || 'None' }}
      </span>
    </div>
  </div>
</template>
