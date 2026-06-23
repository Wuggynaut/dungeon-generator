import type { Denizens, Dungeon, Faction, History, Overrides, Room, RoomType } from "../types/rollTypes.ts";
import { makeChildRng, type Rng } from "./rng.ts";
import { rollSlots } from "./rolls.ts";
import { agendas, construction, purpose, ruination, traits } from "./tables.ts";
import { defaultConfig } from "./config.ts";
import { generateMap } from "./map.ts";

const MAX_TYPE_REROLL_TRIES = 50;

function generateHistory(seed: string, overrides: Overrides): History {
    return {
        purpose:      rollSlots(seed, purpose,      "history.purpose",      overrides),
        construction: rollSlots(seed, construction, "history.construction", overrides),
        ruination:    rollSlots(seed, ruination,    "history.ruination",    overrides),
    };
}

function generateDenizens(seed: string, overrides: Overrides): Denizens {
    return {
        attitude:    rollSlots(seed, traits, "denizens.attitude",    overrides),
        standoutNPC: rollSlots(seed, traits, "denizens.standoutNPC", overrides),
    };
}

function generateFactions(seed: string, count: number, overrides: Overrides): Faction[] {
    const factions: Faction[] = [];
    for (let i = 0; i < count; i++) {
        factions.push({ agenda: rollSlots(seed, agendas, `faction.${i}.agenda`, overrides) });
    }
    return factions;
}

function roomTypeAtCount(
    seed: string,
    pool: RoomType[],
    roomId: number,
    count: number,
): RoomType {
    const slotId = `room.${roomId}.type`;
    const label = count > 0 ? `${slotId}#${count}` : slotId;
    const rng = makeChildRng(seed, label);

    if (count === 0) return pickRoomType(rng, pool);

    const previous = roomTypeAtCount(seed, pool, roomId, count - 1);

    for (let i = 0; i < MAX_TYPE_REROLL_TRIES; i++) {
        const candidate = pickRoomType(rng, pool);
        if (candidate.name !== previous.name) return candidate;
    }
    return previous; // pool has only one type, so a different one is impossible
}

export function pickRoomType(rng: Rng, pool: RoomType[]): RoomType {
    const totalWeight = pool.reduce((sum, rt) => sum + rt.weight, 0);
    let remaining = rng.int(totalWeight);
    for (const rt of pool) {
        if (remaining < rt.weight) return rt;
        remaining -= rt.weight;
    }
    return pool[pool.length - 1]; // safety net
}

function generateRooms(
    seed: string,
    pool: RoomType[],
    count: number,
    overrides: Overrides,
): Room[] {
    const rooms: Room[] = [];
    for (let id = 1; id <= count; id++) {
        const typeCount = overrides[`room.${id}.type`]?.rerollCount ?? 0;
        const rt = roomTypeAtCount(seed, pool, id, typeCount);
        const roll = rollSlots(seed, rt.table, `room.${id}`, overrides);
        rooms.push({ id, type: rt.name, roll });
    }
    return rooms;
}

export function generate(
    seed: string,
    config = defaultConfig,
    overrides: Overrides = {},
): Dungeon {
    const history = generateHistory(seed, overrides);
    const denizens = generateDenizens(seed, overrides);
    const factions = generateFactions(seed, config.factionCount, overrides);
    const rooms = generateRooms(seed, config.roomTypes, config.roomCount, overrides);
    const map = generateMap(makeChildRng(seed, "map"), rooms, overrides);

    return { seed, history, denizens, factions, rooms, map };
}