import { describe, it, expect } from "vitest";
import { generate } from "./generate.ts";
import { roomContext } from "./context.ts";
import { kindOf } from "./data/constructionKind.ts";
import { tagsForPurpose } from "./data/purposeTags.ts";
import { familyByName } from "./data/monsters.ts";
import { defaultConfig } from "./config.ts";
import { resolveColumn } from "./data/columnSources.ts";
import { purposeValues } from "./data/purposeTags.ts";
import { constructionValues } from "./data/constructionKind.ts";

describe("tagged columns reference their vocab (single source)", () => {
    it("purpose Original Use resolves to the purpose vocabulary", () => {
        const col = defaultConfig.tables.purpose.columns.find(c => c.label === "Original Use")!;
        expect(resolveColumn(col.values)).toEqual(purposeValues);
    });
    it("construction Composition resolves to the construction vocabulary", () => {
        const col = defaultConfig.tables.construction.columns.find(c => c.label === "Composition")!;
        expect(resolveColumn(col.values)).toEqual(constructionValues);
    });
});

describe("roomContext", () => {
    const d = generate("test-seed");

    it("tags every room with exactly one construction kind", () => {
        const kinds = ["natural", "built", "weird"];
        const expected = kindOf(d.history.construction.cells[1].value);
        for (const room of d.rooms) {
            const ctx = roomContext(d, room);
            expect(kinds.filter(k => ctx.has(k))).toEqual([expected]);
        }
    });

    it("includes the dungeon's purpose tags in every room", () => {
        const tags = tagsForPurpose(d.history.purpose.cells[0].value);
        for (const room of d.rooms) {
            const ctx = roomContext(d, room);
            for (const t of tags) expect(ctx.has(t)).toBe(true);
        }
    });

    it("includes a monster room's own species and family tags", () => {
        const monster = d.rooms.find(r => r.type === "Monster" && r.family);
        expect(monster).toBeDefined();
        const ctx = roomContext(d, monster!);
        const fam = familyByName[monster!.family!];
        for (const t of fam.tags) expect(ctx.has(t)).toBe(true);
        const sp = fam.species.find(s => s.name === monster!.monster!.value);
        if (sp) for (const t of sp.tags) expect(ctx.has(t)).toBe(true);
    });
});