import { describe, it, expect } from "vitest";
import { generate, dominantFactionIndex } from "./generate.ts";
import {defaultConfig} from "./config.ts";
import { monstersByGroup } from "./data/monsters.ts";

describe("generate", () => {
    it("is deterministic: same seed yields an identical dungeon", () => {
        expect(generate("test-seed")).toEqual(generate("test-seed"));
    });

    it("produces different output for different seeds", () => {
        expect(generate("seed-a")).not.toEqual(generate("seed-b"));
    });

    it("defaults to 2 factions and respects a custom count", () => {
        expect(generate("test-seed").factions).toHaveLength(2);
        expect(generate("test-seed", { ...defaultConfig, factionCount: 4 }).factions).toHaveLength(4);
    });

    it("stores the seed and gives every value a path-shaped slot id", () => {
        const d = generate("test-seed");
        expect(d.seed).toBe("test-seed");
        expect(d.history.purpose.left.id).toBe("history.purpose.left");
        expect(d.denizens.standoutNPC.right.id).toBe("denizens.standoutNPC.right");
        expect(d.factions[0].agenda.left.id).toBe("faction.0.agenda.left");
    });

    it("gives each faction a species drawn from its family roster", () => {
        const d = generate("test-seed");
        d.factions.forEach((f, i) => {
            expect(f.species.id).toBe(`faction.${i}.species`);
            expect(monstersByGroup[f.group.value]).toContain(f.species.value);
        });
    });

    it("rolls faction strength within 1..3", () => {
        for (const f of generate("test-seed").factions) {
            expect(f.strength).toBeGreaterThanOrEqual(1);
            expect(f.strength).toBeLessThanOrEqual(3);
        }
    });

    it("dominantFactionIndex returns the strongest faction, or null when empty", () => {
        expect(dominantFactionIndex([])).toBeNull();
        const factions = [{ strength: 1 }, { strength: 3 }, { strength: 2 }] as never;
        expect(dominantFactionIndex(factions)).toBe(1);
    });

    it("gives every room exactly one detail with a stable slot id", () => {
        const d = generate("test-seed");
        for (const room of d.rooms) {
            expect(room.details).toHaveLength(1);
            expect(room.details![0].id).toBe(`room.${room.id}.detail.0`);
        }
    });

    it("rerolling one room's detail leaves other slots untouched", () => {
        const base = generate("test-seed");
        const after = generate("test-seed", defaultConfig, {
            "room.1.detail.0": { rerollCount: 1 },
        });

        const room1Before = base.rooms.find(r => r.id === 1)!;
        const room1After = after.rooms.find(r => r.id === 1)!;
        const room2Before = base.rooms.find(r => r.id === 2)!;
        const room2After = after.rooms.find(r => r.id === 2)!;

        // the targeted detail changed
        expect(room1After.details![0].value).not.toBe(room1Before.details![0].value);
        // room 1's main roll did not
        expect(room1After.roll).toEqual(room1Before.roll);
        // another room's detail did not
        expect(room2After.details![0].value).toBe(room2Before.details![0].value);
    });

    it("matches the pinned snapshot", () => {
        expect(generate("test-seed")).toMatchSnapshot();
    });
});