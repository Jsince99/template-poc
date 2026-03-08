<script setup lang="ts">
import { ref, watch } from "vue";
import { Sortable } from "sortablejs-vue3";
import type { SortableEvent } from "sortablejs";
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

// Local copy so Sortable can render it; we sync back on changes
const localList = ref<unknown[]>([...(props.modelValue ?? [])]);

watch(
  () => props.modelValue,
  (val) => {
    localList.value = [...(val ?? [])];
  }
);

const sortableOptions = {
  handle: ".drag-handle",
  animation: 150,
  ghostClass: "dynamic-list-ghost",
};

function getItemKey(el: unknown): string {
  if (typeof el === "object" && el !== null) {
    if ("id" in el && el.id != null) return String((el as any).id);
    if ("key" in el && el.key != null) return String((el as any).key);
    if ("__dynamicListKey" in el && (el as any).__dynamicListKey != null)
      return String((el as any).__dynamicListKey);
  }
  return String(Math.random());
}

function onSortUpdate(evt: SortableEvent) {
  const { oldIndex, newIndex } = evt;
  if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
  const next = [...localList.value];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  localList.value = next;
  emit("update:modelValue", next);
}

function addItem() {
  const item = props.createDefault();
  if (typeof item === "object" && item !== null && !("id" in item) && !("key" in item)) {
    (item as Record<string, unknown>).__dynamicListKey = nanoid();
  }
  const next = [...localList.value, item];
  localList.value = next;
  emit("update:modelValue", next);
}

function removeItem(index: number) {
  const next = [...localList.value];
  next.splice(index, 1);
  localList.value = next;
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="dynamic-list flex flex-col gap-2">
    <Sortable
      :list="localList"
      :item-key="getItemKey"
      tag="div"
      :options="sortableOptions"
      class="flex flex-col gap-2"
      @update="onSortUpdate"
    >
      <template #item="{ element, index }">
        <div
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
    </Sortable>
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

<style>
.dynamic-list-ghost {
  opacity: 0.5;
}
</style>
