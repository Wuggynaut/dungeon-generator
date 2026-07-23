import PoissonDiskSampling from "poisson-disk-sampling";
import type { Rng } from "./rng.ts";
import * as slots from "./slots.ts";
import type {DungeonMap, MapEdge, MapNode, PathType, Point} from "../types/mapTypes.ts";
import { Delaunay } from "d3-delaunay";
import type {Overrides, Room} from "../types/rollTypes.ts";

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 720;
const PATH_TYPE_WEIGHTS: { type: PathType; weight: number }[] = [
    { type: "standard", weight: 8 },
    { type: "conditional", weight: 2 },
    { type: "hidden", weight: 1 },
];
// Desired corridors-per-room. Weight = chance out of the total (8).
const DEGREE_WEIGHTS: { degree: number; weight: number }[] = [
    { degree: 1, weight: 1 },
    { degree: 2, weight: 3 },
    { degree: 3, weight: 3 },
    { degree: 4, weight: 1 },
];

const PADDING = 40;
const MAX_CUTOFF = 3;
const GRID = 24;
const NODE_CLEARANCE = 26;
const MIN_CORRIDOR_ANGLE = 25;

type Edge = { a: number; b: number; length: number };

export function placePoints(rng: Rng, count: number): Point[] {
    const minDistance = Math.sqrt((CANVAS_WIDTH * CANVAS_HEIGHT) / count) * 0.6;

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

function snapToGrid(points: Point[], grid: number): Point[] {
    return points.map(p => ({
        x: Math.round(p.x / grid) * grid,
        y: Math.round(p.y / grid) * grid,
    }));
}

function distance(p: Point, q: Point): number {
    const dx = p.x - q.x;
    const dy = p.y - q.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function candidateEdges(points: Point[]): Edge[] {
    if (points.length < 3) {
        return points.length === 2
            ? [{ a: 0, b: 1, length: distance(points[0], points[1]) }]
            : [];
    }

    const delaunay = Delaunay.from(points, (p: Point) => p.x, (p: Point) => p.y);
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

function pickTargetDegree(rng: Rng): number {
    const total = DEGREE_WEIGHTS.reduce((sum, e) => sum + e.weight, 0); // 8
    let remaining = rng.int(total);
    for (const e of DEGREE_WEIGHTS) {
        if (remaining < e.weight) return e.degree;
        remaining -= e.weight;
    }
    return DEGREE_WEIGHTS[DEGREE_WEIGHTS.length - 1].degree; // safety net
}

// Kruskal's algorithm
export function spanningTree(edges: Edge[], nodeCount: number, points: Point[]): Edge[] {
    const sorted = [...edges].sort((x, y) => {
        const gx = edgeGrazes(x, points) ? 1 : 0;
        const gy = edgeGrazes(y, points) ? 1 : 0;
        if (gx !== gy) return gx - gy;            // clean edges first
        return x.length - y.length || x.a - y.a || x.b - y.b;
    });

    const component = Array.from({ length: nodeCount }, (_, i) => i);
    const tree: Edge[] = [];

    for (const edge of sorted) {
        if (component[edge.a] === component[edge.b]) continue;

        tree.push(edge);

        const fromIsland = component[edge.b];
        const toIsland = component[edge.a];
        for (let i = 0; i < nodeCount; i++) {
            if (component[i] === fromIsland) component[i] = toIsland;
        }

        if (tree.length === nodeCount - 1) break;
    }

    return tree;
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return distance(p, a); // a and b are the same point

    // how far along a→b the closest point lies, clamped to the segment
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const closest = { x: a.x + t * dx, y: a.y + t * dy };
    return distance(p, closest);
}

function edgeGrazes(edge: Edge, points: Point[]): boolean {
    for (let i = 0; i < points.length; i++) {
        if (i === edge.a || i === edge.b) continue; // skip the edge's own endpoints
        if (distanceToSegment(points[i], points[edge.a], points[edge.b]) < NODE_CLEARANCE) {
            return true;
        }
    }
    return false;
}

function angleBetween(vertex: Point, p: Point, q: Point): number {
    const v1x = p.x - vertex.x;
    const v1y = p.y - vertex.y;
    const v2x = q.x - vertex.x;
    const v2y = q.y - vertex.y;

    const dot = v1x * v2x + v1y * v2y;
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y) || 1;
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y) || 1;

    const cos = Math.max(-1, Math.min(1, dot / (len1 * len2)));
    return Math.acos(cos) * (180 / Math.PI); // radians → degrees
}

// Would `edge` leave `room` at too sharp an angle to any corridor it already has?
function tooSharpAt(
    room: number,
    edge: Edge,
    existing: Edge[],
    points: Point[],
): boolean {
    const farEnd = edge.a === room ? edge.b : edge.a;

    for (const e of existing) {
        // only corridors that touch this room
        if (e.a !== room && e.b !== room) continue;
        const otherEnd = e.a === room ? e.b : e.a;
        if (otherEnd === farEnd) continue; // same corridor

        if (angleBetween(points[room], points[farEnd], points[otherEnd]) < MIN_CORRIDOR_ANGLE) {
            return true;
        }
    }
    return false;
}

export function addLoops(
    tree: Edge[],
    candidates: Edge[],
    nodeCount: number,
    rng: Rng,
    points: Point[],
): Edge[] {

    const target = new Array<number>(nodeCount);
    for (let i = 0; i < nodeCount; i++) target[i] = pickTargetDegree(rng);


    const degree = new Array<number>(nodeCount).fill(0);
    for (const edge of tree) {
        degree[edge.a]++;
        degree[edge.b]++;
    }

    const inTree = new Set(tree.map(edge => `${edge.a}-${edge.b}`));
    const result = [...tree];


    const ordered = [...candidates].sort((x, y) => x.length - y.length);

    for (const edge of ordered) {
        if (inTree.has(`${edge.a}-${edge.b}`)) continue;
        if (edgeGrazes(edge, points)) continue;

        const bothWantMore =
            degree[edge.a] < target[edge.a] && degree[edge.b] < target[edge.b];
        if (!bothWantMore) continue;

        // reject if the edge makes a sharp wedge at either room it joins
        if (tooSharpAt(edge.a, edge, result, points)) continue;
        if (tooSharpAt(edge.b, edge, result, points)) continue;

        result.push(edge);
        degree[edge.a]++;
        degree[edge.b]++;
    }

    return result;
}

export function findEntrance(points: Point[]): number {
    let entrance = 0;
    let smallestGap = Infinity;

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const gapToWall = Math.min(
            point.x,
            point.y,
            CANVAS_WIDTH - point.x,
            CANVAS_HEIGHT - point.y,
        );
        if (gapToWall < smallestGap) {
            smallestGap = gapToWall;
            entrance = i;
        }
    }

    return entrance;
}

