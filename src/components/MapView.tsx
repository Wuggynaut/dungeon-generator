import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../core/map.ts";
import { hashSeed } from "../core/rng.ts";
import type { DungeonMap, MapNode, PathType } from "../types/mapTypes.ts";
import type { Room } from "../types/rollTypes.ts";

function dashFor(type: PathType): string | undefined {
    switch (type) {
        case "standard": return undefined;
        case "hidden": return "6 4";
        case "conditional": return "2 5";
    }
}

function colorForType(type: string): string {
    const hue = hashSeed(type) % 360;
    return `hsl(${hue}, 60%, 55%)`;
}

const NODE_RADIUS = 16;

type MapViewProps = {
    map: DungeonMap;
    rooms: Room[];
    selected: number | null;
    onSelect: (roomId: number) => void;
};

export function MapView({ map, rooms, selected, onSelect }: MapViewProps) {
    const nodeById = new Map<number, MapNode>();
    for (const node of map.nodes) nodeById.set(node.roomId, node);

    const typeById = new Map<number, string>();
    for (const room of rooms) typeById.set(room.id, room.type);

    return (
        <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            style={{ width: "100%", maxWidth: 600, border: "1px solid #ccc" }}
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

            {map.nodes.map(node => {
                const isEntrance = node.roomId === map.entrance;
                const isSelected = node.roomId === selected;
                return (
                    <g
                        key={node.roomId}
                        onClick={() => onSelect(node.roomId)}
                        style={{ cursor: "pointer" }}
                    >
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={NODE_RADIUS}
                            fill={colorForType(typeById.get(node.roomId) ?? "")}
                            stroke={isSelected ? "#1d4ed8" : isEntrance ? "#000" : "none"}
                            strokeWidth={isSelected ? 4 : 3}
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
                );
            })}
        </svg>
    );
}