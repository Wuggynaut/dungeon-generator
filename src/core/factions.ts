import type { Faction } from "../types/rollTypes.ts";

// The strongest faction; its family is the fallback denizen for rooms with no
// occupant of their own. Ties resolve to the lowest index.
export function dominantFactionIndex(factions: Faction[]): number | null {
    if (factions.length === 0) return null;
    let best = 0;
    for (let i = 1; i < factions.length; i++) {
        if (factions[i].strength > factions[best].strength) best = i;
    }
    return best;
}