export function numberRooms(edges: Edge[], nodeCount: number, entrance: number): number[] {
    const adjacency: number[][] = Array.from({ length: nodeCount }, () => []);
    for (const edge of edges) {
        adjacency[edge.a].push(edge.b);
        adjacency[edge.b].push(edge.a);
    }
    for (const neighbours of adjacency) neighbours.sort((x, y) => x - y);

    const numbers = new Array<number>(nodeCount).fill(0); // 0 = not numbered yet
    const queue: number[] = [entrance];
    let nextNumber = 1;
    numbers[entrance] = nextNumber++;

    while (queue.length > 0) {
        const node = queue.shift()!;
        for (const neighbour of adjacency[node]) {
            if (numbers[neighbour] === 0) {
                numbers[neighbour] = nextNumber++;
                queue.push(neighbour);
            }
        }
    }

    return numbers;
}

export function pickPathType(rng: Rng): PathType {
    const totalWeight = PATH_TYPE_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
    let remaining = rng.int(totalWeight);
    for (const entry of PATH_TYPE_WEIGHTS) {
        if (remaining < entry.weight) return entry.type;
        remaining -= entry.weight;
    }
    return PATH_TYPE_WEIGHTS[PATH_TYPE_WEIGHTS.length - 1].type; // safety net
}

