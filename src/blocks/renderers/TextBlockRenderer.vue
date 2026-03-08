<script setup lang="ts">
import { computed } from "vue";
import Handlebars from "handlebars";
import type { TextBlockBlock } from "../../types/blocks";

const props = defineProps<{
  block: TextBlockBlock;
  data: Record<string, unknown>;
}>();

const compiled = computed(() => {
  const content = props.block.props.content;
  if (!content) return "";
  try {
    const template = Handlebars.compile(content, { noEscape: true });
    return template(props.data);
  } catch {
    return content;
  }
});

const fontSizeClass = computed(() => {
  const size = props.block.props.fontSize ?? "md";
  return `doc-text--${size}`;
});

const textStyleClass = computed(() => {
  const style = props.block.props.textStyle ?? "normal";
  return `doc-text--${style}`;
});
</script>

<template>
  <div
    class="doc-text-block"
    :class="[fontSizeClass, textStyleClass]"
    :style="{ textAlign: block.props.textAlign ?? 'left' }"
    v-html="compiled"
  />
</template>

<style scoped>
.doc-text-block {
  margin: 0.25rem 0;
}
.doc-text-block :deep(p) {
  margin: 0.25rem 0;
}
.doc-text--xs {
  font-size: 0.75rem;
}
.doc-text--sm {
  font-size: 0.875rem;
}
.doc-text--md {
  font-size: 1rem;
}
.doc-text--lg {
  font-size: 1.125rem;
}
.doc-text--muted {
  color: #6b7280;
}
.doc-text--highlight {
  font-weight: 600;
}
.doc-text--legal {
  font-size: 0.75rem;
  color: #4b5563;
}
</style>
