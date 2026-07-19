import type {DungeonMap} from "./mapTypes.ts";

export type PairedTable = {
    columns: [string, string];
    rows: [string, string][];
};

export type RoomType = {
    name: string;
    weight: number;
    table: PairedTable;
}

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
    group: Slot;
    species: Slot;   // drawn from the group's family roster
    strength: number;
    agenda: Roll;
};

export type Room = {
    id: number;
    type: string;
    roll: Roll;
    monster?: Slot; // specific monster; only set for rooms whose group is in the bestiary
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