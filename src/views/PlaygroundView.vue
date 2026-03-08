<template>
  <div class="playground h-screen flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center gap-4 px-4 py-3 border-b border-surface-200 dark:border-surface-700 shrink-0">
      <Button
        :label="lockedToTemplate ? 'Back to Builder' : 'Dashboard'"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="goBack"
      />
      <h1 class="text-xl font-semibold m-0">Playground</h1>
      <div class="ml-auto flex items-center gap-2">
        <span v-if="lockedToTemplate" class="text-surface-600 dark:text-surface-400 text-sm">
          {{ templateStore.templates.find(t => t.id === selectedTemplateId)?.name }}
        </span>
      </div>
    </div>

    <!-- Empty state: no templates -->
    <div
      v-if="!templateStore.loading && templateStore.templates.length === 0"
      class="flex-1 flex flex-col items-center justify-center p-8 text-center"
    >
      <i class="pi pi-folder-open text-6xl text-surface-400 mb-4"></i>
      <p class="text-surface-600 dark:text-surface-400 text-lg m-0">No templates yet.</p>
      <p class="text-surface-500 text-sm mt-2 mb-4">
        Create templates in the dashboard first, then use the playground to preview them with custom data.
      </p>
      <Button label="Go to Dashboard" icon="pi pi-home" @click="router.push('/')" />
    </div>

    <!-- Main layout: resizable two panels -->
    <div v-else class="flex-1 flex min-h-0 overflow-hidden" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
      <!-- Left: Monaco Editor -->
      <div
        class="flex flex-col border-r border-surface-200 dark:border-surface-700 min-w-[200px]"
        :style="{ width: leftWidth + 'px' }"
      >
        <!-- Format toggle -->
        <div class="px-3 py-2 border-b border-surface-200 dark:border-surface-700 flex items-center gap-2 shrink-0">
          <span class="text-xs font-medium text-surface-500 uppercase tracking-wide">Data</span>
          <div class="ml-auto flex rounded overflow-hidden border border-surface-300 dark:border-surface-600 text-xs">
            <button
              :class="[
                'px-3 py-1 font-medium transition-colors',
                editorFormat === 'json'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
              ]"
              @click="setFormat('json')"
            >JSON</button>
            <button
              :class="[
                'px-3 py-1 font-medium transition-colors border-l border-surface-300 dark:border-surface-600',
                editorFormat === 'xml'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
              ]"
              @click="setFormat('xml')"
            >XML</button>
          </div>
        </div>
        <div v-if="formatError" class="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 shrink-0">
          {{ formatError }}
        </div>
        <div ref="monacoContainer" class="flex-1 min-h-0" />
      </div>

      <!-- Resize handle -->
      <div
        class="resize-handle w-1.5 shrink-0 cursor-col-resize bg-surface-200 dark:bg-surface-700 hover:bg-primary-400 transition-colors"
        @mousedown.prevent="startDrag"
      />

      <!-- Right: Template selector + preview -->
      <div class="flex-1 flex flex-col min-w-[200px] min-h-0">
        <!-- Toolbar -->
        <div class="px-4 py-2 border-b border-surface-200 dark:border-surface-700 flex flex-wrap items-center gap-3 shrink-0">
          <div v-if="!lockedToTemplate" class="flex-1 min-w-[180px]">
            <Select
              v-model="selectedTemplateId"
              :options="templateStore.templates"
              option-label="name"
              option-value="id"
              placeholder="Select a template"
              class="w-full"
              @change="onTemplateChange"
            />
          </div>
          <div class="flex gap-2 ml-auto">
            <Button
              label="Preview PDF"
              icon="pi pi-file-pdf"
              severity="secondary"
              outlined
              size="small"
              :disabled="!previewHtml || !!parseError"
              :loading="generatingPdf"
              @click="openPdfPreview"
            />
          </div>
        </div>

          <!-- Live preview -->
          <div class="flex-1 overflow-auto p-6 bg-surface-100 dark:bg-surface-900">
            <div
              v-if="parseError"
              class="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm"
            >
              <strong>{{ editorFormat.toUpperCase() }} Parse Error:</strong> {{ parseError }}
            </div>

            <template v-else-if="previewHtml">
              <!-- Paginated A4 view: each page is a fixed 297mm tall card -->
              <div class="flex flex-col gap-4 items-center">
                <div
                  v-for="(page, i) in previewPages"
                  :key="i"
                  class="relative bg-white shadow rounded-sm overflow-hidden shrink-0"
                  style="width: 210mm; height: 297mm;"
                >
                  <!-- Page number badge -->
                  <div class="absolute bottom-2 right-3 text-xs text-surface-400 select-none z-10">
                    {{ i + 1 }} / {{ previewPages.length }}
                  </div>
                  <!-- Iframe per page so styles are isolated -->
                  <iframe
                    :srcdoc="page"
                    class="w-full h-full border-0"
                    scrolling="no"
                  />
                </div>
              </div>
              <!-- Hidden element used by html2canvas for PDF export -->
              <div
                ref="previewContainer"
                class="doc-preview-page"
                style="position:absolute;left:-9999px;top:0;pointer-events:none;"
                v-html="previewHtml"
              />
            </template>

            <div
              v-else-if="!selectedTemplateId"
              class="flex flex-col items-center justify-center py-16 text-surface-500"
            >
              <i class="pi pi-file-edit text-5xl mb-4"></i>
              <p>Select a template to see the live preview.</p>
            </div>
            <div v-else class="flex items-center justify-center py-16">
              <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
          </div>
      </div>
    </div>

    <!-- PDF Preview Dialog -->
    <Dialog
      v-model:visible="pdfDialogVisible"
      header="PDF Preview"
      modal
      :style="{ width: '90vw', maxWidth: '900px' }"
      :closable="true"
    >
      <div class="flex flex-col gap-4">
        <div v-if="pdfPreviewUrl" class="w-full" style="height: 70vh;">
          <iframe :src="pdfPreviewUrl" class="w-full h-full rounded border border-surface-200" />
        </div>
        <div v-else class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" outlined @click="closePdfPreview" />
        <Button label="Download PDF" icon="pi pi-download" @click="downloadPdf" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import loader from "@monaco-editor/loader";
