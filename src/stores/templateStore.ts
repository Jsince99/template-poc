import { defineStore } from "pinia";
import { ref } from "vue";
import { db } from "../db";
import type { DocTemplate } from "../types/blocks";
import { starterTemplates } from "../data/starterTemplates";
import { nanoid } from "nanoid";

export const useTemplateStore = defineStore("templates", () => {
  const templates = ref<DocTemplate[]>([]);
  const loading = ref(false);

  async function seedIfEmpty() {
    const count = await db.templates.count();
    if (count === 0) {
      await db.templates.bulkAdd(starterTemplates as DocTemplate[]);
    }
  }

  async function loadAll() {
    loading.value = true;
    await seedIfEmpty();
    templates.value = (await db.templates
      .orderBy("updatedAt")
      .reverse()
      .toArray()) as DocTemplate[];
    loading.value = false;
  }

  async function getById(id: string): Promise<DocTemplate | undefined> {
    return db.templates.get(id) as Promise<DocTemplate | undefined>;
  }

  async function create(
    partial: Pick<DocTemplate, "name" | "type" | "description">,
  ): Promise<DocTemplate> {
    const now = Date.now();
    const template: DocTemplate = {
      id: nanoid(),
      name: partial.name,
      type: partial.type,
      description: partial.description,
      blocks: [],
      sampleData: {},
      createdAt: now,
      updatedAt: now,
    };
    await db.templates.add(template as DocTemplate);
    await loadAll();
    return template;
  }

  async function update(id: string, changes: Partial<DocTemplate>) {
    await db.templates.update(id, { ...changes, updatedAt: Date.now() });
    await loadAll();
  }

  async function remove(id: string) {
    await db.templates.delete(id);
    await loadAll();
  }

  async function duplicate(id: string): Promise<DocTemplate | undefined> {
    const original = await getById(id);
    if (!original) return;
    const now = Date.now();
    const cloned = JSON.parse(JSON.stringify(original));
    const copy = {
      ...cloned,
      id: nanoid(),
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    } as DocTemplate;
    await db.templates.add(copy as DocTemplate);
    await loadAll();
    return copy;
  }

  return {
    templates,
    loading,
    loadAll,
    getById,
    create,
    update,
    remove,
    duplicate,
  };
});
