<script setup lang="ts">
import { computed } from "vue";
import type { DocumentHeaderBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: DocumentHeaderBlock;
  data: Record<string, unknown> | null;
}>();

const companyName = computed(() =>
  compileProp(props.block.props.companyName, props.data)
);
const documentTitle = computed(() =>
  compileProp(props.block.props.documentTitle, props.data)
);
const documentSubtitle = computed(() =>
  props.block.props.documentSubtitle
    ? compileProp(props.block.props.documentSubtitle, props.data)
    : ""
);
</script>

<template>
  <header
    class="doc-header"
    :class="`doc-header--${block.props.layout ?? 'logo-left'}`"
  >
    <div v-if="block.props.logo" class="doc-header__logo">
      <img :src="block.props.logo" alt="Logo" />
    </div>
    <div class="doc-header__content">
      <h1
        class="doc-header__title"
        :style="{ color: block.props.accentColor || 'inherit' }"
      >
        {{ documentTitle }}
      </h1>
      <p v-if="documentSubtitle" class="doc-header__subtitle">
        {{ documentSubtitle }}
      </p>
      <p class="doc-header__company">{{ companyName }}</p>
    </div>
  </header>
</template>

<style scoped>
.doc-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
.doc-header--logo-left {
  flex-direction: row;
}
.doc-header--centered {
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.doc-header--logo-right {
  flex-direction: row-reverse;
}
.doc-header__logo img {
  max-height: 48px;
  max-width: 120px;
  object-fit: contain;
}
.doc-header__content {
  flex: 1;
}
.doc-header__title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
}
.doc-header__subtitle {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}
.doc-header__company {
  margin: 0;
  font-size: 1rem;
}
</style>
