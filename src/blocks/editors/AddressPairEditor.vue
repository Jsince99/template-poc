<script setup lang="ts">
import { computed } from "vue";
import type { AddressPairBlock } from "../../types/blocks";
import Select from "primevue/select";
import AddressBlockEditor from "./AddressBlockEditor.vue";

const props = defineProps<{
  modelValue: AddressPairBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: AddressPairBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const columnRatioOptions = [
  { label: "50-50", value: "50-50" },
  { label: "40-60", value: "40-60" },
  { label: "60-40", value: "60-40" },
];

const leftBlock = computed({
  get: () => ({
    id: "left",
    type: "address-block" as const,
    props: block.value.props.left,
  }),
  set: (val) => {
    const next = { ...block.value };
    next.props = { ...next.props, left: val.props };
    emit("update:modelValue", next);
  },
});

const rightBlock = computed({
  get: () => ({
    id: "right",
    type: "address-block" as const,
    props: block.value.props.right,
  }),
  set: (val) => {
    const next = { ...block.value };
    next.props = { ...next.props, right: val.props };
    emit("update:modelValue", next);
  },
});

function updateColumnRatio(value: "50-50" | "40-60" | "60-40") {
  const next = { ...block.value };
  next.props = { ...next.props, columnRatio: value };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="address-pair-editor flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Column Ratio
      </label>
      <Select
        :model-value="block.props.columnRatio ?? '50-50'"
        :options="columnRatioOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateColumnRatio($event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Left Address
      </label>
      <AddressBlockEditor v-model="leftBlock" />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Right Address
      </label>
      <AddressBlockEditor v-model="rightBlock" />
    </div>
  </div>
</template>
