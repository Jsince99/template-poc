<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";
import { blockRegistry, createBlock } from "../../registry/blockRegistry";
import type { Block } from "../../types/blocks";

const contentBlocks = computed(() =>
  blockRegistry.filter((b) => b.category === "content")
);
const logicBlocks = computed(() =>
  blockRegistry.filter((b) => b.category === "logic")
);

// Palette items are descriptors; clone creates real blocks when dropped
function cloneBlock(item: { type: string }): Block {
  return createBlock(item.type);
}

const groupConfig = {
  name: "blocks",
  pull: "clone" as const,
  put: false,
};
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
      <draggable
        :list="contentBlocks"
        :group="groupConfig"
        :clone="cloneBlock"
        :sort="false"
        item-key="type"
        tag="div"
        class="flex flex-col gap-1"
      >
        <template #item="{ element }">
          <div
            class="palette-item flex items-center gap-2 px-3 py-2 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 cursor-grab active:cursor-grabbing hover:border-primary-500 transition-colors"
          >
            <i :class="element.icon" class="pi text-surface-500 shrink-0"></i>
            <span class="text-sm text-surface-800 dark:text-surface-200 truncate">
              {{ element.label }}
            </span>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Logic blocks -->
    <div class="flex flex-col gap-2">
      <span class="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">
        Logic
      </span>
      <draggable
        :list="logicBlocks"
        :group="groupConfig"
        :clone="cloneBlock"
        :sort="false"
        item-key="type"
        tag="div"
        class="flex flex-col gap-1"
      >
        <template #item="{ element }">
          <div
            class="palette-item flex items-center gap-2 px-3 py-2 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 cursor-grab active:cursor-grabbing hover:border-primary-500 transition-colors"
          >
            <i :class="element.icon" class="pi text-surface-500 shrink-0"></i>
            <span class="text-sm text-surface-800 dark:text-surface-200 truncate">
              {{ element.label }}
            </span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
.block-palette {
  min-height: 0;
  overflow-y: auto;
}
</style>
