<script setup lang="ts">
import { computed } from "vue";
import type { LoopBlock } from "../../types/blocks";
import VariableInput from "../../components/VariableInput.vue";

const props = defineProps<{
  modelValue: LoopBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: LoopBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function updateProps<K extends keyof LoopBlock["props"]>(
  key: K,
  value: LoopBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="loop-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.each"
      label="Data Source (each)"
      placeholder="e.g. items"
      @update:model-value="updateProps('each', $event)"
    />
    <VariableInput
      :model-value="block.props.itemAlias ?? ''"
      label="Item Alias"
      placeholder="e.g. item"
      @update:model-value="updateProps('itemAlias', $event)"
    />
    <VariableInput
      :model-value="block.props.indexAlias ?? ''"
      label="Index Alias"
      placeholder="e.g. index"
      @update:model-value="updateProps('indexAlias', $event)"
    />
    <VariableInput
      :model-value="block.props.label ?? ''"
      label="Label"
      placeholder="Loop section"
      @update:model-value="updateProps('label', $event)"
    />
  </div>
</template>
