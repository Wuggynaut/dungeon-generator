import type {DungeonMap} from "./mapTypes.ts";

// A column value is a bare string, or an object that names a subtable to roll
// when this value comes up.
export type ColumnValue =
    | string
    | { value: string; subtable?: string; requires?: string[]; affinity?: string[]; weight?: number };

export type ColumnValues = ColumnValue[] | { ref: string }; // inline list, or a named source

export type Column = { label: string; values: ColumnValues };

export type Table = { columns: Column[] };

export type RoomType = {
    name: string;
    weight: number;
    table: Table;
};

export type Detail = {
    text: string;
    requires?: string[]; // every tag must be in the room context, else ineligible (suppression)
    affinity?: string[]; // each tag present in the context adds weight (steering)
    weight?: number;     // base weight before affinity (default 1)
};

export type Species = { name: string; tags: string[] };

export type Family = { name: string; tags: string[]; species: Species[] };

export type SlotOverride = {
    rerollCount?: number;  // how many times the user has rerolled this slot
    editValue?: string;    // a value the user typed by hand
};

export type Overrides = Record<string, SlotOverride>;

export type Slot = { id: string; value: string };

export type SlotControls = {
    reroll: (slotId: string) => void;
    edit: (slotId: string, value: string) => void;
};

export type Roll = {
    columns: string[]; // column labels, copied from the source table
    cells: Slot[];     // one rolled value per column
    subrolls?: (Roll | null)[]; // per-cell child roll when the value routes to a subtable
};

// A flat registry of named child tables.
export type Subtables = Record<string, Table>;

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
    group: Slot;   // the faction's family = its "Type" (may be a single-species family)
    strength: number;
    agenda: Roll;
};

export type Room = {
    id: number;
    type: string;
    roll: Roll;
    monster?: Slot; // the species shown for a monster room
    family?: string; // backend only: which family the species was drawn from (never shown)
    occupantFaction?: number; // index into dungeon.factions; absent = unaligned or non-monster room
    details?: Slot[]; // rolled dressing lines; slot ids are room.<id>.detail.<n>
};

export type Dungeon = {
    seed: string;
    history: History;
    denizens: Denizens;
    factions: Faction[];
    rooms: Room[];
    map: DungeonMap;
};

export type NameType = "npcName" | "properNoun" | "hidden";