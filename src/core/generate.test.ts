import { describe, it, expect } from "vitest";
import { generate } from "./generate.ts";
import {defaultConfig} from "./config.ts";

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

    it("matches the pinned snapshot", () => {
        expect(generate("test-seed")).toMatchSnapshot();
    });
});