import type {Denizens, Dungeon, Faction, History, Room, RoomType} from "../types/rollTypes.ts";
import {makeChildRng, type Rng} from "./rng.ts";
import {rollSlots} from "./rolls.ts";
import {agendas, construction, purpose, ruination, traits} from "./tables.ts";
import {defaultConfig} from "./config.ts";
import {generateMap} from "./map.ts";

function generateHistory (rng : Rng) : History {
    return {
        purpose: rollSlots(rng, purpose, "history.purpose"),
        construction: rollSlots(rng, construction, "history.construction"),
        ruination: rollSlots(rng, ruination, "history.ruination"),
    };
}

function generateDenizens (rng: Rng) : Denizens {
    return {
        attitude: rollSlots(rng, traits, "denizens.attitude"),
        standoutNPC: rollSlots(rng, traits, "denizens.standoutNPC"),
    };
}

function generateFactions (rng: Rng, count : number) : Faction[] {
    const  factions: Faction[] = [];
    for (let i = 0; i < count; i++) {
        const baseId = `faction.${i}.agenda`
        factions.push({ agenda: rollSlots(rng, agendas, baseId)});
    }
    return factions;
}

export function pickRoomType(rng: Rng, pool: RoomType[]) : RoomType {
    const totalWeight = pool.reduce((sum, rt) => sum + rt.weight, 0);
    let remaining = rng.int(totalWeight);
    for (const rt of pool) {
        if (remaining < rt.weight) return rt;
        remaining -= rt.weight;
    }
    return pool[pool.length -1 ]; // safety net
}

function generateRooms(rng: Rng, pool: RoomType[], count: number): Room[] {
    const rooms: Room[] = [];
    for (let id = 1; id < count; id++) {
        const rt = pickRoomType(rng, pool);
        const roll = rollSlots(rng, rt.table, `room.${id}`);
        rooms.push({ id, type: rt.name, roll });
    }
    return rooms;
}

export function generate(seed: string, config = defaultConfig): Dungeon {
    const history = generateHistory(makeChildRng(seed, "history"));
    const denizens = generateDenizens(makeChildRng(seed, "denizens"));
    const factions = generateFactions(makeChildRng(seed, "factions"), config.factionCount);
    const rooms = generateRooms(makeChildRng(seed, "rooms"), config.roomTypes, config.roomCount);
    const map = generateMap(makeChildRng(seed, "map"), rooms);
    return {
        seed,
        history,
        denizens,
        factions,
        rooms,
        map,
    }
}