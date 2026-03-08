<script setup lang="ts">
import { computed } from "vue";
import type { LoopBlock } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer.vue";

const props = defineProps<{
  block: LoopBlock;
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

const PREVIEW_PLACEHOLDER = [{}];

const items = computed(() => {
  // In builder preview mode (data === null), show one placeholder row
  if (props.data === null) return PREVIEW_PLACEHOLDER;
  const eachPath = props.block.props.each;
  if (!eachPath) return [];
  const val = getNestedValue(props.data, eachPath);
  return Array.isArray(val) ? val : [];
});

const itemAlias = computed(() => props.block.props.itemAlias ?? "item");
const indexAlias = computed(() => props.block.props.indexAlias ?? "@index");
</script>

<template>
  <div class="doc-loop">
    <template v-for="(item, index) in items" :key="index">
      <BlockRenderer
        v-for="child in block.children"
        :key="`${child.id}-${index}`"
        :block="child"
        :data="data === null ? null : { ...data, [itemAlias]: item, [indexAlias]: index }"
        @select="(b) => $emit('select', b)"
      />
    </template>
  </div>
</template>

<style scoped>
.doc-loop {
  padding: 0.25rem 0;
}
</style>
