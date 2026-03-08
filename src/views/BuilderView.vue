<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import draggable from "vuedraggable";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Toolbar from "primevue/toolbar";
import BlockPalette from "../blocks/palette/BlockPalette.vue";
import BuilderBlock from "../blocks/builder/BuilderBlock.vue";
import BlockEditor from "../blocks/editors/BlockEditor.vue";
import { useTemplateStore } from "../stores/templateStore";
import { isContainerBlock } from "../types/blocks";
import type { Block, DocTemplate } from "../types/blocks";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const templateStore = useTemplateStore();

const template = ref<DocTemplate | null>(null);
const selectedBlock = ref<Block | null>(null);
const saveStatus = ref<"idle" | "saving" | "saved">("idle");
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

const templateId = computed(() => route.params.id as string);

async function loadTemplate() {
  if (!templateId.value) return;
  await templateStore.loadAll(); // ensures DB is seeded
  const t = await templateStore.getById(templateId.value);
  template.value = t ? structuredClone(t) : null;
  selectedBlock.value = null;
}

function findBlockById(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (isContainerBlock(b)) {
      const found = findBlockById(b.children, id);
      if (found) return found;
    }
  }
  return null;
}

function selectBlock(block: Block) {
  selectedBlock.value = block;
}

function updateSelectedBlock(updated: Block) {
  if (!template.value || !selectedBlock.value) return;
  const updateIn = (blocks: Block[]): boolean => {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].id === selectedBlock.value!.id) {
        blocks[i] = updated;
        selectedBlock.value = updated;
        return true;
      }
      const blk = blocks[i];
      if (isContainerBlock(blk)) {
        if (updateIn(blk.children)) return true;
      }
    }
    return false;
  };
  updateIn(template.value.blocks);
  scheduleAutoSave();
}

function scheduleAutoSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveTemplate, 1500);
}

async function saveTemplate() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
  if (!template.value || !templateId.value) return;
  saveStatus.value = "saving";
  try {
    await templateStore.update(templateId.value, {
      blocks: template.value.blocks,
      name: template.value.name,
    });
    saveStatus.value = "saved";
    toast.add({
      severity: "success",
      summary: "Saved",
      detail: "Template saved successfully",
      life: 2000,
    });
    setTimeout(() => (saveStatus.value = "idle"), 2000);
  } catch {
    toast.add({
      severity: "error",
      summary: "Save failed",
      detail: "Could not save template",
      life: 3000,
    });
    saveStatus.value = "idle";
  }
}

function goToDashboard() {
  router.push("/");
}

function openInPlayground() {
  router.push({ path: "/playground", query: { template: templateId.value } });
}

watch(
  () => route.params.id,
  () => loadTemplate(),
  { immediate: false }
);

onMounted(() => loadTemplate());

// Sync selected block ref when template reloads (e.g. after save refreshes store)
watch(
  () => template.value?.blocks,
  () => {
    if (selectedBlock.value && template.value) {
      const found = findBlockById(template.value.blocks, selectedBlock.value.id);
      if (found) selectedBlock.value = found;
    }
  },
  { deep: true }
);
</script>

<template>
  <div v-if="template" class="builder-view h-screen flex flex-col">
    <!-- Top bar -->
    <Toolbar class="border-b border-surface-200 dark:border-surface-700 rounded-none">
      <template #start>
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          aria-label="Back to Dashboard"
          @click="goToDashboard"
        />
        <InputText
          v-model="template.name"
          class="ml-3 font-semibold text-lg border-none bg-transparent focus:ring-0 max-w-xs"
          placeholder="Template name"
          @blur="scheduleAutoSave"
        />
      </template>
      <template #end>
        <span
          v-if="saveStatus === 'saving'"
          class="text-sm text-surface-500 flex items-center gap-2"
        >
          <i class="pi pi-spin pi-spinner"></i>
          Saving...
        </span>
        <span
          v-else-if="saveStatus === 'saved'"
          class="text-sm text-green-600 dark:text-green-400 flex items-center gap-2"
        >
          <i class="pi pi-check"></i>
          Saved
        </span>
        <Button
          label="Save"
          icon="pi pi-save"
          class="ml-2"
          @click="saveTemplate"
        />
        <Button
          label="Open in Playground"
          icon="pi pi-external-link"
          severity="secondary"
          outlined
          class="ml-2"
          @click="openInPlayground"
        />
      </template>
    </Toolbar>

    <!-- Three-panel layout -->
    <div class="builder-content flex-1 min-h-0 flex">
      <!-- Left: Block palette (narrower on small screens) -->
      <div
        class="palette-panel w-[250px] md:w-[220px] shrink-0 border-r border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 overflow-hidden flex flex-col"
      >
        <BlockPalette />
      </div>

      <!-- Center: Canvas (flex) -->
      <div class="canvas-panel flex-1 min-w-0 overflow-auto p-2 md:p-4 bg-surface-100 dark:bg-surface-900">
        <div class="canvas-inner max-w-3xl mx-auto">
          <div class="canvas-paper bg-white dark:bg-surface-800 rounded-lg shadow-sm p-4 md:p-8 min-h-[400px]">
            <draggable
              v-model="template.blocks"
              group="blocks"
              item-key="id"
              handle=".block-drag-handle"
              ghost-class="builder-ghost"
              chosen-class="builder-chosen"
              tag="div"
              class="flex flex-col gap-2"
              @change="scheduleAutoSave"
            >
              <template #item="{ element: block }">
                <BuilderBlock
                  :block="block"
                  :template-blocks="template.blocks"
                  :sample-data="template.sampleData ?? {}"
                  :selected-id="selectedBlock?.id ?? null"
                  @select="selectBlock"
                  @update:block="updateSelectedBlock"
                  @change="scheduleAutoSave"
                />
              </template>
            </draggable>
            <div
              v-if="template.blocks.length === 0"
              class="flex flex-col items-center justify-center py-16 text-surface-400 dark:text-surface-500 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg"
            >
              <i class="pi pi-inbox text-4xl mb-2"></i>
              <p class="text-sm m-0">Drag blocks here to start building</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Properties (hidden on small screens, 320px on md+) -->
      <div
        class="properties-panel w-[280px] md:w-[320px] shrink-0 border-l border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 overflow-hidden hidden sm:flex sm:flex-col"
      >
        <div class="p-4 border-b border-surface-200 dark:border-surface-700">
          <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-300 m-0">
            Properties
          </h3>
        </div>
        <div class="properties-content flex-1 overflow-y-auto p-4">
          <BlockEditor
            v-if="selectedBlock"
            :model-value="selectedBlock"
            @update:model-value="updateSelectedBlock"
          />
          <div
            v-else
            class="flex flex-col items-center justify-center py-12 text-center text-surface-500 dark:text-surface-400"
          >
            <i class="pi pi-info-circle text-3xl mb-2"></i>
            <p class="text-sm m-0">Select a block to edit its properties</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950"
  >
    <div class="flex flex-col items-center gap-4">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      <p class="text-surface-600 dark:text-surface-400">Loading template...</p>
      <Button label="Back to Dashboard" severity="secondary" @click="goToDashboard" />
    </div>
  </div>
</template>

<style>
/* Drag ghost: semi-transparent, type label visible (applied by Sortable) */
.builder-ghost {
  opacity: 0.5;
}

.builder-chosen {
  opacity: 0.85;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
