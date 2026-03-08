import Dexie, { type EntityTable } from "dexie";

/** Stored template shape - uses unknown[] for blocks to avoid circular Block type in Dexie */
interface TemplateRecord {
  id: string;
  name: string;
  description?: string;
  type: string;
  blocks: unknown[];
  sampleData?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

const db = new Dexie("DocTemplatesDB") as Dexie & {
  templates: EntityTable<TemplateRecord, "id">;
};

db.version(1).stores({
  templates: "id, name, type, createdAt, updatedAt",
});

export { db };
