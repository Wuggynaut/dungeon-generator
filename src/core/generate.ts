import type {Denizens, Dungeon, Faction, History} from "../types.ts";
import {makeChildRng, type Rng} from "./rng.ts";
import {rollSlots} from "./rolls.ts";
import {agendas, construction, purpose, ruination, traits} from "./tables.ts";

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

export function generate(seed: string, factionCount = 2): Dungeon {
    const history = generateHistory(makeChildRng(seed, "history"));
    const denizens = generateDenizens(makeChildRng(seed, "denizens"));
    const factions = generateFactions(makeChildRng(seed, "factions"), factionCount);
    return {
        seed,
        history,
        denizens,
        factions,
    }
}