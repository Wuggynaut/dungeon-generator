export type Point = { x: number; y: number };

export type PathType = "standard" | "conditional" | "hidden";

export type MapNode = {
    roomId: number;  // stable id from Phase 4
    number: number;  // display number from the BFS walk (1-based)
    x: number;
    y: number;
};

export type MapEdge = {
    a: number;       // roomId of one end
    b: number;       // roomId of the other end
    type: PathType;
};

export type DungeonMap = {
    nodes: MapNode[];
    edges: MapEdge[];
    entrance: number; // roomId of the entrance
};