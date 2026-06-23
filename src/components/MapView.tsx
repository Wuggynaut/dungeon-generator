import {CANVAS_WIDTH, CANVAS_HEIGHT, edgeSlotId} from "../core/map.ts";
import { hashSeed } from "../core/rng.ts";
import type {DungeonMap, MapNode, PathType, Point} from "../types/mapTypes.ts";
import type {Room, SlotControls} from "../types/rollTypes.ts";
import {useState} from "react";

const PATH_STYLES: Record<PathType, { stroke: string; dash?: string; label: string }> = {
    standard:    { stroke: "#101010", label: "Standard" },
    conditional: { stroke: "#2b2b2b", label: "Conditional" },
    hidden:      { stroke: "#955f4f", dash: "6 4", label: "Hidden" },
};

const ROOM_COLORS: Record<string, string> = {
    Monster: "#c2185b", // raspberry
    Lore:    "#2980b9", // blue
    Special: "#1e8449", // green
    Trap:    "#da6922", // raspberry
};

const NODE_RADIUS = 16;

type MapViewProps = {
    map: DungeonMap;
    rooms: Room[];
    selected: number | null;
    onSelect: (roomId: number) => void;
    controls: SlotControls;
};

function colorForType(type: string): string {
    if (type in ROOM_COLORS) return ROOM_COLORS[type];
    const hue = hashSeed(type) % 360;        // fallback for user-defined types
    return `hsl(${hue}, 60%, 55%)`;
}

function tickMark(a: Point, b: Point, half: number) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1; // || 1 guards divide-by-zero

    // perpendicular unit vector: rotate the direction 90° and scale to length 1
    const px = -dy / len;
    const py = dx / len;

    // midpoint of the corridor
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;

    // step out from the midpoint in both perpendicular directions
    return {
        x1: mx + px * half, y1: my + py * half,
        x2: mx - px * half, y2: my - py * half,
    };
}

function nextPathType(current: PathType): PathType {
    const order: PathType[] = ["standard", "conditional", "hidden"];
    const i = order.indexOf(current);
    return order[(i + 1) % order.length];
}

export function MapView({ map, rooms, selected, onSelect, controls }: MapViewProps) {
    const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

    const nodeById = new Map<number, MapNode>();
    for (const node of map.nodes) nodeById.set(node.roomId, node);

    const typeById = new Map<number, string>();
    for (const room of rooms) typeById.set(room.id, room.type);

    const roomTypes = [...new Set(rooms.map(r => r.type))].sort();

    return (
        <div>
            <svg
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                style={{ width: "100%", maxWidth: 600, border: "1px solid #ccc" }}
            >
                {map.edges.map(edge => {
                    const a = nodeById.get(edge.a)!;
                    const b = nodeById.get(edge.b)!;
                    const style = PATH_STYLES[edge.type];
                    const tick = edge.type === "conditional" ? tickMark(a, b, 8) : null;
                    const slotId = edgeSlotId(edge.a, edge.b);
                    const isHovered = slotId === hoveredEdge;

                    return (
                        <g
                            key={`${edge.a}-${edge.b}`}
                            onClick={() => controls.edit(slotId, nextPathType(edge.type))}
                            onMouseEnter={() => setHoveredEdge(slotId)}
                            onMouseLeave={() => setHoveredEdge(null)}
                            style={{ cursor: "pointer" }}
                        >
                            {/* hover highlight*/}
                            {isHovered && (
                                <line
                                    x1={a.x} y1={a.y}
                                    x2={b.x} y2={b.y}
                                    stroke="#ee9f27"
                                    strokeWidth={10}
                                    strokeOpacity={0.5}
                                    strokeLinecap="round"
                                />
                            )}
                            {/* invisible hit area */}
                            <line
                                x1={a.x} y1={a.y}
                                x2={b.x} y2={b.y}
                                stroke="transparent"
                                strokeWidth={44}
                            />
                            <line
                                x1={a.x} y1={a.y}
                                x2={b.x} y2={b.y}
                                stroke={style.stroke}
                                strokeWidth={2}
                                strokeDasharray={style.dash}
                            />
                            {tick && (
                                <line
                                    x1={tick.x1} y1={tick.y1}
                                    x2={tick.x2} y2={tick.y2}
                                    stroke={style.stroke}
                                    strokeWidth={2}
                                />
                            )}
                        </g>
                    );
                })}

                {map.nodes.map(node => {
                    const isEntrance = node.roomId === map.entrance;
                    const isSelected = node.roomId === selected;

                    // arrow sits above the node, but flips below if the node is near the top edge
                    const gap = NODE_RADIUS + 3;
                    const pointsDown = node.y >= CANVAS_HEIGHT / 2;
                    const tipY = pointsDown ? node.y - gap : node.y + gap;
                    const baseY = pointsDown ? tipY - 10 : tipY + 10;
                    const arrow = `${node.x},${tipY} ${node.x - 7},${baseY} ${node.x + 7},${baseY}`;

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
                                stroke={isSelected ? "#1d4ed8" : "none"}
                                strokeWidth={isSelected ? 4 : 0}
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
                            {isEntrance && <polygon points={arrow} fill="#000" />}
                        </g>
                    );
                })}
            </svg>

            {/* legend */}

            <div style={{ marginTop: 12, fontSize: 13 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <svg width={14} height={12}>
                            <polygon points="1,2 13,2 7,11" fill="#000" />
                        </svg>
                        Entrance
                    </span>
                    {Object.entries(PATH_STYLES).map(([type, style]) => (
                        <span key={type} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <svg width={28} height={10}>
                                <line
                                    x1={0} y1={5} x2={28} y2={5}
                                    stroke={style.stroke}
                                    strokeWidth={2}
                                    strokeDasharray={style.dash}
                                />
                                {type === "conditional" && (
                                    <line x1={14} y1={1} x2={14} y2={9} stroke={style.stroke} strokeWidth={2} />
                                )}
                            </svg>
                                                {style.label}
                        </span>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {roomTypes.map(type => (
                        <span key={type} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: colorForType(type),
                                display: "inline-block",
                            }} />
                            {type}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}