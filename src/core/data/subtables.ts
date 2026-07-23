import type { Subtables } from "../../types/rollTypes.ts";

export const SUBTABLE_ID = {
    mirror: "mirror-details",
    pool: "pool-details",
    statue: "statue-details",
    door: "door-details",
    writing: "writing-details",
    treasure: "treasure-details",
} as const;

// Child tables for Special rooms. A value in the Special table names one of these by id (see SUBTABLE_ROUTES in build-tables).
// First-pass content.
export const subtables: Subtables = {
    [SUBTABLE_ID.mirror]: {
        columns: [
            { label: "Frame", values: ["Iron", "Wood", "Gilded wood", "Silver", "Stone", "Black glass"] },
            { label: "Surface", values: ["Clouded", "Spotless", "Fogged", "Cracked", "Shows the wrong room", "Shows a warped image", "Shows apparitions"] },
        ],
    },
    [SUBTABLE_ID.pool]: {
        columns: [
            { label: "Liquid", values: ["Clear water", "Murky water", "Saltwater", "Black water", "Pus", "Blood", "Oil"] },
            { label: "Depth", values: ["Ankle-deep", "Waist-deep", "Deep"] },
        ],
    },
    [SUBTABLE_ID.statue]: {
        columns: [
            { label: "Subject", values: ["A robed figure", "a snarling beast", "A king", "A many-armed figure", "A weeping woman",
                    "A beautiful man", "A beautiful woman", "A saint", "A war general", "Abstract form", "A warrior"] },
            { label: "Condition", values: ["Weathered smooth", "Defaced", "Pristine", "Toppled", "Cracked", "In pieces", "Moldy"] },
        ],
    },
    [SUBTABLE_ID.door]: {
        columns: [
            { label: "Material", values: ["Iron-banded oak", "Solid bronze", "Bone", "A stone slab", "Wooden planks", "Rotted wooden planks", "Solid iron", "Painted wood"] },
            { label: "Detail", values: ["Barred", "Ajar", "Stuck", "Sealed with wax", "Off its hinges", "Extraordinarily large", "Holes", "Burn marks", "Decorated"] },
        ],
    },
    [SUBTABLE_ID.writing]: {
        columns: [
            { label: "Script", values: ["An unknown tongue", "Common tongue", "Angular runes", "Tally marks", "A child's hand", "Thieves' cant"] },
            { label: "Medium", values: ["Carved", "Painted in soot", "Frantic scratchings", "Dried blood", "Burned", "Ink"] },
        ],
    },
    [SUBTABLE_ID.treasure]: {
        columns: [
            { label: "Form", values: ["Loose coins", "A jeweled reliquary", "Stacked ingots", "A hoard of oddments", "A decorated vase", "Religious relic"] },
            { label: "State", values: ["Dusty and forgotten", "Inside a warding circle", "Trapped", "Fused to the floor", "Hidden under detritus"] },
        ],
    },
};

export const subtableRoutes: Record<string, Record<string, Record<string, string>>> = {
    special: {
        Special: {
            Mirror: SUBTABLE_ID.mirror,
            Pool: SUBTABLE_ID.pool,
            Statue: SUBTABLE_ID.statue,
            Door: SUBTABLE_ID.door,
            Writing: SUBTABLE_ID.writing,
            Treasure: SUBTABLE_ID.treasure,
        },
    },
};