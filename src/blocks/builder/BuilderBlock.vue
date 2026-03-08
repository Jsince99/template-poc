<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";
import BlockRenderer from "../renderers/BlockRenderer.vue";
import { isContainerBlock } from "../../types/blocks";
import type { Block, ContainerBlock } from "../../types/blocks";

const props = defineProps<{
  block: Block;
  templateBlocks: Block[];
  sampleData: Record<string, unknown>;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [block: Block];
  "update:block": [block: Block];
  change: [];
}>();

const isSelected = computed(() => props.selectedId === props.block.id);
const isContainer = computed(() => isContainerBlock(props.block));

const containerBlock = computed(() =>
  isContainer.value ? (props.block as ContainerBlock) : null
);

const children = computed({
  get: () => containerBlock.value?.children ?? [],
  set: (val) => {
    if (containerBlock.value) {
      (containerBlock.value as ContainerBlock).children = val;
      emit("change");
    }
  },
});

function onSelect(e: Event) {
  e.stopPropagation();
  emit("select", props.block);
}
</script>

<template>
  <div
    class="builder-block rounded-lg border-2 transition-colors"
    :class="[
      isSelected
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
        : 'border-transparent hover:border-surface-300 dark:hover:border-surface-600',
    ]"
    @click="onSelect"
  >
    <div class="flex items-start gap-2 p-2">
      <span
        class="block-drag-handle cursor-grab active:cursor-grabbing p-1 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 shrink-0 rounded hover:bg-surface-200 dark:hover:bg-surface-700"
        title="Drag to reorder"
      >
        <i class="pi pi-bars text-sm"></i>
      </span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span
            class="text-xs font-medium px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
          >
            {{ block.type }}
          </span>
        </div>
        <div class="block-preview">
          <BlockRenderer
            :block="block"
            :data="sampleData"
            @select="(b) => emit('select', b)"
          />
        </div>
        <!-- Nested container children -->
        <div
          v-if="isContainer && containerBlock"
          class="container-children mt-2 pl-4 border-l-2 border-surface-200 dark:border-surface-700 relative"
        >
          <draggable
            v-model="children"
            group="blocks"
            item-key="id"
            handle=".block-drag-handle"
            tag="div"
            class="flex flex-col gap-2 min-h-[48px]"
            @change="emit('change')"
          >
            <template #item="{ element: childBlock }">
              <BuilderBlock
                :block="childBlock"
                :template-blocks="templateBlocks"
                :sample-data="sampleData"
                :selected-id="selectedId"
                @select="emit('select', $event)"
                @update:block="emit('update:block', $event)"
                @change="emit('change')"
              />
            </template>
          </draggable>
          <div
            v-if="children.length === 0"
            class="absolute inset-0 flex items-center justify-center py-4 text-surface-400 dark:text-surface-500 text-sm border-2 border-dashed border-surface-200 dark:border-surface-700 rounded pointer-events-none"
          >
            Drop blocks here
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
