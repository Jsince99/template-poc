<script setup lang="ts">
import { computed } from "vue";
import { Sortable } from "sortablejs-vue3";
import type { SortableEvent } from "sortablejs";
import { blockRegistry, createBlock } from "../../registry/blockRegistry";
import { pendingClone } from "../../composables/useDragState";

const contentBlocks = computed(() =>
  blockRegistry.filter((b) => b.category === "content")
);
const logicBlocks = computed(() =>
  blockRegistry.filter((b) => b.category === "logic")
);

const paletteOptions = {
  group: { name: "blocks", pull: "clone", put: false },
  sort: false,
  animation: 150,
  ghostClass: "palette-ghost",
  chosenClass: "palette-chosen",
};

function onClone(evt: SortableEvent) {
  // item is the original palette element; its data-block-type tells us what to create
  const type = (evt.item as HTMLElement).dataset.blockType;
  if (type) {
    pendingClone.value = createBlock(type);
  }
}
</script>

<template>
  <div class="block-palette flex flex-col gap-4 p-3">
    <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-300 m-0">
      Blocks
    </h3>

    <!-- Content blocks -->
    <div class="flex flex-col gap-2">
      <span class="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">
        Content
      </span>
      <Sortable
        :list="contentBlocks"
        item-key="type"
        tag="div"
        :options="paletteOptions"
        class="flex flex-col gap-1"
        @clone="onClone"
      >
        <template #item="{ element }">
          <div
            class="palette-item flex items-center gap-2 px-3 py-2 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 cursor-grab active:cursor-grabbing hover:border-primary-500 transition-colors"
            :data-block-type="element.type"
            v-tooltip.top="element.description"
          >
            <i :class="element.icon" class="pi text-surface-500 shrink-0"></i>
            <span class="text-sm text-surface-800 dark:text-surface-200 truncate">
              {{ element.label }}
            </span>
          </div>
        </template>
      </Sortable>
    </div>

    <!-- Logic blocks -->
    <div class="flex flex-col gap-2">
      <span class="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">
        Logic
      </span>
      <Sortable
        :list="logicBlocks"
        item-key="type"
        tag="div"
        :options="paletteOptions"
        class="flex flex-col gap-1"
        @clone="onClone"
      >
        <template #item="{ element }">
          <div
            class="palette-item flex items-center gap-2 px-3 py-2 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 cursor-grab active:cursor-grabbing hover:border-primary-500 transition-colors"
            :data-block-type="element.type"
            v-tooltip.top="element.description"
          >
            <i :class="element.icon" class="pi text-surface-500 shrink-0"></i>
            <span class="text-sm text-surface-800 dark:text-surface-200 truncate">
              {{ element.label }}
            </span>
          </div>
        </template>
      </Sortable>
    </div>
  </div>
</template>

<style scoped>
.block-palette {
  min-height: 0;
  overflow-y: auto;
}
</style>

<style>
.palette-ghost {
  opacity: 0.5;
}

.palette-chosen {
  opacity: 0.85;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
