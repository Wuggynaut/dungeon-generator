import { describe, it, expect } from "vitest";
import { generate } from "./generate.ts";
import { dominantFactionIndex } from "./context.ts";
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
        expect(d.history.purpose.cells[0].id).toBe("history.purpose.col.0");
        expect(d.denizens.standoutNPC.cells[1].id).toBe("denizens.standoutNPC.col.1");
        expect(d.factions[0].agenda.cells[0].id).toBe("faction.0.agenda.col.0");
    });

    it("gives each faction a Type (family) that exists in the bestiary", () => {
        const d = generate("test-seed");
        d.factions.forEach((f, i) => {
            expect(f.group.id).toBe(`faction.${i}.group`);
            expect(monstersByGroup[f.group.value]).toBeDefined();
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
        const factions = [{ strength: 1 }, { strength: 3 }, { strength: 2 }] as any;
        expect(dominantFactionIndex(factions)).toBe(1);
    });

    it("cascades a monster room's creature reroll (family, then species)", () => {
        const base = generate("test-seed");
        // A room that can vary: unaligned (family cascades) or a multi-species family.
        const varying = base.rooms.find(r =>
            r.type === "Monster" &&
            (r.occupantFaction === undefined || (monstersByGroup[r.family!]?.length ?? 0) > 1));
        expect(varying, "expected a monster room able to vary").toBeDefined();
        const id = varying!.id;

        const states = new Set<string>();
        for (let c = 0; c <= 4; c++) {
            const room = generate("test-seed", defaultConfig, { [`room.${id}.monster`]: { rerollCount: c } })
                .rooms.find(r => r.id === id)!;
            states.add(`${room.family}:${room.monster?.value}`);
        }
        expect(states.size).toBeGreaterThan(1);
    });

    it("allegiance reroll avoids the previous result", () => {
        const base = generate("test-seed");
        const id = base.rooms.find(r => r.type === "Monster")!.id;
        const before = base.rooms.find(r => r.id === id)!.occupantFaction ?? null;
        const after = generate("test-seed", defaultConfig, { [`room.${id}.occupant`]: { rerollCount: 1 } })
            .rooms.find(r => r.id === id)!.occupantFaction ?? null;
        expect(after).not.toBe(before);
    });

    it("omits room details when resolveDetails is off", () => {
        const d = generate("test-seed", { ...defaultConfig, resolveDetails: false });
        for (const room of d.rooms) expect(room.details).toBeUndefined();
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