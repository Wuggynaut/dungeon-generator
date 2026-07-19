import { describe, it, expect } from "vitest";
import {
    placePoints,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    candidateEdges,
    spanningTree,
    addLoops,
    findEntrance,
    numberRooms,
    pickPathType
} from "./map.ts";
import { makeChildRng } from "./rng.ts";
import {generate} from "./generate.ts";

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

function isConnected(edges: { a: number; b: number }[], nodeCount: number): boolean {
    const adjacency: number[][] = Array.from({ length: nodeCount }, () => []);
    for (const edge of edges) {
        adjacency[edge.a].push(edge.b);
        adjacency[edge.b].push(edge.a);
    }
    const visited = new Set<number>();
    const stack = [0];
    while (stack.length > 0) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);
        for (const neighbor of adjacency[node]) stack.push(neighbor);
    }
    return visited.size === nodeCount;
}

describe("spanningTree", () => {
    it("connects every room with no spare edges", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        const tree = spanningTree(candidateEdges(points), points.length, points);

        expect(tree).toHaveLength(points.length - 1);
        expect(isConnected(tree, points.length)).toBe(true);
    });

    it("uses only candidate edges and is deterministic", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        const candidates = candidateEdges(points);
        const tree = spanningTree(candidates, points.length, points);

        const candidateKeys = new Set(candidates.map(edge => `${edge.a}-${edge.b}`));
        for (const edge of tree) {
            expect(candidateKeys.has(`${edge.a}-${edge.b}`)).toBe(true);
        }

        expect(spanningTree(candidates, points.length, points)).toEqual(tree);
    });
});

describe("addLoops", () => {
    it("stays connected and respects the degree cap", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        const candidates = candidateEdges(points);
        const tree = spanningTree(candidates, points.length, points);
        const edges = addLoops(tree, candidates, points.length, makeChildRng("test-seed", "map"), points);

        expect(isConnected(edges, points.length)).toBe(true);
        expect(edges.length).toBeGreaterThanOrEqual(tree.length); // only added, never removed

        const degree = new Array(points.length).fill(0);
        for (const edge of edges) {
            degree[edge.a]++;
            degree[edge.b]++;
        }
        for (const d of degree) expect(d).toBeLessThanOrEqual(4);
    });

    it("only adds candidate edges and is deterministic", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        const candidates = candidateEdges(points);
        const tree = spanningTree(candidates, points.length, points);

        const candidateKeys = new Set(candidates.map(edge => `${edge.a}-${edge.b}`));
        const edges = addLoops(tree, candidates, points.length, makeChildRng("test-seed", "map"), points);
        for (const edge of edges) {
            expect(candidateKeys.has(`${edge.a}-${edge.b}`)).toBe(true);
        }

        const again = addLoops(tree, candidates, points.length, makeChildRng("test-seed", "map"), points);
        expect(again).toEqual(edges);
    });
});

describe("findEntrance", () => {
    it("picks the point closest to a canvas wall", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        const entrance = findEntrance(points);

        expect(entrance).toBeGreaterThanOrEqual(0);
        expect(entrance).toBeLessThan(points.length);

        const gap = (p: { x: number; y: number }) =>
            Math.min(p.x, p.y, CANVAS_WIDTH - p.x, CANVAS_HEIGHT - p.y);

        const entranceGap = gap(points[entrance]);
        for (const point of points) {
            expect(entranceGap).toBeLessThanOrEqual(gap(point));
        }
    });
});

describe("numberRooms", () => {
    it("numbers every room once, starting at the entrance", () => {
        const points = placePoints(makeChildRng("test-seed", "map"), 12);
        const candidates = candidateEdges(points);
        const tree = spanningTree(candidates, points.length, points);
        const edges = addLoops(tree, candidates, points.length, makeChildRng("test-seed", "map"), points);
        const entrance = findEntrance(points);

        const numbers = numberRooms(edges, points.length, entrance);

        expect(numbers[entrance]).toBe(1); // entrance is room 1

        // a clean 1..count with no gaps proves: nothing unreached, nothing doubled
        const sorted = [...numbers].sort((x, y) => x - y);
        const expected = Array.from({ length: points.length }, (_, i) => i + 1);
        expect(sorted).toEqual(expected);

        expect(numberRooms(edges, points.length, entrance)).toEqual(numbers); // deterministic
    });
});

describe("pickPathType", () => {
    it("favours standard, then conditional, then hidden", () => {
        const rng = makeChildRng("test-seed", "map");
        const counts = { standard: 0, conditional: 0, hidden: 0 };
        const rolls = 3000;
        for (let i = 0; i < rolls; i++) counts[pickPathType(rng)]++;

        expect(counts.standard + counts.conditional + counts.hidden).toBe(rolls); // all valid
        expect(counts.standard).toBeGreaterThan(counts.conditional);
        expect(counts.conditional).toBeGreaterThan(counts.hidden);
    });
});

describe("dungeon map (full pipeline)", () => {
    it("is connected with degree ≤ 4 across many seeds", () => {
        for (let i = 0; i < 200; i++) {
            const { nodes, edges } = generate(`seed-${i}`).map;

            const adjacency = new Map<number, number[]>();
            const degree = new Map<number, number>();
            for (const node of nodes) {
                adjacency.set(node.roomId, []);
                degree.set(node.roomId, 0);
            }
            for (const edge of edges) {
                adjacency.get(edge.a)!.push(edge.b);
                adjacency.get(edge.b)!.push(edge.a);
                degree.set(edge.a, degree.get(edge.a)! + 1);
                degree.set(edge.b, degree.get(edge.b)! + 1);
            }

            // degree cap
            for (const d of degree.values()) expect(d).toBeLessThanOrEqual(4);

            // connectivity: reach every room from the first one
            const visited = new Set<number>();
            const stack = [nodes[0].roomId];
            while (stack.length > 0) {
                const room = stack.pop()!;
                if (visited.has(room)) continue;
                visited.add(room);
                for (const next of adjacency.get(room)!) stack.push(next);
            }
            expect(visited.size).toBe(nodes.length);
        }
    });

    it("reproduces the same map for the same seed", () => {
        expect(generate("repeat-me").map).toEqual(generate("repeat-me").map);
    });
});