import type { Denizens, Dungeon, Faction, History, Overrides, Table, Room, RoomType } from "../types/rollTypes.ts";
import {makeChildRng, pickWeighted, type Rng} from "./rng.ts";
import * as slots from "./slots.ts";
import { rollTable, rollOne, rollValueWithCount, selectDetail } from "./rolls.ts";
import {groupNames, monstersByGroup} from "./data/monsters.ts";
import {dressing} from "./data/dressing.ts";
import {roomContext, baseContext} from "./context.ts";
import {subtables} from "./data/subtables.ts";
import { type Config, defaultConfig, type Tables } from "./config.ts";
import { generateMap } from "./map.ts";

const MAX_TYPE_REROLL_TRIES = 50;
const UNALIGNED_WEIGHT = 1; // How likely a monster room belongs to no faction, relative to one faction's strength

function generateHistory(seed: string, tables: Tables, overrides: Overrides): History {
    return {
        purpose:      rollTable(seed, tables.purpose,      slots.history.purpose,      overrides),
        construction: rollTable(seed, tables.construction, slots.history.construction, overrides),
        ruination:    rollTable(seed, tables.ruination,    slots.history.ruination,    overrides),
    };
}

function generateDenizens(seed: string, tables: Tables, overrides: Overrides): Denizens {
    return {
        attitude:    rollTable(seed, tables.traits, slots.denizens.attitude,    overrides),
        standoutNPC: rollTable(seed, tables.traits, slots.denizens.standoutNPC, overrides),
    };
}

const FACTION_STRENGTH_SIDES = 3; // strength is 1..3; it weights room occupancy and names the dominant denizen

function generateFactions(seed: string, agendas: Table, count: number, overrides: Overrides): Faction[] {
    const factions: Faction[] = [];
    for (let i = 0; i < count; i++) {
        const group = rollOne(seed, groupNames, slots.faction.group(i), overrides);
        const strength = makeChildRng(seed, slots.faction.strength(i)).die(FACTION_STRENGTH_SIDES);
        factions.push({
            group,
            strength,
            agenda: rollTable(seed, agendas, slots.faction.agenda(i), overrides),
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

function sampleOccupantIndex(
    seed: string,
    roomId: number,
    factions: Faction[],
    count: number,
): number | null {
    const base = slots.room.occupant(roomId);
    if (count === 0) return sampleOccupantOnce(seed, factions, base);

    const previous = sampleOccupantIndex(seed, roomId, factions, count - 1);
    for (let t = 0; t < MAX_TYPE_REROLL_TRIES; t++) {
        const candidate = sampleOccupantOnce(seed, factions, slots.rerollTry(base, count, t));
        if (candidate !== previous) return candidate;
    }
    return previous; // give up: only one possible outcome
}

function roomTypeAtCount(seed: string, pool: RoomType[], roomId: number, count: number): RoomType {
    const slotId = slots.room.type(roomId);
    const label = slots.reroll(slotId, count);
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
    context: Set<string>,
): Room[] {
    const rooms: Room[] = [];
    for (let id = 1; id <= count; id++) {
        const typeCount = overrides[slots.room.type(id)]?.rerollCount ?? 0;
        const rt = roomTypeAtCount(seed, pool, id, typeCount);
        const roll = rollTable(seed, rt.table, slots.room.base(id), overrides, subtables, context);
        const room: Room = { id, type: rt.name, roll };

        // The monster room's first column is the family (a ref to the bestiary).
        if (rt.name === "Monster") {
            const occCount = overrides[slots.room.occupant(id)]?.rerollCount ?? 0;
            const idx = sampleOccupantIndex(seed, id, factions, occCount);
            const creatureCount = overrides[slots.room.monster(id)]?.rerollCount ?? 0;

            let family: string;
            if (idx !== null) {
                room.occupantFaction = idx;
                family = factions[idx].group.value; // aligned: the faction's family (fixed)
            } else {
                family = rollValueWithCount(seed, groupNames, slots.room.family(id), creatureCount);
            }
            room.family = family;
            const roster = monstersByGroup[family] ?? [];
            room.monster = rollOne(seed, roster, slots.room.monster(id), overrides);
        }


        rooms.push(room);
    }
    return rooms;
}

export function generate(seed: string, config: Config = defaultConfig, overrides: Overrides = {}): Dungeon {
    const history = generateHistory(seed, config.tables, overrides);
    const denizens = generateDenizens(seed, config.tables, overrides);
    const factions = generateFactions(seed, config.tables.agendas, config.factionCount, overrides);
    const rooms = generateRooms(seed, config.roomTypes, config.roomCount, overrides, factions, baseContext(history, factions));
    const map = generateMap(makeChildRng(seed, "map"), rooms, overrides);

    const dungeon: Dungeon = { seed, history, denizens, factions, rooms, map };

    // Details chosen last, against each room's full context.
    if (config.resolveDetails) {
        for (const room of rooms) {
            const context = roomContext(dungeon, room);
            room.details = [selectDetail(seed, dressing, context, slots.room.detail(room.id, 0), overrides)];
        }
    }

    return dungeon;
}