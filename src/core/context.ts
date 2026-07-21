import type { Dungeon, Faction, Room } from "../types/rollTypes.ts";
import { familyByName } from "./data/monsters.ts";
import { kindOf } from "./data/constructionKind.ts";
import { tagsForPurpose } from "./data/purposeTags.ts";

export function dominantFactionIndex(factions: Faction[]): number | null {
    if (factions.length === 0) return null;
    let best = 0;
    for (let i = 1; i < factions.length; i++) {
        if (factions[i].strength > factions[best].strength) best = i;
    }
    return best;
}

export function roomContext(dungeon: Dungeon, room: Room): Set<string> {
    const ctx = new Set<string>();

    ctx.add(kindOf(dungeon.history.construction.cells[1].value));

    for (const tag of tagsForPurpose(dungeon.history.purpose.cells[0].value)) {
        ctx.add(tag);
    }

    let family: string | undefined;
    let species: string | undefined;
    if (room.family) {
        family = room.family;            // a monster room: use its actual creature
        species = room.monster?.value;
    } else {
        const dom = dominantFactionIndex(dungeon.factions);
        if (dom !== null) family = dungeon.factions[dom].group.value;
    }

    const fam = family ? familyByName[family] : undefined;
    if (fam) {
        for (const tag of fam.tags) ctx.add(tag);
        const sp = species ? fam.species.find(s => s.name === species) : undefined;
        if (sp) for (const tag of sp.tags) ctx.add(tag);
    }

    return ctx;
}