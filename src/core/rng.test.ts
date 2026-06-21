import { describe, it, expect } from "vitest";
import { mulberry32, makeChildRng } from "./rng";

describe("mulberry32", () => {
    it("same seed yields an identical sequence", () => {
        const a = mulberry32(12345);
        const b = mulberry32(12345);
        const seqA = Array.from({ length: 5 }, () => a());
        const seqB = Array.from({ length: 5 }, () => b());
        expect(seqA).toEqual(seqB);
    });

    it("stays in [0,1)", () => {
        const r = mulberry32(1);
        for (let i = 0; i < 1000; i++) {
            const v = r();
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
        }
    });
});

describe("sub-seeds", () => {
    it("same master + label reproduces the sequence", () => {
        const r1 = makeChildRng("dragon", "history");
        const r2 = makeChildRng("dragon", "history");
        const s1 = Array.from({ length: 10 }, () => r1.die(20));
        const s2 = Array.from({ length: 10 }, () => r2.die(20));
        expect(s1).toEqual(s2);
    });

    it("different labels diverge", () => {
        const a = makeChildRng("dragon", "history");
        const b = makeChildRng("dragon", "map");
        const sa = Array.from({ length: 10 }, () => a.die(20));
        const sb = Array.from({ length: 10 }, () => b.die(20));
        expect(sa).not.toEqual(sb);
    });
});