import Handlebars from "handlebars";

// Register helpers for conditional expressions
Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);

/**
 * Compiles a Handlebars template string with the given data context.
 * Returns the rendered string. Safe for plain strings without {{}}.
 */
export function compileProp(
  prop: string,
  data: Record<string, unknown>
): string {
  if (!prop || typeof prop !== "string") return "";
  try {
    const template = Handlebars.compile(prop, { noEscape: true });
    const result = template(data);
    return result == null ? "" : String(result);
  } catch {
    return prop;
  }
}
