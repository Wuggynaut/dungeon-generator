import PoissonDiskSampling from "poisson-disk-sampling";
import type { Rng } from "./rng.ts";
import type { Point } from "../types/mapTypes.ts";
import { Delaunay } from "d3-delaunay";

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;

type Edge = { a: number; b: number; length: number };

export function placePoints(rng: Rng, count: number): Point[] {
    const minDistance = Math.sqrt((CANVAS_WIDTH * CANVAS_HEIGHT) / count) * 0.7;

    const sampler = new PoissonDiskSampling(
        {
            shape: [CANVAS_WIDTH, CANVAS_HEIGHT],
            minDistance,
            maxDistance: minDistance * 2,
            tries: 20,
        },
        rng.next,
    );

    const raw = sampler.fill();
    return raw.slice(0, count).map(([x, y]) => ({x, y}));
}

function distance(p: Point, q: Point): number {
    const dx = p.x - q.x;
    const dy = p.y - q.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function candidateEdges(points: Point[]): Edge[] {
    const delaunay = Delaunay.from(points, (p: Point)  => p.x, (p: Point) => p.y);
    const seen = new Set<string>();
    const edges: Edge[] = [];

    for (let i = 0; i < points.length; i++) {
        for (const j of delaunay.neighbors(i)) {
            const a = Math.min(i, j);
            const b = Math.max(i, j);
            const key = `${a}-${b}`;
            if (seen.has(key)) continue;
            seen.add(key);
            edges.push({ a, b, length: distance(points[a], points[b]) });
        }
    }
    return edges;
}