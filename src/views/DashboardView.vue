<template>
  <div class="dashboard p-4 md:p-6">
    <!-- Top bar -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold m-0">Doc Templates</h1>
      <Button label="New Template" icon="pi pi-plus" @click="openNewDialog" />
    </div>

    <!-- Filter bar -->
    <div class="mb-6">
      <SelectButton
        v-model="filterType"
        :options="filterOptions"
        option-value="value"
        option-label="label"
        allow-empty
      />
    </div>

    <!-- Loading state -->
    <div v-if="templateStore.loading" class="flex justify-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>

    <!-- Template cards grid -->
    <div
      v-else-if="filteredTemplates.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <Card v-for="t in filteredTemplates" :key="t.id" class="flex flex-col">
        <template #title>
          <span class="font-semibold truncate block" :title="t.name">{{
            t.name
          }}</span>
        </template>
        <template #subtitle>
          <Tag :value="formatType(t.type)" :severity="typeSeverity(t.type)" />
        </template>
        <template #content>
          <p
            v-if="t.description"
            class="text-surface-600 dark:text-surface-400 text-sm line-clamp-2 mb-3"
          >
            {{ t.description }}
          </p>
          <p class="text-surface-500 dark:text-surface-500 text-xs m-0">
            Updated {{ formatDate(t.updatedAt) }}
          </p>
        </template>
        <template #footer>
          <div class="flex gap-2 flex-wrap">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              size="small"
              severity="secondary"
              @click="editTemplate(t.id)"
            />
            <Button
              label="Duplicate"
              icon="pi pi-copy"
              size="small"
              severity="secondary"
              @click="duplicateTemplate(t.id)"
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              size="small"
              severity="danger"
              outlined
              @click="confirmDelete(t)"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <i class="pi pi-folder-open text-6xl text-surface-400 mb-4"></i>
      <p class="text-surface-600 dark:text-surface-400 text-lg m-0">
        No templates match your filter.
      </p>
      <p class="text-surface-500 dark:text-surface-500 text-sm mt-2">
        Try changing the filter or create a new template.
      </p>
    </div>

    <!-- New Template Dialog -->
    <Dialog
      v-model:visible="newDialogVisible"
      header="New Template"
      modal
      :style="{ width: '28rem' }"
      :closable="true"
      @hide="resetNewForm"
    >
      <form class="flex flex-col gap-4" @submit.prevent="submitNewTemplate">
        <div class="flex flex-col gap-2">
          <label for="new-name">Name</label>
          <InputText
            id="new-name"
            v-model="newForm.name"
            placeholder="Template name"
            required
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="new-type">Type</label>
          <Select
            id="new-type"
            v-model="newForm.type"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select type"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="new-desc">Description</label>
          <InputText
            id="new-desc"
            v-model="newForm.description"
            placeholder="Optional description"
            class="w-full"
          />
        </div>
      </form>
      <template #footer>
        <Button label="Cancel" severity="secondary" outlined @click="newDialogVisible = false" />
        <Button label="Create" icon="pi pi-check" @click="submitNewTemplate" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import Tag from "primevue/tag";
import { useTemplateStore } from "../stores/templateStore";
import type { DocTemplate } from "../types/blocks";

const router = useRouter();
const templateStore = useTemplateStore();
const confirm = useConfirm();
const toast = useToast();

const filterType = ref<string | null>(null);
const newDialogVisible = ref(false);
const newForm = ref({
  name: "",
  type: "invoice" as DocTemplate["type"],
  description: "",
});

const filterOptions = [
  { value: null, label: "All" },
  { value: "invoice", label: "Invoice" },
  { value: "confirmation", label: "Confirmation" },
  { value: "voucher", label: "Voucher" },
  { value: "statement", label: "Statement" },
  { value: "other", label: "Other" },
];

const typeOptions = [
  { value: "invoice", label: "Invoice" },
  { value: "confirmation", label: "Confirmation" },
  { value: "voucher", label: "Voucher" },
  { value: "statement", label: "Statement" },
  { value: "other", label: "Other" },
];

const filteredTemplates = computed(() => {
  const list = templateStore.templates;
  if (filterType.value == null) return list;
  return list.filter((t) => t.type === filterType.value);
});

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function typeSeverity(type: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
  const map: Record<string, "success" | "info" | "warn" | "danger" | "secondary" | "contrast"> = {
    invoice: "info",
    confirmation: "success",
    voucher: "warn",
    statement: "secondary",
    other: "contrast",
  };
  return map[type] ?? "secondary";
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openNewDialog() {
  resetNewForm();
  newDialogVisible.value = true;
}

function resetNewForm() {
  newForm.value = {
    name: "",
    type: "invoice",
    description: "",
  };
}

async function submitNewTemplate() {
  if (!newForm.value.name.trim()) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Name is required",
      life: 3000,
    });
    return;
  }
  try {
    const created = await templateStore.create({
      name: newForm.value.name.trim(),
      type: newForm.value.type,
      description: newForm.value.description.trim() || undefined,
    });
    newDialogVisible.value = false;
    toast.add({
      severity: "success",
      summary: "Created",
      detail: `Template "${created.name}" created`,
      life: 3000,
    });
    router.push(`/builder/${created.id}`);
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to create template",
      life: 3000,
    });
  }
}

function editTemplate(id: string) {
  router.push(`/builder/${id}`);
}

async function duplicateTemplate(id: string) {
  try {
    const dup = await templateStore.duplicate(id);
    if (dup) {
      toast.add({
        severity: "success",
        summary: "Duplicated",
        detail: `Template "${dup.name}" created`,
        life: 3000,
      });
    }
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to duplicate template",
      life: 3000,
    });
  }
}

function confirmDelete(t: DocTemplate) {
  confirm.require({
    message: `Delete template "${t.name}"? This cannot be undone.`,
    header: "Delete Template",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Delete", severity: "danger" },
    accept: async () => {
      try {
        await templateStore.remove(t.id);
        toast.add({
          severity: "success",
          summary: "Deleted",
          detail: `Template "${t.name}" removed`,
          life: 3000,
        });
      } catch {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete template",
          life: 3000,
        });
      }
    },
  });
}

onMounted(() => {
  templateStore.loadAll();
});
</script>
