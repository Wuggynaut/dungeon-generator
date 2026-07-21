import type { ColumnValues } from "../../types/rollTypes.ts";
import { groupNames } from "./monsters.ts";

// Named lists that a table column can reference instead of storing its own copy.
const registry: Record<string, () => string[]> = {
    "bestiary.families": () => groupNames,
};

export function refExists(ref: string): boolean {
    return ref in registry;
}

// A column's values: the literal list, or the resolved contents of its ref.
export function resolveColumn(values: ColumnValues): string[] {
    if (Array.isArray(values)) return values;
    const source = registry[values.ref];
    return source ? source() : [];
}