<script setup lang="ts">
import { computed } from "vue";
import { Sortable } from "sortablejs-vue3";
import type { SortableEvent } from "sortablejs";
import Button from "primevue/button";
import BlockRenderer from "../renderers/BlockRenderer.vue";
import { isContainerBlock } from "../../types/blocks";
import type { Block, ContainerBlock } from "../../types/blocks";
import { pendingClone } from "../../composables/useDragState";

const props = defineProps<{
  block: Block;
  templateBlocks: Block[];
  sampleData: Record<string, unknown> | null;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [block: Block];
  "update:block": [block: Block];
  remove: [id: string];
  change: [];
}>();

const isSelected = computed(() => props.selectedId === props.block.id);
const isContainer = computed(() => isContainerBlock(props.block));

const containerBlock = computed(() =>
  isContainer.value ? (props.block as ContainerBlock) : null
);

const children = computed(() => containerBlock.value?.children ?? []);

const containerOptions = {
  group: "blocks",
  handle: ".block-drag-handle",
  animation: 150,
  ghostClass: "builder-ghost",
  chosenClass: "builder-chosen",
};

function onChildAdd(evt: SortableEvent) {
  const cb = containerBlock.value;
  if (!cb) return;
  evt.item.parentNode?.removeChild(evt.item);
  const block = pendingClone.value;
  pendingClone.value = null;
  if (!block) return;
  const idx = evt.newIndex ?? cb.children.length;
  cb.children.splice(idx, 0, block);
  emit("change");
}

function onChildUpdate(evt: SortableEvent) {
  const cb = containerBlock.value;
  if (!cb) return;
  const { oldIndex, newIndex } = evt;
  if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
  const [moved] = cb.children.splice(oldIndex, 1);
  cb.children.splice(newIndex, 0, moved);
  emit("change");
}

function onSelect(e: Event) {
  e.stopPropagation();
  emit("select", props.block);
}

function onRemove(e: Event) {
  e.stopPropagation();
  emit("remove", props.block.id);
}

function onChildRemove(id: string) {
  const cb = containerBlock.value;
  if (!cb) return;
  const idx = cb.children.findIndex((c) => c.id === id);
  if (idx !== -1) {
    cb.children.splice(idx, 1);
    emit("change");
  }
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
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            size="small"
            class="ml-auto shrink-0 !p-1"
            aria-label="Remove block"
            @click="onRemove"
          />
        </div>
        <div class="block-preview" style="color: #1a1a1a; color-scheme: light;">
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
          <Sortable
            :list="children"
            item-key="id"
            tag="div"
            :options="containerOptions"
            class="flex flex-col gap-2 min-h-[48px]"
            @add="onChildAdd"
            @update="onChildUpdate"
          >
            <template #item="{ element: childBlock }">
              <BuilderBlock
                :block="childBlock"
                :template-blocks="templateBlocks"
                :sample-data="sampleData"
                :selected-id="selectedId"
                @select="emit('select', $event)"
                @update:block="emit('update:block', $event)"
                @remove="onChildRemove"
                @change="emit('change')"
              />
            </template>
          </Sortable>
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
  background-color: rgba(59, 130, 246, 0.08);
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
