<script setup lang="ts">
import { computed } from "vue";
import type { AddressBlock } from "../../types/blocks";
import { compileProp } from "./compileProp";

const props = defineProps<{
  block: AddressBlock;
  data: Record<string, unknown>;
}>();

const label = computed(() =>
  compileProp(props.block.props.label, props.data)
);
const name = computed(() =>
  compileProp(props.block.props.name, props.data)
);
const addressLines = computed(() =>
  props.block.props.addressLines
    ? compileProp(props.block.props.addressLines, props.data)
    : ""
);
const city = computed(() =>
  props.block.props.city ? compileProp(props.block.props.city, props.data) : ""
);
const state = computed(() =>
  props.block.props.state ? compileProp(props.block.props.state, props.data) : ""
);
const zip = computed(() =>
  props.block.props.zip ? compileProp(props.block.props.zip, props.data) : ""
);
const country = computed(() =>
  props.block.props.country
    ? compileProp(props.block.props.country, props.data)
    : ""
);

const addressParts = computed(() => {
  const parts: string[] = [];
  if (city.value) parts.push(city.value);
  if (state.value) parts.push(state.value);
  if (zip.value) parts.push(zip.value);
  if (country.value) parts.push(country.value);
  return parts;
});

const extras = computed(() =>
  (props.block.props.extras ?? []).map((e) => ({
    label: compileProp(e.label, props.data),
    value: compileProp(e.value, props.data),
  }))
);
</script>

<template>
  <div class="doc-address-block">
    <div v-if="label" class="doc-address-block__label">{{ label }}</div>
    <div class="doc-address-block__content">
      <div v-if="name" class="doc-address-block__name">{{ name }}</div>
      <div v-if="addressLines" class="doc-address-block__lines">
        {{ addressLines }}
      </div>
      <div v-if="addressParts.length" class="doc-address-block__location">
        {{ addressParts.join(", ") }}
      </div>
      <div
        v-for="(extra, i) in extras"
        :key="i"
        class="doc-address-block__extra"
      >
        <span class="doc-address-block__extra-label">{{ extra.label }}:</span>
        {{ extra.value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-address-block {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fafafa;
}
.doc-address-block__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.25rem;
}
.doc-address-block__name {
  font-weight: 600;
}
.doc-address-block__lines,
.doc-address-block__location {
  white-space: pre-line;
}
.doc-address-block__extra {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
.doc-address-block__extra-label {
  font-weight: 500;
  margin-right: 0.25rem;
}
</style>
