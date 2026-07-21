import type {Table, RoomType} from "../types/rollTypes.ts";
import {defaultRoomTypes, purpose, construction, ruination, traits, agendas} from "./data/tables.ts";

export type Tables = {
    purpose: Table;
    construction: Table;
    ruination: Table;
    traits: Table;
    agendas: Table;
};

export type Config = {
    roomCount: number;
    factionCount: number;
    roomTypes: RoomType[];
    tables: Tables;
    resolveDetails: boolean;
};

export const defaultConfig: Config = {
    roomCount: 12,
    factionCount: 2,
    roomTypes: defaultRoomTypes,
    tables: { purpose, construction, ruination, traits, agendas },
    resolveDetails: true,
};