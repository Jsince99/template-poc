<script setup lang="ts">
import { computed } from "vue";
import type { SectionHeadingBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: SectionHeadingBlock;
  data: Record<string, unknown> | null;
}>();

const Tag = computed(() => `h${props.block.props.level ?? 2}`);
const title = computed(() =>
  compileProp(props.block.props.title, props.data)
);
</script>

<template>
  <component
    :is="Tag"
    class="doc-section-heading"
    :class="{ 'doc-section-heading--underline': block.props.underline }"
    :style="{ color: block.props.accentColor || 'inherit' }"
  >
    {{ title }}
  </component>
</template>

<style scoped>
.doc-section-heading {
  margin: 0.5rem 0 0.25rem;
  font-weight: 600;
}
.doc-section-heading--underline {
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.25rem;
}
</style>
