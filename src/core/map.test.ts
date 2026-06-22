import { describe, it, expect } from "vitest";
import { placePoints, CANVAS_WIDTH, CANVAS_HEIGHT } from "./map.ts";
import { makeChildRng } from "./rng.ts";
import { candidateEdges } from "./map.ts";

describe("placePoints", () => {
    it("returns exactly `count` points", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        expect(points).toHaveLength(12);
    });

    it("keeps every point inside the canvas", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        for (const point of points) {
            expect(point.x).toBeGreaterThanOrEqual(0);
            expect(point.x).toBeLessThan(CANVAS_WIDTH);
            expect(point.y).toBeGreaterThanOrEqual(0);
            expect(point.y).toBeLessThan(CANVAS_HEIGHT);
        }
    });

    it("produces identical points for the same seed", () => {
        const a = placePoints(makeChildRng("test-seed", "map"), 12);
        const b = placePoints(makeChildRng("test-seed", "map"), 12);
        expect(a).toEqual(b);
    });

    it("connects points with valid, deduplicated edges", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        const edges = candidateEdges(points);

        for (const edge of edges) {
            expect(edge.a).toBeGreaterThanOrEqual(0);
            expect(edge.b).toBeLessThan(points.length);
            expect(edge.a).toBeLessThan(edge.b);     // ordered, so no reversed dupes
            expect(edge.length).toBeGreaterThan(0);
        }

        // no duplicate edges
        const keys = edges.map(edge => `${edge.a}-${edge.b}`);
        expect(new Set(keys).size).toBe(keys.length);

        // every point is linked to something — Delaunay leaves no point isolated
        const touched = new Set(edges.flatMap(edge => [edge.a, edge.b]));
        expect(touched.size).toBe(points.length);
    });
});