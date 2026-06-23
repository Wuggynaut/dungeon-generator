import { describe, it, expect } from "vitest";
import { generate } from "./generate.ts";
import { serializeMarkdown } from "./serialize.ts";

describe("serializeMarkdown", () => {
    it("includes the seed, every section, and each room's values", () => {
        const dungeon = generate("test-seed");
        const md = serializeMarkdown(dungeon);

        expect(md).toContain("# Dungeon: test-seed");
        expect(md).toContain("## History");
        expect(md).toContain("## Denizens");
        expect(md).toContain("## Factions");
        expect(md).toContain("## Rooms");
        for (const room of dungeon.rooms) {
            expect(md).toContain(room.roll.left.value);
        }
    });

    it("renders GM notes as blockquotes", () => {
        const md = serializeMarkdown(generate("test-seed"), { "notes.history": "Built on a ley line." });
        expect(md).toContain("> Built on a ley line.");
    });

    it("is deterministic for the same seed", () => {
        expect(serializeMarkdown(generate("x"))).toBe(serializeMarkdown(generate("x")));
    });

    it("matches the pinned snapshot", () => {
        expect(serializeMarkdown(generate("test-seed"))).toMatchSnapshot();
    });
});