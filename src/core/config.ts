import type {PairedTable, RoomType} from "../types/rollTypes.ts";
import {defaultRoomTypes, purpose, construction, ruination, traits, agendas} from "./data/tables.ts";

export type Tables = {
    purpose: PairedTable;
    construction: PairedTable;
    ruination: PairedTable;
    traits: PairedTable;
    agendas: PairedTable;
};

export type Config = {
    roomCount: number;
    factionCount: number;
    roomTypes: RoomType[];
    tables: Tables;
};

export const defaultConfig: Config = {
    roomCount: 12,
    factionCount: 2,
    roomTypes: defaultRoomTypes,
    tables: { purpose, construction, ruination, traits, agendas },
};