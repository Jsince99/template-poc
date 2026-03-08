<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";
import Button from "primevue/button";
import { nanoid } from "nanoid";

const props = withDefaults(
  defineProps<{
    modelValue: unknown[];
    addLabel?: string;
    createDefault: () => unknown;
  }>(),
  { addLabel: "Add Item" }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: unknown[]): void;
}>();

const localList = computed({
  get: () => props.modelValue ?? [],
  set: (val) => emit("update:modelValue", val),
});

function addItem() {
  const item = props.createDefault();
  if (typeof item === "object" && item !== null && !("id" in item) && !("key" in item)) {
    (item as Record<string, unknown>).__dynamicListKey = nanoid();
  }
  emit("update:modelValue", [...localList.value, item]);
}

function removeItem(index: number) {
  const next = [...localList.value];
  next.splice(index, 1);
  emit("update:modelValue", next);
}

function getItemKey(el: unknown): string {
  if (typeof el === "object" && el !== null) {
    if ("id" in el && el.id != null) return String(el.id);
    if ("key" in el && el.key != null) return String(el.key);
    if ("__dynamicListKey" in el && el.__dynamicListKey != null)
      return String(el.__dynamicListKey);
  }
  return String(Math.random());
}
</script>

<template>
  <div class="dynamic-list flex flex-col gap-2">
    <draggable
      v-model="localList"
      :item-key="getItemKey"
      handle=".drag-handle"
      tag="transition-group"
      :component-data="{
        name: 'list',
        tag: 'div',
        class: 'flex flex-col gap-2',
      }"
      item-class="dynamic-list-item"
    >
      <template #item="{ element, index }">
        <div
          :key="getItemKey(element)"
          class="dynamic-list-item flex items-start gap-2 p-2 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900"
        >
            <span
              class="drag-handle cursor-grab active:cursor-grabbing p-1 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 shrink-0"
              title="Drag to reorder"
            >
              <i class="pi pi-bars"></i>
            </span>
            <div class="flex-1 min-w-0">
              <slot name="item" :item="element" :index="index" />
            </div>
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              size="small"
              :aria-label="`Remove item ${index + 1}`"
              @click="removeItem(index)"
            />
          </div>
      </template>
    </draggable>
    <Button
      :label="addLabel"
      icon="pi pi-plus"
      severity="secondary"
      outlined
      size="small"
      @click="addItem"
    />
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
