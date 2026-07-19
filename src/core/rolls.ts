import type {Overrides, PairedTable, Roll, Slot} from "../types/rollTypes.ts";
import {makeChildRng} from "./rng.ts";

const MAX_REROLL_TRIES = 50;

function rolledValue(
    seed: string,
    table: PairedTable,
    slotId: string,
    column: 0 | 1,
    count: number,
): string {
    const label = count > 0 ? `${slotId}#${count}` : slotId;
    const rng = makeChildRng(seed, label);

    if (count === 0) {
        return table.rows[rng.int(table.rows.length)][column];
    }

    const previous = rolledValue(seed, table, slotId, column, count - 1);

    for (let i = 0; i < MAX_REROLL_TRIES; i++) {
        const candidate = table.rows[rng.int(table.rows.length)][column];
        if (candidate !== previous) return candidate;
    }
    return previous; // give up: e.g. the column has only one distinct value
}

function valueFor(
    seed: string,
    table: PairedTable,
    slotId: string,
    column: 0 | 1,
    overrides: Overrides,
): string {
    const override = overrides[slotId];

    if (override?.editValue !== undefined) {
        return override.editValue;
    }

    const count = override?.rerollCount ?? 0;
    return rolledValue(seed, table, slotId, column, count);
}

export function rollSlots(
    seed: string,
    table: PairedTable,
    baseId: string,
    overrides: Overrides = {},
): Roll {
    const leftId = `${baseId}.left`;
    const rightId = `${baseId}.right`;
    return {
        columns: table.columns,
        left:  { id: leftId,  value: valueFor(seed, table, leftId, 0, overrides) },
        right: { id: rightId, value: valueFor(seed, table, rightId, 1, overrides) },
    };
}

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
    return previous;
}

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
        return { id: slotId, value: "" }; // nothing to roll (e.g. a custom group with no roster)
    }
    const count = override?.rerollCount ?? 0;
    return { id: slotId, value: rolledFromList(seed, options, slotId, count) };
}
