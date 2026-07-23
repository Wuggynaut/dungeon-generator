import { describe, it, expect } from "vitest";
import { rollTable } from "./rolls.ts";
import type { Table } from "../types/rollTypes.ts";

// "Bath" only fits a built dungeon; "Den" fits anywhere.
const lore: Table = {
    columns: [{ label: "Room", values: [{ value: "Bath", requires: ["built"] }, "Den"] }],
};
const sample = (context: Set<string> | undefined) =>
    Array.from({ length: 30 }, (_, c) =>
        rollTable("seed", lore, "x", { "x.col.0": { rerollCount: c } }, undefined, context).cells[0].value);

describe("context-conditioned column values", () => {
    it("suppresses a built-only value in a natural context", () => {
        expect(sample(new Set(["natural"])).every(v => v !== "Bath")).toBe(true);
    });

    it("admits it in a built context", () => {
        expect(sample(new Set(["built"])).some(v => v === "Bath")).toBe(true);
    });

    it("does not filter when no context is given", () => {
        expect(sample(undefined).some(v => v === "Bath")).toBe(true);
    });

    it("falls back to the full list when requires filters everything out", () => {
        const allBuilt: Table = {
            columns: [{ label: "Room", values: [{ value: "Bath", requires: ["built"] }, { value: "Forge", requires: ["built"] }] }],
        };
        const value = rollTable("seed", allBuilt, "z", {}, undefined, new Set(["natural"])).cells[0].value;
        expect(value === "Bath" || value === "Forge").toBe(true); // not ""
    });

    it("leaves an untagged column unchanged with or without context", () => {
        const plain: Table = { columns: [{ label: "X", values: ["a", "b", "c"] }] };
        const withCtx = rollTable("seed", plain, "y", {}, undefined, new Set(["built"]));
        const without = rollTable("seed", plain, "y", {});
        expect(withCtx.cells[0].value).toBe(without.cells[0].value);
    });
});