import { describe, it, expect } from "vitest";
import { dressing } from "./dressing.ts";

// The eligible-pool floor. For now nothing filters the list, so the whole
// table is the eligible pool. When we add `requires` tags, this same floor applies per realistic context.
const DETAIL_FLOOR = 20;

describe("dressing base tier", () => {
    it("stays at or above the eligible-pool floor", () => {
        expect(dressing.length).toBeGreaterThanOrEqual(DETAIL_FLOOR);
    });

    it("has no duplicate entries", () => {
        expect(new Set(dressing).size).toBe(dressing.length);
    });
});