import type {Detail, Overrides, Roll, Slot, Subtables, Table} from "../types/rollTypes.ts";
import {makeChildRng} from "./rng.ts";
import {resolveColumn, subtableFor, columnOptions, columnIsTagged, type TaggedOption} from "./data/columnSources.ts";

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

const AFFINITY_BOOST = 2; // extra weight per affinity tag matched in the context

function weightedPick(seed: string, values: string[], weights: number[], label: string): string {
    const rng = makeChildRng(seed, label);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng.int(total);
    for (let i = 0; i < values.length; i++) {
        if (r < weights[i]) return values[i];
        r -= weights[i];
    }
    return values[values.length - 1];
}

function weightedPickWithCount(seed: string, values: string[], weights: number[], slotId: string, count: number): string {
    if (count === 0) return weightedPick(seed, values, weights, slotId);
    const previous = weightedPickWithCount(seed, values, weights, slotId, count - 1);
    for (let t = 0; t < MAX_REROLL_TRIES; t++) {
        const candidate = weightedPick(seed, values, weights, `${slotId}#${count}.${t}`);
        if (candidate !== previous) return candidate;
    }
    return previous;
}

// Choose a value from tagged options, filtered and weighted by context.
export function selectTagged(
    seed: string,
    options: TaggedOption[],
    context: Set<string> | undefined,
    slotId: string,
    overrides: Overrides = {},
): Slot {
    const override = overrides[slotId];
    if (override?.editValue !== undefined) return { id: slotId, value: override.editValue };

    const pool = context
        ? options.filter(o => (o.requires ?? []).every(t => context.has(t)))
        : options;
    if (pool.length === 0) return { id: slotId, value: "" };

    const values = pool.map(o => o.value);
    const weights = pool.map(o =>
        (o.weight ?? 1) + (context ? AFFINITY_BOOST * (o.affinity ?? []).filter(t => context.has(t)).length : 0));

    const count = override?.rerollCount ?? 0;
    return { id: slotId, value: weightedPickWithCount(seed, values, weights, slotId, count) };
}

// Dressing details are tagged options keyed by `text`.
export function selectDetail(
    seed: string,
    details: Detail[],
    context: Set<string>,
    slotId: string,
    overrides: Overrides = {},
): Slot {
    return selectTagged(
        seed,
        details.map(d => ({ value: d.text, requires: d.requires, affinity: d.affinity, weight: d.weight })),
        context, slotId, overrides,
    );
}

// Roll a value from a list using an explicit reroll count (not read from overrides).
// Used to cascade one reroll across multiple levels, e.g. family then species.
export function rollValueWithCount(
    seed: string,
    options: string[],
    label: string,
    count: number,
): string {
    if (options.length === 0) return "";
    return rolledFromList(seed, options, label, count);
}

// Roll one value per column. Each column is rolled independent of its own
// resolved list (literal values or a ref), and gets a stable slot id
// `${baseId}.col.${i}`.
export function rollTable(
    seed: string,
    table: Table,
    baseId: string,
    overrides: Overrides = {},
    subtables?: Subtables,
    context?: Set<string>,
): Roll {
    const columns = table.columns.map(c => c.label);
    const cells = table.columns.map((c, i) => {
        const slotId = `${baseId}.col.${i}`;
        return context && columnIsTagged(c.values)
            ? selectTagged(seed, columnOptions(c.values), context, slotId, overrides)
            : rollOne(seed, resolveColumn(c.values), slotId, overrides);
    });

    if (!subtables) return { columns, cells };

    const subrolls = table.columns.map((c, i) => {
        const id = subtableFor(c.values, cells[i].value);
        const child = id ? subtables[id] : undefined;
        return child
            ? rollTable(seed, child, `${baseId}.col.${i}.sub`, overrides, subtables)
            : null;
    });
    if (subrolls.every(s => s === null)) return { columns, cells };
    return { columns, cells, subrolls };
}