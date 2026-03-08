<script setup lang="ts">
import { computed } from "vue";
import type { DocumentFooterBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: DocumentFooterBlock;
  data: Record<string, unknown> | null;
}>();

const left = computed(() =>
  props.block.props.left ? compileProp(props.block.props.left, props.data) : ""
);
const center = computed(() =>
  props.block.props.center ? compileProp(props.block.props.center, props.data) : ""
);
const right = computed(() =>
  props.block.props.right ? compileProp(props.block.props.right, props.data) : ""
);
</script>

<template>
  <footer
    class="doc-footer"
    :class="{
      'doc-footer--border': block.props.showBorder,
      [`doc-footer--${block.props.fontSize ?? 'xs'}`]: true,
    }"
  >
    <div class="doc-footer__left">{{ left }}</div>
    <div class="doc-footer__center">{{ center }}</div>
    <div class="doc-footer__right">{{ right }}</div>
  </footer>
</template>

<style scoped>
.doc-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.5rem;
}
.doc-footer--border {
  border-top: 1px solid #e5e7eb;
}
.doc-footer--xs {
  font-size: 0.75rem;
}
.doc-footer--sm {
  font-size: 0.875rem;
}
.doc-footer__left {
  text-align: left;
}
.doc-footer__center {
  text-align: center;
}
.doc-footer__right {
  text-align: right;
}
</style>
