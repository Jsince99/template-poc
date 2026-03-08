<script setup lang="ts">
import { computed } from "vue";
import type { AddressBlock, AddressBlockProps } from "../../types/blocks";
import DynamicList from "../../components/DynamicList.vue";
import VariableInput from "../../components/VariableInput.vue";

const props = defineProps<{
  modelValue: AddressBlock;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: AddressBlock): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function updateProps<K extends keyof AddressBlockProps>(
  key: K,
  value: AddressBlockProps[K]
) {
  const next = { ...block.value };
  next.props = { ...next.props, [key]: value };
  emit("update:modelValue", next);
}

function createExtra() {
  return { label: "Label", value: "{{value}}" };
}

function updateExtraLabel(index: number, v: string) {
  const extras = block.value.props.extras ?? [];
  const arr = extras.map((e, i) =>
    i === index ? { ...e, label: v } : e
  ) as Array<{ label: string; value: string }>;
  updateProps("extras", arr);
}

function updateExtraValue(index: number, v: string) {
  const extras = block.value.props.extras ?? [];
  const arr = extras.map((e, i) =>
    i === index ? { ...e, value: v } : e
  ) as Array<{ label: string; value: string }>;
  updateProps("extras", arr);
}

function getExtraLabel(item: unknown): string {
  return (item as { label: string; value: string })?.label ?? "";
}

function getExtraValue(item: unknown): string {
  return (item as { label: string; value: string })?.value ?? "";
}
</script>

<template>
  <div class="address-block-editor flex flex-col gap-3">
    <VariableInput
      :model-value="block.props.label"
      label="Label"
      placeholder="e.g. Bill To"
      @update:model-value="updateProps('label', $event)"
    />
    <VariableInput
      :model-value="block.props.name"
      label="Name"
      placeholder="{{customer.name}}"
      @update:model-value="updateProps('name', $event)"
    />
    <VariableInput
      :model-value="block.props.addressLines ?? ''"
      label="Address Lines"
      multiline
      placeholder="{{customer.address}}"
      @update:model-value="updateProps('addressLines', $event)"
    />
    <VariableInput
      :model-value="block.props.city ?? ''"
      label="City"
      placeholder="{{customer.city}}"
      @update:model-value="updateProps('city', $event)"
    />
    <VariableInput
      :model-value="block.props.state ?? ''"
      label="State"
      placeholder="{{customer.state}}"
      @update:model-value="updateProps('state', $event)"
    />
    <VariableInput
      :model-value="block.props.zip ?? ''"
      label="ZIP"
      placeholder="{{customer.zip}}"
      @update:model-value="updateProps('zip', $event)"
    />
    <VariableInput
      :model-value="block.props.country ?? ''"
      label="Country"
      placeholder="{{customer.country}}"
      @update:model-value="updateProps('country', $event)"
    />
    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
        Extras
      </label>
      <DynamicList
        :model-value="block.props.extras ?? []"
        add-label="Add Extra"
        :create-default="createExtra"
        @update:model-value="updateProps('extras', $event as Array<{ label: string; value: string }>)"
      >
        <template #item="{ item, index }">
          <div class="flex flex-col gap-1">
            <VariableInput
              :model-value="getExtraLabel(item)"
              placeholder="Label"
              @update:model-value="updateExtraLabel(index, $event)"
            />
            <VariableInput
              :model-value="getExtraValue(item)"
              placeholder="Value"
              @update:model-value="updateExtraValue(index, $event)"
            />
          </div>
        </template>
      </DynamicList>
    </div>
  </div>
</template>
