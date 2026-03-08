<script setup lang="ts">
import { computed } from "vue";
import type { Block } from "../../types/blocks";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import ColorPickerField from "../../components/ColorPickerField.vue";
import DividerEditor from "./DividerEditor.vue";
import SectionHeadingEditor from "./SectionHeadingEditor.vue";
import TextBlockEditor from "./TextBlockEditor.vue";
import DocumentHeaderEditor from "./DocumentHeaderEditor.vue";
import DocumentFooterEditor from "./DocumentFooterEditor.vue";
import AddressBlockEditor from "./AddressBlockEditor.vue";
import AddressPairEditor from "./AddressPairEditor.vue";
import KeyValueGridEditor from "./KeyValueGridEditor.vue";
import DataTableEditor from "./DataTableEditor.vue";
import SummaryTableEditor from "./SummaryTableEditor.vue";
import BankDetailsEditor from "./BankDetailsEditor.vue";
import SignatureBlockEditor from "./SignatureBlockEditor.vue";
import TermsConditionsEditor from "./TermsConditionsEditor.vue";
import ConditionalEditor from "./ConditionalEditor.vue";
import LoopEditor from "./LoopEditor.vue";

const props = defineProps<{
  modelValue: Block;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Block): void;
}>();

const block = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const marginOptions = [
  { label: "None", value: "none" },
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

const editorMap: Record<string, object> = {
  divider: DividerEditor,
  "section-heading": SectionHeadingEditor,
  "text-block": TextBlockEditor,
  "document-header": DocumentHeaderEditor,
  "document-footer": DocumentFooterEditor,
  "address-block": AddressBlockEditor,
  "address-pair": AddressPairEditor,
  "key-value-grid": KeyValueGridEditor,
  "data-table": DataTableEditor,
  "summary-table": SummaryTableEditor,
  "bank-details": BankDetailsEditor,
  "signature-block": SignatureBlockEditor,
  "terms-conditions": TermsConditionsEditor,
  conditional: ConditionalEditor,
  loop: LoopEditor,
};

const editorComponent = computed(() => editorMap[props.modelValue.type] ?? null);

function updateStyle<K extends keyof NonNullable<Block["style"]>>(
  key: K,
  value: NonNullable<Block["style"]>[K]
) {
  const next = { ...block.value };
  next.style = { ...next.style, [key]: value };
  emit("update:modelValue", next);
}

function updateVisibilityCondition(value: string) {
  const next = { ...block.value, visibilityCondition: value || undefined };
  emit("update:modelValue", next);
}

function updateCssClass(value: string) {
  const next = { ...block.value, cssClass: value || undefined };
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="block-editor flex flex-col gap-4">
    <component
      v-if="editorComponent"
      :is="editorComponent"
      v-model="block"
    />
    <div class="common-config flex flex-col gap-3 pt-3 border-t border-surface-200 dark:border-surface-700">
      <h4 class="text-sm font-semibold text-surface-700 dark:text-surface-300">
        Common
      </h4>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
          Margin Top
        </label>
        <Select
          :model-value="block.style?.marginTop ?? 'md'"
          :options="marginOptions"
          option-label="label"
          option-value="value"
          placeholder="Margin top"
          class="w-full"
          @update:model-value="updateStyle('marginTop', $event)"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
          Margin Bottom
        </label>
        <Select
          :model-value="block.style?.marginBottom ?? 'md'"
          :options="marginOptions"
          option-label="label"
          option-value="value"
          placeholder="Margin bottom"
          class="w-full"
          @update:model-value="updateStyle('marginBottom', $event)"
        />
      </div>
      <ColorPickerField
        :model-value="block.style?.backgroundColor"
        label="Background Color"
        @update:model-value="updateStyle('backgroundColor', $event)"
      />
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
          Visibility Condition
        </label>
        <InputText
          :model-value="block.visibilityCondition ?? ''"
          placeholder="e.g. {{showSection}}"
          class="w-full"
          @update:model-value="updateVisibilityCondition($event ?? '')"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
          CSS Class
        </label>
        <InputText
          :model-value="block.cssClass ?? ''"
          placeholder="Custom CSS class"
          class="w-full"
          @update:model-value="updateCssClass($event ?? '')"
        />
      </div>
    </div>
  </div>
</template>
