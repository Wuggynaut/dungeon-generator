import type {PairedTable, Roll} from "../types/rollTypes.ts";
import type {Rng} from "./rng.ts";

export function rollPaired(
    rng: Rng,
    table: PairedTable,
): { left: string; right: string } {
    const left = table.rows[rng.int(table.rows.length)][0];
    const right = table.rows[rng.int(table.rows.length)][1];
    return { left, right };
}

export function rollSlots(rng: Rng, table: PairedTable, baseId: string): Roll {
    const { left, right } = rollPaired(rng, table);
    return {
        columns : table.columns,
        left : {id : baseId + ".left", value: left },
        right : {id : baseId + ".right", value: right},
    }
}