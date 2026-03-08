<script setup lang="ts">
import type { DividerBlock } from "../../types/blocks";

defineProps<{
  block: DividerBlock;
  data: Record<string, unknown>;
}>();

const marginMap = { sm: "0.5rem", md: "1rem", lg: "1.5rem" };
</script>

<template>
  <hr
    class="doc-divider"
    :style="{
      borderStyle: block.props.dividerStyle === 'space-only' ? 'none' : (block.props.dividerStyle || 'solid'),
      borderWidth: block.props.dividerStyle === 'space-only' ? 0 : `${block.props.thickness ?? 1}px`,
      borderColor: block.props.color || '#cccccc',
      marginTop: marginMap[block.props.margin ?? 'md'],
      marginBottom: marginMap[block.props.margin ?? 'md'],
    }"
  />
</template>

<style scoped>
.doc-divider {
  border: none;
  border-top-width: 1px;
  border-top-style: solid;
}
</style>
