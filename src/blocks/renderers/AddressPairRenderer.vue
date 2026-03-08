<script setup lang="ts">
import type { AddressPairBlock } from "../../types/blocks";
import AddressBlockRenderer from "./AddressBlockRenderer.vue";

defineProps<{
  block: AddressPairBlock;
  data: Record<string, unknown>;
}>();

const ratioMap = {
  "50-50": "1fr 1fr",
  "40-60": "2fr 3fr",
  "60-40": "3fr 2fr",
};
</script>

<template>
  <div
    class="doc-address-pair"
    :style="{
      gridTemplateColumns: ratioMap[block.props.columnRatio ?? '50-50'],
    }"
  >
    <AddressBlockRenderer
      :block="{ id: block.id + '_left', type: 'address-block', props: block.props.left }"
      :data="data"
    />
    <AddressBlockRenderer
      :block="{ id: block.id + '_right', type: 'address-block', props: block.props.right }"
      :data="data"
    />
  </div>
</template>

<style scoped>
.doc-address-pair {
  display: grid;
  gap: 1rem;
  margin: 0.5rem 0;
}
</style>
