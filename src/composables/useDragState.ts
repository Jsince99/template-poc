import { ref } from "vue";
import type { Block } from "../types/blocks";

/** Shared drag state: holds the block being cloned from the palette */
export const pendingClone = ref<Block | null>(null);
