import type { Denizens, Dungeon, Faction, History, Overrides, PairedTable, Room, RoomType } from "../types/rollTypes.ts";
import {makeChildRng, pickWeighted, type Rng} from "./rng.ts";
import { rollSlots, rollOne } from "./rolls.ts";
import {groupNames, monstersByGroup} from "./data/monsters.ts";
import { type Config, defaultConfig, type Tables } from "./config.ts";
import { generateMap } from "./map.ts";
import {dressing} from "./data/dressing.ts";

const MAX_TYPE_REROLL_TRIES = 50;
const UNALIGNED_WEIGHT = 1; // How likely a monster room belongs to no faction, relative to one faction's strength

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

const FACTION_STRENGTH_SIDES = 3; // strength is 1..3; it weights room occupancy and names the dominant denizen

function generateFactions(seed: string, agendas: PairedTable, count: number, overrides: Overrides): Faction[] {
    const factions: Faction[] = [];
    for (let i = 0; i < count; i++) {
        const group = rollOne(seed, groupNames, `faction.${i}.group`, overrides);
        const roster = monstersByGroup[group.value] ?? [];
        const species = rollOne(seed, roster, `faction.${i}.species`, overrides);
        const strength = makeChildRng(seed, `faction.${i}.strength`).die(FACTION_STRENGTH_SIDES);
        factions.push({
            group,
            species,
            strength,
            agenda: rollSlots(seed, agendas, `faction.${i}.agenda`, overrides),
        });
    }
    return factions;
}

// The strongest faction; its species is the fallback denizen for unaligned rooms.
// Ties resolve to the lowest index so the result stays deterministic.
export function dominantFactionIndex(factions: Faction[]): number | null {
    if (factions.length === 0) return null;
    let best = 0;
    for (let i = 1; i < factions.length; i++) {
        if (factions[i].strength > factions[best].strength) best = i;
    }
    return best;
}

// Returns a faction index, or null for the unaligned remainder.
function sampleOccupantIndex(
    seed: string,
    roomId: number,
    factions: Faction[],
    count: number,
): number | null {
    const label = count > 0 ? `room.${roomId}.occupant#${count}` : `room.${roomId}.occupant`;
    const rng = makeChildRng(seed, label);

    const total = factions.reduce((sum, f) => sum + f.strength, 0) + UNALIGNED_WEIGHT;
    let r = rng.int(total);
    for (let i = 0; i < factions.length; i++) {
        if (r < factions[i].strength) return i;
        r -= factions[i].strength;
    }
    return null; // fell into the unaligned slice
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
        const roll = rollSlots(seed, rt.table, `room.${id}`, overrides);
        const room: Room = { id, type: rt.name, roll };

        // Only the monster table produces known group names in its left column.
        const isMonsterRoom = monstersByGroup[roll.left.value] !== undefined;
        if (isMonsterRoom) {
            const leftOverride = overrides[`room.${id}.left`];
            // A hand-typed group wins outright; otherwise the occupant decides.
            if (leftOverride?.editValue === undefined) {
                const rerollCount = leftOverride?.rerollCount ?? 0;
                const idx = sampleOccupantIndex(seed, id, factions, rerollCount);
                if (idx !== null) {
                    roll.left.value = factions[idx].group.value;  // inherit the faction's group
                    room.occupantFaction = idx;
                }
                // idx === null -> unaligned, leave the normally-rolled group in place
            }
            const roster = monstersByGroup[roll.left.value];
            if (roster) {
                room.monster = rollOne(seed, roster, `room.${id}.monster`, overrides);
            }
        }
        // One base-tier dressing line per room (blind roll for now).
        room.details = [rollOne(seed, dressing, `room.${id}.detail.0`, overrides)];

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

    return { seed, history, denizens, factions, rooms, map };
}