function fitToCanvas(points: Point[], padding: number): Point[] {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    const boxW = Math.max(...xs) - minX || 1;
    const boxH = Math.max(...ys) - minY || 1;

    const availW = CANVAS_WIDTH - padding * 2;
    const availH = CANVAS_HEIGHT - padding * 2;

    const scale = Math.min(availW / boxW, availH / boxH);

    const offsetX = (CANVAS_WIDTH - boxW * scale) / 2;
    const offsetY = (CANVAS_HEIGHT - boxH * scale) / 2;

    return points.map(p => ({
        x: (p.x - minX) * scale + offsetX,
        y: (p.y - minY) * scale + offsetY,
    }));
}

function cutoffSizes(tree: Edge[], nodeCount: number, root: number): Map<string, number> {
    const adj: number[][] = Array.from({ length: nodeCount }, () => []);
    for (const e of tree) {
        adj[e.a].push(e.b);
        adj[e.b].push(e.a);
    }

    // BFS from the entrance, recording each node's parent and visit order
    const parent = new Array<number>(nodeCount).fill(-1);
    const order: number[] = [];
    const visited = new Array<boolean>(nodeCount).fill(false);
    const queue = [root];
    visited[root] = true;
    while (queue.length > 0) {
        const node = queue.shift()!;
        order.push(node);
        for (const next of adj[node]) {
            if (!visited[next]) {
                visited[next] = true;
                parent[next] = node;
                queue.push(next);
            }
        }
    }

    const size = new Array<number>(nodeCount).fill(1);
    for (let i = order.length - 1; i >= 0; i--) {
        const node = order[i];
        if (parent[node] !== -1) size[parent[node]] += size[node];
    }

    const sizes = new Map<string, number>();
    for (const e of tree) {
        const child = parent[e.a] === e.b ? e.a : e.b;
        sizes.set(`${e.a}-${e.b}`, size[child]);
    }
    return sizes;
}

function isPathType(value: string | undefined): value is PathType {
    return value === "standard" || value === "conditional" || value === "hidden";
}

export function generateMap(rng: Rng, rooms: Room[], overrides: Overrides = {}): DungeonMap {
    const count = rooms.length;

    const points = snapToGrid(fitToCanvas(placePoints(rng, count), PADDING), GRID);
    const candidates = candidateEdges(points);
    const tree = spanningTree(candidates, count, points);
    const edges = addLoops(tree, candidates, count, rng, points);
    const entranceIndex = findEntrance(points);
    const numbers = numberRooms(edges, count, entranceIndex);

    // which edges are backbone vs. loop, and how much each backbone edge guards
    const treeKeys = new Set(tree.map(e => `${e.a}-${e.b}`));
    const cutoff = cutoffSizes(tree, count, entranceIndex);

    const pathTypeFor = (edge: Edge): PathType => {
        const key = `${edge.a}-${edge.b}`;
        if (!treeKeys.has(key)) return pickPathType(rng);              // loop = alternate route
        if (cutoff.get(key)! <= MAX_CUTOFF) return pickPathType(rng);  // small portion may be cut off
        return "standard";
    };

    const roomIdOf = (index: number) => rooms[index].id;

    const nodes: MapNode[] = points.map((point, index) => ({
        roomId: roomIdOf(index),
        number: numbers[index],
        x: point.x,
        y: point.y,
    }));

    const mapEdges: MapEdge[] = [];
    for (const edge of edges) {
        const a = roomIdOf(edge.a);
        const b = roomIdOf(edge.b);
        const generated = pathTypeFor(edge);
        const override = overrides[slots.edge(a, b)]?.editValue;
        mapEdges.push({
            a,
            b,
            type: isPathType(override) ? override : generated,
        });
    }

    return {
        nodes,
        edges: mapEdges,
        entrance: roomIdOf(entranceIndex),
    };
}