import type { ColumnValue, ColumnValues } from "../../types/rollTypes.ts";
import { groupNames } from "./monsters.ts";
import { purposeValues } from "./purposeTags.ts";
import { constructionValues } from "./constructionKind.ts";

// Named lists that a table column can reference instead of storing its own copy.
// A column with `{ ref: "bestiary.families" }` resolves to the live family list
const registry: Record<string, () => string[]> = {
    "bestiary.families": () => groupNames,
    "purpose.uses": () => purposeValues,
    "construction.kinds": () => constructionValues,
};

export function refExists(ref: string): boolean {
    return ref in registry;
}

// A column's values: the literal list, or the resolved contents of its ref.
function valueText(v: ColumnValue): string {
    return typeof v === "string" ? v : v.value;
}

export function resolveColumn(values: ColumnValues): string[] {
    if (Array.isArray(values)) return values.map(valueText);
    const source = registry[values.ref];
    return source ? source() : [];
}

// The subtable a rolled value routes to, if any.
export function subtableFor(values: ColumnValues, value: string): string | undefined {
    if (!Array.isArray(values)) return undefined;
    const found = values.find(v => valueText(v) === value);
    return found && typeof found === "object" ? found.subtable : undefined;
}

export type TaggedOption = { value: string; requires?: string[]; affinity?: string[]; weight?: number };

// A column's values as tagged options (for context-conditioned selection).
export function columnOptions(values: ColumnValues): TaggedOption[] {
    if (!Array.isArray(values)) return resolveColumn(values).map(value => ({ value }));
    return values.map(v => (typeof v === "string"
        ? { value: v }
        : { value: v.value, requires: v.requires, affinity: v.affinity, weight: v.weight }));
}

// Whether any value carries selection tags worth conditioning on.
export function columnIsTagged(values: ColumnValues): boolean {
    return Array.isArray(values) && values.some(v =>
        typeof v === "object" &&
        ((v.requires?.length ?? 0) > 0 || (v.affinity?.length ?? 0) > 0 || v.weight !== undefined));
}