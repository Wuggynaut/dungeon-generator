import type {RoomType} from "../types/rollTypes.ts";
import {defaultRoomTypes} from "./tables.ts";

export type Config = {
    roomCount: number;     // 6–20
    factionCount: number;
    roomTypes: RoomType[]; // the active pool; defaults to the built-ins
};

export const defaultConfig: Config = {
    roomCount: 12,
    factionCount: 2,
    roomTypes: defaultRoomTypes,
};