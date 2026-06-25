import type {DungeonMap} from "./mapTypes.ts";

export type PairedTable = {
    columns: [string, string];
    rows: [string, string][];
};

export type RoomType = {
    name: string;
    weight: number;
    table: PairedTable;
};

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
    agenda: Roll;
};

export type Room = {
    id: number;
    type: string;
    roll: Roll;
    monster?: Slot; // specific monster; only set for rooms whose group is in the bestiary
};

export type Dungeon = {
    seed: string;
    history: History;
    denizens: Denizens;
    factions: Faction[];
    rooms: Room[];
    map: DungeonMap;
};