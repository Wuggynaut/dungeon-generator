import { describe, it, expect } from "vitest";
import { generate } from "./generate.ts";
import { monstersByGroup, groupNames } from "./data/monsters.ts";

describe("bestiary rosters", () => {
    it("every family resolves to a non-empty roster", () => {
        for (const family of groupNames) {
            expect(monstersByGroup[family].length).toBeGreaterThan(0);
        }
    });

    it("monster rooms draw a species from a real family", () => {
        const d = generate("test-seed");
        for (const room of d.rooms.filter(r => r.type === "Monster")) {
            expect(room.family).toBeDefined();
            expect(monstersByGroup[room.family!]).toBeDefined();
            expect(monstersByGroup[room.family!]).toContain(room.monster!.value);
        }
    });
});