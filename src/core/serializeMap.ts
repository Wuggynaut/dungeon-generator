import type { Dungeon } from "../types/rollTypes.ts";
import type { MapNode, PathType } from "../types/mapTypes.ts";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./map.ts";

const NODE_RADIUS = 16;

// Each path type prints with a distinct stroke pattern, since color is gone.
const DASH: Record<PathType, string> = {
    standard: "",
    conditional: "2 3",
    hidden: "6 4",
};

export function serializeMapSvg(dungeon: Dungeon): string {
    const nodeById = new Map<number, MapNode>();
    for (const node of dungeon.map.nodes) nodeById.set(node.roomId, node);

    // One <line> per edge. dasharray encodes the path type.
    const edges = dungeon.map.edges.map(edge => {
        const a = nodeById.get(edge.a)!;
        const b = nodeById.get(edge.b)!;
        const dash = DASH[edge.type];
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
            stroke="#000" stroke-width="2" stroke-dasharray="${dash}" />`;
    });

    // One circle + number per room. White fill, black outline.
    const nodes = dungeon.map.nodes.map(node => `
        <circle cx="${node.x}" cy="${node.y}" r="${NODE_RADIUS}"
            fill="#fff" stroke="#000" stroke-width="2" />
        <text x="${node.x}" y="${node.y}" text-anchor="middle"
            dominant-baseline="central" font-size="14" font-weight="bold"
            fill="#000">${node.number}</text>
    `);

    return `<svg viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"
        xmlns="http://www.w3.org/2000/svg" width="100%">
        ${edges.join("\n")}
        ${nodes.join("\n")}
    </svg>`;
}