import type * as Monaco from "monaco-editor";
import Button from "primevue/button";
import Select from "primevue/select";
import Dialog from "primevue/dialog";
import { useTemplateStore } from "../stores/templateStore";
import { compile } from "../compiler/handlebarsCompiler";
import type { DocTemplate } from "../types/blocks";
import { exportToPDF, renderToPdfBlob } from "../export/pdfExport";
import "../assets/styles/document.css";

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();

const lockedToTemplate = computed(() => !!route.query.template);

function goBack() {
  if (lockedToTemplate.value && selectedTemplateId.value) {
    router.push(`/builder/${selectedTemplateId.value}`);
  } else {
    router.push("/");
  }
}

// ── Resizable split ──────────────────────────────────────────────────────────
const leftWidth = ref(480);
let dragging = false;
let dragStartX = 0;
let dragStartWidth = 0;

function startDrag(e: MouseEvent) {
  dragging = true;
  dragStartX = e.clientX;
  dragStartWidth = leftWidth.value;
}

function onDrag(e: MouseEvent) {
  if (!dragging) return;
  const delta = e.clientX - dragStartX;
  leftWidth.value = Math.max(200, Math.min(dragStartWidth + delta, window.innerWidth - 300));
}

function stopDrag() {
  dragging = false;
}

// ── Monaco ───────────────────────────────────────────────────────────────────
const monacoContainer = ref<HTMLElement | null>(null);
const previewContainer = ref<HTMLElement | null>(null);
const jsonData = ref<string>("{}");
const selectedTemplateId = ref<string | null>(null);
const previewHtml = ref<string>("");
const parseError = ref<string | null>(null);

// ── Format toggle (JSON / XML) ────────────────────────────────────────────────
type EditorFormat = "json" | "xml";
const editorFormat = ref<EditorFormat>("json");
const formatError = ref<string | null>(null);

let monacoInstance: typeof Monaco | null = null;
let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 400;

// ── XML ↔ JSON converters ─────────────────────────────────────────────────────

function jsonToXml(obj: unknown, tagName = "root", indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return `${pad}<${tagName}/>`;
  if (Array.isArray(obj)) {
    return obj.map((item) => jsonToXml(item, tagName, indent)).join("\n");
  }
  if (typeof obj === "object") {
    const children = Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => {
        if (Array.isArray(v)) {
          return v.map((item) => jsonToXml(item, k, indent + 1)).join("\n");
        }
        return jsonToXml(v, k, indent + 1);
      })
      .join("\n");
    return `${pad}<${tagName}>\n${children}\n${pad}</${tagName}>`;
  }
  const escaped = String(obj)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `${pad}<${tagName}>${escaped}</${tagName}>`;
}

