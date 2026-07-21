import type { Denizens, Dungeon, Faction, History, Overrides, Table, Room, RoomType } from "../types/rollTypes.ts";
import {makeChildRng, pickWeighted, type Rng} from "./rng.ts";
import { rollTable, rollOne, rollValueWithCount, selectDetail } from "./rolls.ts";
import {groupNames, monstersByGroup} from "./data/monsters.ts";
import {dressing} from "./data/dressing.ts";
import {roomContext} from "./context.ts";
import { type Config, defaultConfig, type Tables } from "./config.ts";
import { generateMap } from "./map.ts";

const MAX_TYPE_REROLL_TRIES = 50;
const UNALIGNED_WEIGHT = 1; // How likely a monster room belongs to no faction, relative to one faction's strength

function generateHistory(seed: string, tables: Tables, overrides: Overrides): History {
    return {
        purpose:      rollTable(seed, tables.purpose,      "history.purpose",      overrides),
        construction: rollTable(seed, tables.construction, "history.construction", overrides),
        ruination:    rollTable(seed, tables.ruination,    "history.ruination",    overrides),
    };
}

function generateDenizens(seed: string, tables: Tables, overrides: Overrides): Denizens {
    return {
        attitude:    rollTable(seed, tables.traits, "denizens.attitude",    overrides),
        standoutNPC: rollTable(seed, tables.traits, "denizens.standoutNPC", overrides),
    };
}

const FACTION_STRENGTH_SIDES = 3; // strength is 1..3; it weights room occupancy and names the dominant denizen

function generateFactions(seed: string, agendas: Table, count: number, overrides: Overrides): Faction[] {
    const factions: Faction[] = [];
    for (let i = 0; i < count; i++) {
        const group = rollOne(seed, groupNames, `faction.${i}.group`, overrides);
        const strength = makeChildRng(seed, `faction.${i}.strength`).die(FACTION_STRENGTH_SIDES);
        factions.push({
            group,
            strength,
            agenda: rollTable(seed, agendas, `faction.${i}.agenda`, overrides),
        });
    }
    return factions;
}


// Returns a faction index, or null for the unaligned remainder.
function sampleOccupantOnce(seed: string, factions: Faction[], label: string): number | null {
    const rng = makeChildRng(seed, label);
    const total = factions.reduce((sum, f) => sum + f.strength, 0) + UNALIGNED_WEIGHT;
    let r = rng.int(total);
    for (let i = 0; i < factions.length; i++) {
        if (r < factions[i].strength) return i;
        r -= factions[i].strength;
    }
    return null; // fell into the unaligned slice
}

// A faction index or null (unaligned).
function sampleOccupantIndex(
    seed: string,
    roomId: number,
    factions: Faction[],
    count: number,
): number | null {
    const base = `room.${roomId}.occupant`;
    if (count === 0) return sampleOccupantOnce(seed, factions, base);

    const previous = sampleOccupantIndex(seed, roomId, factions, count - 1);
    for (let t = 0; t < MAX_TYPE_REROLL_TRIES; t++) {
        const candidate = sampleOccupantOnce(seed, factions, `${base}#${count}.${t}`);
        if (candidate !== previous) return candidate;
    }
    return previous; // give up: only one possible outcome
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
    return pickWeighted(rng, pool);
}

function generateRooms(
    seed: string,
    pool: RoomType[],
    count: number,
    overrides: Overrides,
    factions: Faction[],
): Room[] {
    const rooms: Room[] = [];
    for (let id = 1; id <= count; id++) {
        const typeCount = overrides[`room.${id}.type`]?.rerollCount ?? 0;
        const rt = roomTypeAtCount(seed, pool, id, typeCount);
        const roll = rollTable(seed, rt.table, `room.${id}`, overrides);
        const room: Room = { id, type: rt.name, roll };

        // The monster room's first column is the family (a ref to the bestiary).
        if (rt.name === "Monster") {
            const occCount = overrides[`room.${id}.occupant`]?.rerollCount ?? 0;
            const idx = sampleOccupantIndex(seed, id, factions, occCount);
            const creatureCount = overrides[`room.${id}.monster`]?.rerollCount ?? 0;

            let family: string;
            if (idx !== null) {
                room.occupantFaction = idx;
                family = factions[idx].group.value; // aligned: the faction's family (fixed)
            } else {
                family = rollValueWithCount(seed, groupNames, `room.${id}.family`, creatureCount);
            }
            room.family = family;
            const roster = monstersByGroup[family] ?? [];
            room.monster = rollOne(seed, roster, `room.${id}.monster`, overrides);
        }


        rooms.push(room);
    }
    return rooms;
}

export function generate(seed: string, config: Config = defaultConfig, overrides: Overrides = {}): Dungeon {
    const history = generateHistory(seed, config.tables, overrides);
    const denizens = generateDenizens(seed, config.tables, overrides);
    const factions = generateFactions(seed, config.tables.agendas, config.factionCount, overrides);
    const rooms = generateRooms(seed, config.roomTypes, config.roomCount, overrides, factions);
    const map = generateMap(makeChildRng(seed, "map"), rooms, overrides);

    const dungeon: Dungeon = { seed, history, denizens, factions, rooms, map };

    // Details chosen last, against each room's full context.
    for (const room of rooms) {
        const context = roomContext(dungeon, room);
        room.details = [selectDetail(seed, dressing, context, `room.${room.id}.detail.0`, overrides)];
    }

    return dungeon;
}