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
    class="builder-block rounded-lg transition-all duration-150"
    :class="[
      isSelected
        ? 'builder-block--selected'
        : 'builder-block--unselected',
      isContainer && 'builder-block--container',
      block.type === 'conditional' && 'builder-block--conditional',
      block.type === 'loop' && 'builder-block--loop',
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
            v-if="block.type === 'conditional'"
            class="builder-block__badge builder-block__badge--if"
          >
            IF
          </span>
          <span
            v-else-if="block.type === 'loop'"
            class="builder-block__badge builder-block__badge--each"
          >
            EACH
          </span>
          <span
            v-else
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
          class="container-children mt-2 pl-4 border-l-2 border-dashed border-surface-300 dark:border-surface-600 relative"
        >
          <draggable
            v-model="children"
            group="blocks"
            item-key="id"
            handle=".block-drag-handle"
            ghost-class="builder-ghost"
            chosen-class="builder-chosen"
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

<style scoped>
.builder-block--unselected {
  border: 2px solid transparent;
}

.builder-block--unselected:hover {
  border-color: var(--p-border-color);
}

.builder-block--selected {
  border-left: 3px solid #3b82f6;
  border-top: 2px solid transparent;
  border-right: 2px solid transparent;
  border-bottom: 2px solid transparent;
  background-color: rgba(59, 130, 246, 0.08);
}

.dark .builder-block--selected {
  background-color: rgba(59, 130, 246, 0.15);
}

.builder-block--container.builder-block--unselected {
  border: 2px dashed var(--p-border-color);
}

.builder-block--conditional.builder-block--unselected {
  border-color: #3b82f6;
}

.builder-block--loop.builder-block--unselected {
  border-color: #22c55e;
}

.builder-block__badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.builder-block__badge--if {
  background: #dbeafe;
  color: #1d4ed8;
}

.dark .builder-block__badge--if {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.builder-block__badge--each {
  background: #dcfce7;
  color: #15803d;
}

.dark .builder-block__badge--each {
  background: rgba(34, 197, 94, 0.3);
  color: #86efac;
}
</style>
