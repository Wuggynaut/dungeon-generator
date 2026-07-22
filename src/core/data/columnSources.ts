import type {ColumnValue, ColumnValues} from "../../types/rollTypes.ts";
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
