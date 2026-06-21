export type PairedTable = {
    columns: [string, string];
    rows: [string, string][];
};

export type RoomType = {
    name: string;
    weight: number;
    table: PairedTable;
};

export type Slot = { id: string; value: string };

export type Roll = {
    columns: [string, string]; //labels copies from the source table
    left: Slot;
    right: Slot;
};

export type History = {
    purpose: Roll;
    construction: Roll;
    ruination: Roll;
};

export type Denizens = {
    attitude: Roll;
    standoutNPC: Roll;
};

export type Faction = {
    agenda: Roll;
};

export type Dungeon = {
    seed: string;
    history: History;
    denizens: Denizens;
    factions: Faction[];
    // rooms + map to come
};
