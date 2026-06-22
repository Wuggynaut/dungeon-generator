import PoissonDiskSampling from "poisson-disk-sampling";
import type { Rng } from "./rng.ts";
import type {DungeonMap, MapEdge, MapNode, PathType, Point} from "../types/mapTypes.ts";
import { Delaunay } from "d3-delaunay";
import type {Room} from "../types/rollTypes.ts";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;
const DEGREE_CAP = 4;
const LOOP_CHANCE = 0.3;
const PATH_TYPE_WEIGHTS: { type: PathType; weight: number }[] = [
    { type: "standard", weight: 7 },
    { type: "conditional", weight: 2 },
    { type: "hidden", weight: 1 },
];
const PADDING = 40;

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

// Kruskal's algorithm
export function spanningTree(edges: Edge[], nodeCount: number): Edge[] {
    const sorted = [...edges].sort(
        (x, y) => x.length - y.length || x.a - y.a || x.b - y.b,
    );

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

export function addLoops(
    tree: Edge[],
    candidates: Edge[],
    nodeCount: number,
    rng: Rng,
): Edge[] {
    const degree = new Array<number>(nodeCount).fill(0);
    for (const edge of tree) {
        degree[edge.a]++;
        degree[edge.b]++;
    }

    const inTree = new Set(tree.map(edge => `${edge.a}-${edge.b}`));
    const result = [...tree];

    for (const edge of candidates) {
        if (inTree.has(`${edge.a}-${edge.b}`)) continue; // already a corridor

        const roll = rng.next();
        const underCap =
            degree[edge.a] < DEGREE_CAP && degree[edge.b] < DEGREE_CAP;

        if (roll < LOOP_CHANCE && underCap) {
            result.push(edge);
            degree[edge.a]++;
            degree[edge.b]++;
        }
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

export function generateMap (rng: Rng, rooms: Room[]): DungeonMap {
    const count = rooms.length;

    const points = fitToCanvas(placePoints(rng, count), PADDING);
    const candidates = candidateEdges(points);
    const tree = spanningTree(candidates, count);
    const edges = addLoops(tree, candidates, count, rng);
    const entranceIndex = findEntrance(points);
    const numbers = numberRooms(edges, count, entranceIndex);

    const roomIdOf = (index: number) => rooms[index].id;

    const nodes: MapNode[] = points.map((point, index) => ({
        roomId: roomIdOf(index),
        number: numbers[index],
        x: point.x,
        y: point.y,
    }));

    const mapEdges: MapEdge[] = [];
    for (const edge of edges) {
        mapEdges.push({
            a: roomIdOf(edge.a),
            b: roomIdOf(edge.b),
            type: pickPathType(rng),
        });
    }

    return {
        nodes,
        edges: mapEdges,
        entrance: roomIdOf(entranceIndex),
    };
}