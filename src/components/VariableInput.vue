<script setup lang="ts">
import { computed } from "vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    multiline?: boolean;
    label?: string;
    placeholder?: string;
  }>(),
  { multiline: false }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const hasVariables = computed(() => /\{\{[^}]*\}\}/.test(props.modelValue ?? ""));

const variableCount = computed(() => {
  const matches = (props.modelValue ?? "").match(/\{\{[^}]*\}\}/g);
  return matches ? matches.length : 0;
});
</script>

<template>
  <div class="variable-input flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-surface-700 dark:text-surface-300">
      {{ label }}
    </label>
    <div class="relative">
      <InputText
        v-if="!multiline"
        :model-value="modelValue"
        :placeholder="placeholder"
        class="w-full"
        :class="{ 'variable-input--has-vars': hasVariables, '!pr-14': hasVariables }"
        @update:model-value="emit('update:modelValue', $event ?? '')"
      />
      <Textarea
        v-else
        :model-value="modelValue"
        :placeholder="placeholder"
        class="w-full"
        :class="{ 'variable-input--has-vars': hasVariables, '!pr-14': hasVariables }"
        rows="3"
        @update:model-value="emit('update:modelValue', $event ?? '')"
      />
      <span
        v-if="hasVariables"
        class="variable-input__badge absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
      >
        {{ variableCount }} var(s)
      </span>
    </div>
  </div>
</template>

<style scoped>
.variable-input--has-vars {
  border-color: var(--p-primary-300);
  box-shadow: 0 0 0 1px var(--p-primary-200);
}
</style>
