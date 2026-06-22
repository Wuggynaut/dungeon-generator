import type {DungeonMap, MapNode, PathType} from "../types/mapTypes.ts";
import {hashSeed} from "../core/rng.ts";
import type {Room} from "../types/rollTypes.ts";
import {CANVAS_HEIGHT, CANVAS_WIDTH} from "../core/map.ts";

function dashFor(type: PathType): string | undefined {
    switch (type) {
        case "standard": return undefined;
        case "hidden": return "6 4"
        case "conditional": return "2 5";
    }
}

function colorForType(type: string): string {
    const hue = hashSeed(type) % 360;
    return `hsl(${hue}, 60%, 55%`;
}

const NODE_RADIUS = 16;

export function MapView({ map, rooms }: {map: DungeonMap, rooms: Room[]}) {
    const nodeById = new Map<number, MapNode>();
    for (const node of map.nodes) nodeById.set(node.roomId, node);

    const typeById = new Map<number, string>();
    for (const room of rooms) typeById.set(room.id, room.type);

    const scrollToRoom = (roomId: number) => {
        document.getElementById(`room-${roomId}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            style={{ width: "100%", maxWidth: CANVAS_WIDTH, border: "1px solid black" }}
        >
            {map.edges.map(edge => {
                const a = nodeById.get(edge.a)!;
                const b = nodeById.get(edge.b)!;
                return (
                    <line
                        key={`${edge.a}-${edge.b}`}
                        x1={a.x} y1={a.y}
                        x2={b.x} y2={b.y}
                        stroke="#666"
                        strokeWidth={2}
                        strokeDasharray={dashFor(edge.type)}
                    />
                );
            })}

            {map.nodes.map(node => (
                <g
                    key={node.roomId}
                    onClick={() => scrollToRoom(node.roomId)}
                    style={{ cursor: "pointer" }}
                >
                    <circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_RADIUS}
                        fill={colorForType(typeById.get(node.roomId) ?? "")}
                        stroke={node.roomId === map.entrance ? "black" : "none"}
                        strokeWidth={3}
                    />
                    <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#fff"
                        fontSize={14}
                        fontWeight="bold"
                    >
                        {node.number}
                    </text>
                </g>
            ))}
        </svg>
    )
}