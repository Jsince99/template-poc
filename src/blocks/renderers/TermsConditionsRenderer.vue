<script setup lang="ts">
import { computed } from "vue";
import type { TermsConditionsBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: TermsConditionsBlock;
  data: Record<string, unknown>;
}>();

const title = computed(() =>
  props.block.props.title
    ? compileProp(props.block.props.title, props.data)
    : ""
);

const items = computed(() =>
  (props.block.props.items ?? []).map((item) =>
    compileProp(item, props.data)
  )
);

const listTag = computed(() =>
  props.block.props.listStyle === "bulleted" ? "ul" : "ol"
);
</script>

<template>
  <div
    class="doc-terms-conditions"
    :class="[`doc-terms-conditions--${block.props.fontSize ?? 'xs'}`, { 'doc-terms-conditions--none': block.props.listStyle === 'none' }]"
  >
    <div v-if="title" class="doc-terms-conditions__title">{{ title }}</div>
    <component
      :is="listTag"
      class="doc-terms-conditions__list"
      :class="{ 'doc-terms-conditions__list--none': block.props.listStyle === 'none' }"
    >
      <li v-for="(item, i) in items" :key="i" class="doc-terms-conditions__item">
        {{ item }}
      </li>
    </component>
  </div>
</template>

<style scoped>
.doc-terms-conditions {
  margin: 0.5rem 0;
}
.doc-terms-conditions--xs {
  font-size: 0.75rem;
}
.doc-terms-conditions--sm {
  font-size: 0.875rem;
}
.doc-terms-conditions__title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.doc-terms-conditions__list {
  margin: 0;
  padding-left: 1.25rem;
}
.doc-terms-conditions__list--none {
  list-style: none;
  padding-left: 0;
}
.doc-terms-conditions__item {
  margin-bottom: 0.25rem;
}
</style>
