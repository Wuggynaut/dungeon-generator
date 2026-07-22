import { describe, it, expect } from "vitest";
import { serializePurposeVocab, serializeConstructionVocab, serializeDressing, serializeBestiary } from "./corpusExport.ts";
import { purposeVocab } from "./data/purposeTags.ts";
import { constructionVocab } from "./data/constructionKind.ts";
import { dressing } from "./data/dressing.ts";
import { bestiary } from "./data/monsters.ts";

describe("corpus export", () => {
    it("purpose: emits every entry with its value and tags", () => {
        const out = serializePurposeVocab(purposeVocab);
        expect((out.match(/\{ value: "/g) ?? []).length).toBe(purposeVocab.length);
        for (const v of purposeVocab) {
            expect(out).toContain(JSON.stringify(v.value));
            for (const t of v.tags) expect(out).toContain(JSON.stringify(t));
        }
    });

    it("construction: emits every value with its kind", () => {
        const out = serializeConstructionVocab(constructionVocab);
        expect((out.match(/\{ value: "/g) ?? []).length).toBe(constructionVocab.length);
        for (const v of constructionVocab) expect(out).toContain(`kind: ${JSON.stringify(v.kind)}`);
    });

    it("bestiary: emits every family with its species", () => {
        const out = serializeBestiary(bestiary);
        for (const f of bestiary) {
            expect(out).toContain(`{ name: ${JSON.stringify(f.name)}, tags:`);
            for (const s of f.species) expect(out).toContain(`{ name: ${JSON.stringify(s.name)}, tags:`);
        }
    });

    it("dressing: entry count matches and empty fields are omitted", () => {
        const out = serializeDressing(dressing);
        expect((out.match(/\{ text: "/g) ?? []).length).toBe(dressing.length);
        const base = dressing.find(d => !d.requires && !d.affinity && d.weight === undefined)!;
        expect(out).toContain(`{ text: ${JSON.stringify(base.text)} },`); // no trailing fields
        const req = dressing.find(d => d.requires?.length)!;
        expect(out).toContain(`requires: [${req.requires!.map(t => JSON.stringify(t)).join(", ")}]`);
    });
});