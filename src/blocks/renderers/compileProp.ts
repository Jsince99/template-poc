import Handlebars from "handlebars";

// Register helpers for conditional expressions
Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);

/**
 * Compiles a Handlebars template string with the given data context.
 * Pass null as data to return the raw template string (builder preview mode).
 */
export function compileProp(
  prop: string,
  data: Record<string, unknown> | null
): string {
  if (!prop || typeof prop !== "string") return "";
  if (data === null) return prop;
  try {
    const template = Handlebars.compile(prop, { noEscape: true });
    const result = template(data);
    return result == null ? "" : String(result);
  } catch {
    return prop;
  }
}
