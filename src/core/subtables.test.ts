import { describe, it, expect } from "vitest";
import { rollTable } from "./rolls.ts";
import type { Table, Subtables } from "../types/rollTypes.ts";

const parent: Table = {
    columns: [{ label: "Special", values: [{ value: "Mirror", subtable: "mirror-details" }, "Pool"] }],
};
const mirror: Table = {
    columns: [
        { label: "Frame", values: ["iron", "gilded"] },
        { label: "State", values: ["cracked", "clear"] },
    ],
};
const subs: Subtables = { "mirror-details": mirror };

describe("subtable cascade", () => {
    it("rolls the child named by the value", () => {
        const r = rollTable("seed", parent, "x", { "x.col.0": { editValue: "Mirror" } }, subs);
        expect(r.cells[0].value).toBe("Mirror");
        expect(r.subrolls?.[0]?.columns).toEqual(["Frame", "State"]);
        expect(r.subrolls?.[0]?.cells[0].id).toBe("x.col.0.sub.col.0");
    });

    it("has no subrolls when nothing routes", () => {
        const r = rollTable("seed", parent, "x", { "x.col.0": { editValue: "Pool" } }, subs);
        expect(r.subrolls).toBeUndefined();
    });

    it("is deterministic and reroll-isolated for the child", () => {
        const over = { "x.col.0": { editValue: "Mirror" } };
        const base = rollTable("seed", parent, "x", over, subs);
        expect(rollTable("seed", parent, "x", over, subs)).toEqual(base);

        const childReroll = rollTable("seed", parent, "x",
            { ...over, "x.col.0.sub.col.0": { rerollCount: 1 } }, subs);
        expect(childReroll.subrolls?.[0]?.cells[0].value).not.toBe(base.subrolls?.[0]?.cells[0].value);
        expect(childReroll.subrolls?.[0]?.cells[1].value).toBe(base.subrolls?.[0]?.cells[1].value);
    });

    it("without a subtables arg, behaves exactly as before", () => {
        expect(rollTable("seed", parent, "x").subrolls).toBeUndefined();
    });
});