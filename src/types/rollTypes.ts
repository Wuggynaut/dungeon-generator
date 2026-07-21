import type {DungeonMap} from "./mapTypes.ts";

export type ColumnValues = string[] | { ref: string }; // inline list, or a named source resolved at roll time

export type Column = { label: string; values: ColumnValues };

export type Table = { columns: Column[] };

export type RoomType = {
    name: string;
    weight: number;
    table: Table;
};

export type Detail = {
    text: string;
    requires?: string[];
    affinity?: string[];
    weight?: number;
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
    group: Slot;   // the faction's family = its "Type" (may be a single-species family)
    strength: number;
    agenda: Roll;
};

export type Room = {
    id: number;
    type: string;
    roll: Roll;
    monster?: Slot; // the species shown for a monster room
    family?: string; // which family the species was drawn from (not shown to user)
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