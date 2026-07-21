import type {Overrides, Roll, Slot, Table} from "../types/rollTypes.ts";
import {makeChildRng} from "./rng.ts";
import {resolveColumn} from "./data/columnSources.ts";

const MAX_REROLL_TRIES = 50;

function rolledFromList(
    seed: string,
    options: string[],
    slotId: string,
    count: number,
): string {
    const label = count > 0 ? `${slotId}#${count}` : slotId;
    const rng = makeChildRng(seed, label);

    if (count === 0) {
        return options[rng.int(options.length)];
    }

    const previous = rolledFromList(seed, options, slotId, count - 1);
    for (let i = 0; i < MAX_REROLL_TRIES; i++) {
        const candidate = options[rng.int(options.length)];
        if (candidate !== previous) return candidate;
    }
    return previous; // give up: e.g. the list has only one distinct value
}

// Roll a single value from a flat list, honoring an edit or reroll override.
export function rollOne(
    seed: string,
    options: string[],
    slotId: string,
    overrides: Overrides = {},
): Slot {
    const override = overrides[slotId];
    if (override?.editValue !== undefined) {
        return { id: slotId, value: override.editValue };
    }
    if (options.length === 0) {
        return { id: slotId, value: "" }; // nothing to roll (e.g. an unresolved ref)
    }
    const count = override?.rerollCount ?? 0;
    return { id: slotId, value: rolledFromList(seed, options, slotId, count) };
}

// Roll one value per column. Each column is rolled independent of its own
// resolved list (literal values or a ref), and gets a stable slot id
// `${baseId}.col.${i}`.
export function rollTable(
    seed: string,
    table: Table,
    baseId: string,
    overrides: Overrides = {},
): Roll {
    return {
        columns: table.columns.map(c => c.label),
        cells: table.columns.map((c, i) =>
            rollOne(seed, resolveColumn(c.values), `${baseId}.col.${i}`, overrides)),
    };
}