function xmlNodeToJson(node: Element): unknown {
  const children = Array.from(node.children);
  if (children.length === 0) {
    const text = node.textContent ?? "";
    // Coerce numbers and booleans
    if (text === "true") return true;
    if (text === "false") return false;
    const num = Number(text);
    if (text !== "" && !isNaN(num)) return num;
    return text;
  }

  // Group sibling elements with the same tag as arrays
  const result: Record<string, unknown> = {};
  const tagCounts: Record<string, number> = {};
  for (const child of children) {
    tagCounts[child.tagName] = (tagCounts[child.tagName] ?? 0) + 1;
  }

  for (const child of children) {
    const key = child.tagName;
    const val = xmlNodeToJson(child);
    if (tagCounts[key] > 1) {
      if (!Array.isArray(result[key])) result[key] = [];
      (result[key] as unknown[]).push(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function xmlToJson(xml: string): { data: Record<string, unknown> | null; error: string | null } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const parseErr = doc.querySelector("parsererror");
  if (parseErr) {
    return { data: null, error: parseErr.textContent?.split("\n")[0] ?? "Invalid XML" };
  }
  const root = doc.documentElement;
  const parsed = xmlNodeToJson(root);
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    return { data: parsed as Record<string, unknown>, error: null };
  }
  return { data: { [root.tagName]: parsed }, error: null };
}

function setFormat(fmt: EditorFormat) {
  if (fmt === editorFormat.value) return;
  formatError.value = null;

  const currentText = editor?.getValue() ?? jsonData.value;

  if (fmt === "xml") {
    // JSON → XML
    try {
      const parsed = JSON.parse(currentText) as Record<string, unknown>;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` + jsonToXml(parsed, "root");
      editorFormat.value = "xml";
      setEditorLanguage("xml");
      editor?.setValue(xml);
      jsonData.value = currentText; // keep JSON data in sync
    } catch (e) {
      formatError.value = `Cannot convert to XML: ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    // XML → JSON
    const { data, error } = xmlToJson(currentText);
    if (error || !data) {
      formatError.value = `Cannot convert to JSON: ${error ?? "Unknown error"}`;
      return;
    }
    const jsonStr = JSON.stringify(data, null, 2);
    editorFormat.value = "json";
    setEditorLanguage("json");
    editor?.setValue(jsonStr);
    jsonData.value = jsonStr;
  }
}

function setEditorLanguage(lang: string) {
  if (!editor || !monacoInstance) return;
  const model = editor.getModel();
  if (model) monacoInstance.editor.setModelLanguage(model, lang);
}

async function initMonaco() {
  const monaco = await loader.init();
  monacoInstance = monaco;
  if (!monacoContainer.value) return;
  const instance = monaco.editor.create(monacoContainer.value, {
    value: jsonData.value,
    language: "json",
    theme: "vs",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    scrollBeyondLastLine: false,
  });
  editor = instance;
  instance.onDidChangeModelContent(() => {
    const val = instance.getValue();
    if (editorFormat.value === "json") {
      jsonData.value = val;
    } else {
      // XML mode: convert to JSON for compilation
      const { data, error } = xmlToJson(val);
      if (data) {
        jsonData.value = JSON.stringify(data, null, 2);
        formatError.value = null;
      } else {
        formatError.value = error;
      }
    }
  });
}

function onTemplateChange() {
  const template = templateStore.templates.find((t) => t.id === selectedTemplateId.value);
  const formatted = template?.sampleData ? JSON.stringify(template.sampleData, null, 2) : "{}";
  jsonData.value = formatted;
  // Always reset to JSON format when loading a template
  editorFormat.value = "json";
  formatError.value = null;
  setEditorLanguage("json");
  editor?.setValue(formatted);
}

const selectedTemplate = ref<DocTemplate | null>(null);

watch(
  () => selectedTemplateId.value,
  (id) => {
    if (!id) { selectedTemplate.value = null; return; }
    templateStore.getById(id).then((t) => { selectedTemplate.value = t ?? null; });
  },
  { immediate: true }
);

watch(
  () => selectedTemplate.value,
  (template) => {
    if (template?.sampleData) {
      const formatted = JSON.stringify(template.sampleData, null, 2);
      jsonData.value = formatted;
      editorFormat.value = "json";
      formatError.value = null;
      setEditorLanguage("json");
      editor?.setValue(formatted);
    }
  },
  { immediate: true }
);

function runCompile() {
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  debounceTimer = setTimeout(() => { debounceTimer = null; doCompile(); }, DEBOUNCE_MS);
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

// ── Paginated preview ────────────────────────────────────────────────────────
// 1mm = 96/25.4 px ≈ 3.7795px → 297mm ≈ 1122px at 96dpi
const A4_HEIGHT_PX = Math.round(297 * (96 / 25.4)); // ~1122px

const pageCount = ref(1);
const cssUrl = new URL("../assets/styles/document.css", import.meta.url).href;

function buildPageSrcdoc(offsetPx: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="${cssUrl}"/>
<style>
  html, body { margin:0; padding:0; overflow:hidden; background:white; width:210mm; }
  .doc-preview-page {
    width:210mm; min-height:unset; margin:0; padding:20mm;
    transform:translateY(-${offsetPx}px);
    transform-origin:top left;
  }
</style>
</head>
<body>
<div class="doc-preview-page" id="pg">${previewHtml.value}</div>
<script>
  // After load, report scroll height so parent can compute page count
  window.addEventListener('load', () => {
    const h = document.getElementById('pg').scrollHeight;
    parent.postMessage({ type: 'doc-height', height: h }, '*');
  });
<\/script>
</body>
</html>`;
}

const previewPages = computed<string[]>(() => {
  if (!previewHtml.value) return [];
  const pages: string[] = [];
  for (let i = 0; i < pageCount.value; i++) {
    pages.push(buildPageSrcdoc(i * A4_HEIGHT_PX));
  }
  return pages;
});

// Listen for height message from the first iframe to compute real page count
function onIframeMessage(e: MessageEvent) {
  if (e.data?.type === "doc-height" && typeof e.data.height === "number") {
    const computed = Math.max(1, Math.ceil(e.data.height / A4_HEIGHT_PX));
    if (computed !== pageCount.value) pageCount.value = computed;
  }
}

// Reset page count when HTML changes so we re-measure
watch(() => previewHtml.value, () => { pageCount.value = 1; });

// ── PDF Preview ──────────────────────────────────────────────────────────────
const pdfDialogVisible = ref(false);
const pdfPreviewUrl = ref<string | null>(null);
const generatingPdf = ref(false);
let pdfBlobUrl: string | null = null;

async function openPdfPreview() {
  const el = previewContainer.value;
  if (!el) return;
  generatingPdf.value = true;
  pdfDialogVisible.value = true;
  pdfPreviewUrl.value = null;
  try {
    const url = await generatePdfBlobUrl(el);
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    pdfBlobUrl = url;
    pdfPreviewUrl.value = url;
  } finally {
    generatingPdf.value = false;
  }
}

function closePdfPreview() {
  pdfDialogVisible.value = false;
}

async function downloadPdf() {
  const el = previewContainer.value;
  if (!el) return;
  await exportToPDF(el, `${selectedTemplate.value?.name ?? "document"}.pdf`);
}

async function generatePdfBlobUrl(el: HTMLElement): Promise<string> {
  const blob = await renderToPdfBlob(el);
  return URL.createObjectURL(blob);
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener("message", onIframeMessage);
  await templateStore.loadAll();
  const queryTemplateId = route.query.template as string | undefined;
  if (queryTemplateId && templateStore.templates.some((t) => t.id === queryTemplateId)) {
    selectedTemplateId.value = queryTemplateId;
  } else if (templateStore.templates.length > 0 && !selectedTemplateId.value) {
    selectedTemplateId.value = templateStore.templates[0].id;
  }
  await initMonaco();
  onTemplateChange();
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onIframeMessage);
  if (debounceTimer) clearTimeout(debounceTimer);
  editor?.dispose();
  editor = null;
  if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); pdfBlobUrl = null; }
});
</script>

<style scoped>
.resize-handle:active {
  background-color: var(--p-primary-color);
}
</style>
