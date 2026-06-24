import type { Denizens, Dungeon, Faction, History, Overrides, PairedTable, Room, RoomType } from "../types/rollTypes.ts";
import { makeChildRng, type Rng } from "./rng.ts";
import { rollSlots } from "./rolls.ts";
import { type Config, defaultConfig, type Tables } from "./config.ts";
import { generateMap } from "./map.ts";

const MAX_TYPE_REROLL_TRIES = 50;

function generateHistory(seed: string, tables: Tables, overrides: Overrides): History {
    return {
        purpose:      rollSlots(seed, tables.purpose,      "history.purpose",      overrides),
        construction: rollSlots(seed, tables.construction, "history.construction", overrides),
        ruination:    rollSlots(seed, tables.ruination,    "history.ruination",    overrides),
    };
}

function generateDenizens(seed: string, tables: Tables, overrides: Overrides): Denizens {
    return {
        attitude:    rollSlots(seed, tables.traits, "denizens.attitude",    overrides),
        standoutNPC: rollSlots(seed, tables.traits, "denizens.standoutNPC", overrides),
    };
}

function generateFactions(seed: string, agendas: PairedTable, count: number, overrides: Overrides): Faction[] {
    const factions: Faction[] = [];
    for (let i = 0; i < count; i++) {
        factions.push({ agenda: rollSlots(seed, agendas, `faction.${i}.agenda`, overrides) });
    }
    return factions;
}

function roomTypeAtCount(seed: string, pool: RoomType[], roomId: number, count: number): RoomType {
    const slotId = `room.${roomId}.type`;
    const label = count > 0 ? `${slotId}#${count}` : slotId;
    const rng = makeChildRng(seed, label);

    if (count === 0) return pickRoomType(rng, pool);

    const previous = roomTypeAtCount(seed, pool, roomId, count - 1);
    for (let i = 0; i < MAX_TYPE_REROLL_TRIES; i++) {
        const candidate = pickRoomType(rng, pool);
        if (candidate.name !== previous.name) return candidate;
    }
    return previous;
}

export function pickRoomType(rng: Rng, pool: RoomType[]): RoomType {
    const totalWeight = pool.reduce((sum, rt) => sum + rt.weight, 0);
    let remaining = rng.int(totalWeight);
    for (const rt of pool) {
        if (remaining < rt.weight) return rt;
        remaining -= rt.weight;
    }
    return pool[pool.length - 1];
}

function generateRooms(seed: string, pool: RoomType[], count: number, overrides: Overrides): Room[] {
    const rooms: Room[] = [];
    for (let id = 1; id <= count; id++) {
        const typeCount = overrides[`room.${id}.type`]?.rerollCount ?? 0;
        const rt = roomTypeAtCount(seed, pool, id, typeCount);
        const roll = rollSlots(seed, rt.table, `room.${id}`, overrides);
        rooms.push({ id, type: rt.name, roll });
    }
    return rooms;
}

export function generate(seed: string, config: Config = defaultConfig, overrides: Overrides = {}): Dungeon {
    const history = generateHistory(seed, config.tables, overrides);
    const denizens = generateDenizens(seed, config.tables, overrides);
    const factions = generateFactions(seed, config.tables.agendas, config.factionCount, overrides);
    const rooms = generateRooms(seed, config.roomTypes, config.roomCount, overrides);
    const map = generateMap(makeChildRng(seed, "map"), rooms, overrides);

    return { seed, history, denizens, factions, rooms, map };
}