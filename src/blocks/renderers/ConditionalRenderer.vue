<script setup lang="ts">
import { computed } from "vue";
import type { ConditionalBlock } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer.vue";

const props = defineProps<{
  block: ConditionalBlock;
  data: Record<string, unknown> | null;
}>();

defineEmits<{ select: [block: import("../../types/blocks").Block] }>();

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.trim().split(".");
  let current: unknown = obj;
  for (const p of parts) {
    current = (current as Record<string, unknown>)?.[p];
  }
  return current;
}

const shouldRender = computed(() => {
  // In builder preview mode (data === null), always show children
  if (props.data === null) return true;
  const { expression, operator, compareValue } = props.block.props;
  const val = getNestedValue(props.data, expression);

  if (operator === "if") return !!val;
  if (operator === "unless") return !val;
  if (operator === "equals") return val === compareValue;

  return !!val;
});
</script>

<template>
  <div v-if="shouldRender" class="doc-conditional">
    <BlockRenderer
      v-for="child in block.children"
      :key="child.id"
      :block="child"
      :data="data"
      @select="(b) => $emit('select', b)"
    />
  </div>
</template>

<style scoped>
.doc-conditional {
  padding: 0.25rem 0;
}
</style>
