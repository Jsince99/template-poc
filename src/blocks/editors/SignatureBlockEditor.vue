<script setup lang="ts">
import { computed } from "vue";
import type { SignatureBlockBlock, Signatory } from "../../types/blocks";
import Select from "primevue/select";
import InputSwitch from "primevue/inputswitch";
import VariableInput from "../../components/VariableInput.vue";
import DynamicList from "../../components/DynamicList.vue";

const props = defineProps<{
  modelValue: SignatureBlockBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: SignatureBlockBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const layoutOptions = [
  { label: "Side by Side", value: "side-by-side" },
  { label: "Stacked", value: "stacked" },
];

function updateProps<K extends keyof SignatureBlockBlock["props"]>(
  key: K,
  value: SignatureBlockBlock["props"][K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

function createSignatory(): Signatory {
  return {
    label: "Authorized Signatory",
    name: "",
    designation: "",
    showLine: true,
  };
}

function updateSignatory(index: number, patch: Partial<Signatory>) {
  const arr = [...block.value.props.signatories];
  arr[index] = { ...arr[index], ...patch };
  updateProps("signatories", arr);
}

function getSignatoryProp(item: unknown, key: keyof Signatory): string | boolean {
  const val = (item as Signatory)?.[key];
  if (key === "showLine") return val ?? true;
  return val !== undefined && val !== null ? String(val) : "";
}
</script>

<template>
  <div class="signature-block-editor flex flex-col gap-3">
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Layout
      </label>
      <Select
        :model-value="block.props.layout ?? 'side-by-side'"
        :options="layoutOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateProps('layout', $event)"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Signatories
      </label>
      <DynamicList
        :model-value="block.props.signatories"
        add-label="Add Signatory"
        :create-default="createSignatory"
        @update:model-value="updateProps('signatories', $event as Signatory[])"
      >
        <template #item="{ item, index }">
          <div class="flex flex-col gap-1">
            <VariableInput
              :model-value="getSignatoryProp(item, 'label') as string"
              placeholder="Label"
              @update:model-value="updateSignatory(index, { label: $event })"
            />
            <VariableInput
              :model-value="getSignatoryProp(item, 'name') as string"
              placeholder="Name"
              @update:model-value="updateSignatory(index, { name: $event })"
            />
            <VariableInput
              :model-value="getSignatoryProp(item, 'designation') as string"
              placeholder="Designation"
              @update:model-value="updateSignatory(index, { designation: $event })"
            />
            <div class="flex items-center justify-between gap-2">
              <label class="text-xs text-surface-600 dark:text-surface-400">
                Show Line
              </label>
              <InputSwitch
                :model-value="getSignatoryProp(item, 'showLine') as boolean"
                @update:model-value="updateSignatory(index, { showLine: $event })"
              />
            </div>
          </div>
        </template>
      </DynamicList>
    </div>
  </div>
</template>
