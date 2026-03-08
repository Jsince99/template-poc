<template>
  <div class="playground h-screen flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center gap-4 p-4 border-b surface-border shrink-0">
      <Button
        label="Dashboard"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="router.push('/')"
      />
      <h1 class="text-xl font-semibold m-0">Playground</h1>
    </div>

    <!-- Empty state: no templates -->
    <div
      v-if="!templateStore.loading && templateStore.templates.length === 0"
      class="flex-1 flex flex-col items-center justify-center p-8 text-center"
    >
      <i class="pi pi-folder-open text-6xl text-surface-400 mb-4"></i>
      <p class="text-surface-600 dark:text-surface-400 text-lg m-0">
        No templates yet.
      </p>
      <p class="text-surface-500 dark:text-surface-500 text-sm mt-2 mb-4">
        Create templates in the dashboard first, then use the playground to preview them with custom data.
      </p>
      <Button label="Go to Dashboard" icon="pi pi-home" @click="router.push('/')" />
    </div>

    <!-- Main layout: two panels -->
    <div
      v-else
      class="flex-1 flex min-h-0"
    >
      <!-- Left: Monaco Editor -->
      <div class="w-1/2 flex flex-col border-r surface-border">
        <div class="px-4 py-2 border-b surface-border text-sm font-medium">
          JSON Data
        </div>
        <div ref="monacoContainer" class="flex-1 min-h-0" />
      </div>

      <!-- Right: Template selector + preview -->
      <div class="w-1/2 flex flex-col min-h-0">
        <div class="p-4 border-b surface-border flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px]">
            <label for="template-select" class="block text-sm font-medium mb-1">Template</label>
            <Select
              id="template-select"
              v-model="selectedTemplateId"
              :options="templateStore.templates"
              option-label="name"
              option-value="id"
              placeholder="Select a template"
              class="w-full"
              @change="onTemplateChange"
            />
          </div>
          <div class="flex gap-2 items-end">
            <Button
              label="Export PDF"
              icon="pi pi-file-pdf"
              severity="secondary"
              outlined
              :disabled="!previewHtml || !!parseError"
              @click="handleExportPdf"
            />
            <Button
              label="Export Word"
              icon="pi pi-file-word"
              severity="secondary"
              outlined
              :disabled="!previewHtml || !!parseError"
              @click="handleExportWord"
            />
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div class="px-4 py-2 border-b surface-border text-sm font-medium">
            Live Preview
          </div>
          <div class="flex-1 overflow-auto p-4 bg-surface-100 dark:bg-surface-800">
            <!-- Parse error -->
            <div
              v-if="parseError"
              class="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
            >
              <strong>JSON Parse Error:</strong> {{ parseError }}
            </div>

            <!-- Preview content -->
            <div
              v-else-if="previewHtml"
              ref="previewContainer"
              class="doc-preview-page bg-white dark:bg-surface-0 shadow-sm rounded-lg"
              v-html="previewHtml"
            />

            <!-- No template selected -->
            <div
              v-else-if="!selectedTemplateId"
              class="flex flex-col items-center justify-center py-16 text-surface-500"
            >
              <i class="pi pi-file-edit text-5xl mb-4"></i>
              <p>Select a template to see the live preview.</p>
            </div>

            <!-- Loading -->
            <div
              v-else
              class="flex items-center justify-center py-16"
            >
              <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import loader from "@monaco-editor/loader";
import type * as Monaco from "monaco-editor";
import Button from "primevue/button";
import Select from "primevue/select";
import { useTemplateStore } from "../stores/templateStore";
import { compile } from "../compiler/handlebarsCompiler";
import type { DocTemplate } from "../types/blocks";
import "../assets/styles/document.css";

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();

const monacoContainer = ref<HTMLElement | null>(null);
const previewContainer = ref<HTMLElement | null>(null);
const jsonData = ref<string>("{}");
const selectedTemplateId = ref<string | null>(null);
const previewHtml = ref<string>("");
const parseError = ref<string | null>(null);

let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const DEBOUNCE_MS = 500;

async function initMonaco() {
  const monaco = await loader.init();
  if (!monacoContainer.value) return;

  const instance = monaco.editor.create(monacoContainer.value, {
    value: jsonData.value,
    language: "json",
    theme: "vs",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
  });
  editor = instance;

  instance.onDidChangeModelContent(() => {
    jsonData.value = instance.getValue();
  });
}

function onTemplateChange() {
  // Pre-fill immediately from templates list (avoids waiting for getById)
  const template = templateStore.templates.find((t) => t.id === selectedTemplateId.value);
  if (template?.sampleData) {
    const formatted = JSON.stringify(template.sampleData, null, 2);
    jsonData.value = formatted;
    editor?.setValue(formatted);
  } else {
    jsonData.value = "{}";
    editor?.setValue("{}");
  }
}

const selectedTemplate = ref<DocTemplate | null>(null);

watch(
  () => selectedTemplateId.value,
  (id) => {
    if (!id) {
      selectedTemplate.value = null;
      return;
    }
    templateStore.getById(id).then((t) => {
      selectedTemplate.value = t ?? null;
    });
  },
  { immediate: true }
);

// Pre-fill Monaco when template (with sampleData) becomes available
watch(
  () => selectedTemplate.value,
  (template) => {
    if (template?.sampleData) {
      const formatted = JSON.stringify(template.sampleData, null, 2);
      jsonData.value = formatted;
      editor?.setValue(formatted);
    }
  },
  { immediate: true }
);

function runCompile() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    doCompile();
  }, DEBOUNCE_MS);
}

function doCompile() {
  parseError.value = null;
  previewHtml.value = "";

  const template = selectedTemplate.value;
  if (!template) return;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonData.value) as Record<string, unknown>;
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : String(e);
    return;
  }

  try {
    previewHtml.value = compile(template, data);
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : String(e);
  }
}

watch([jsonData, selectedTemplate], () => runCompile(), { deep: true });

function handleExportPdf() {
  if (!previewContainer.value) {
    console.log("[Export PDF] Preview container not found");
    return;
  }
  // Stub: export not yet implemented (Task 11)
  console.log("[Export PDF] Stub called - export not yet implemented", {
    hasPreview: !!previewHtml.value,
    element: previewContainer.value,
  });
}

function handleExportWord() {
  if (!previewHtml.value) {
    console.log("[Export Word] No preview content");
    return;
  }
  // Stub: export not yet implemented (Task 11)
  console.log("[Export Word] Stub called - export not yet implemented", {
    htmlLength: previewHtml.value.length,
  });
}

onMounted(async () => {
  await templateStore.loadAll();

  // Pre-select template from query (e.g. from builder "Open in Playground")
  const queryTemplateId = route.query.template as string | undefined;
  if (queryTemplateId && templateStore.templates.some((t) => t.id === queryTemplateId)) {
    selectedTemplateId.value = queryTemplateId;
  } else if (templateStore.templates.length > 0 && !selectedTemplateId.value) {
    selectedTemplateId.value = templateStore.templates[0].id;
  }

  await initMonaco();

  // Sync initial value after Monaco is ready (template may have been set by watch)
  onTemplateChange();
});

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  editor?.dispose();
  editor = null;
});
</script>
