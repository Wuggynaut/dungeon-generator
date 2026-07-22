import type { Subtables } from "../../types/rollTypes.ts";

// Child tables for Special rooms. A value in the Special table names one of these by id (see SUBTABLE_ROUTES in build-tables).
// First-pass content.
export const subtables: Subtables = {
    "mirror-details": {
        columns: [
            { label: "Frame", values: ["Iron", "Wood", "Gilded wood", "Silver", "Stone", "Black glass"] },
            { label: "Surface", values: ["Clouded", "Spotless", "Fogged", "Cracked", "Shows the wrong room", "Shows a warped image", "Shows apparitions"] },
        ],
    },
    "pool-details": {
        columns: [
            { label: "Liquid", values: ["Clear water", "Murky water", "Saltwater", "Black water", "Pus", "Blood", "Oil"] },
            { label: "Depth", values: ["Ankle-deep", "Waist-deep", "Deep"] },
        ],
    },
    "statue-details": {
        columns: [
            { label: "Subject", values: ["A robed figure", "a snarling beast", "A king", "A many-armed figure", "A weeping woman",
                    "A beautiful man", "A beautiful woman", "A saint", "A war general", "Abstract form", "A warrior"] },
            { label: "Condition", values: ["Weathered smooth", "Defaced", "Pristine", "Toppled", "Cracked", "In pieces", "Moldy"] },
        ],
    },
    "door-details": {
        columns: [
            { label: "Material", values: ["Iron-banded oak", "Solid bronze", "Bone", "A stone slab", "Wooden planks", "Rotted wooden planks", "Solid iron", "Painted wood"] },
            { label: "Detail", values: ["Barred", "Ajar", "Stuck", "Sealed with wax", "Off its hinges", "Extraordinarily large", "Holes", "Burn marks", "Decorated"] },
        ],
    },
    "writing-details": {
        columns: [
            { label: "Script", values: ["An unknown tongue", "Common tongue", "Angular runes", "Tally marks", "A child's hand", "Thieves' cant"] },
            { label: "Medium", values: ["Carved", "Painted in soot", "Frantic scratchings", "Dried blood", "Burned", "Ink"] },
        ],
    },
    "treasure-details": {
        columns: [
            { label: "Form", values: ["Loose coins", "A jeweled reliquary", "Stacked ingots", "A hoard of oddments", "A decorated vase", "Religious relic"] },
            { label: "State", values: ["Dusty and forgotten", "Inside a warding circle", "Trapped", "Fused to the floor", "Hidden under detritus"] },
        ],
    },
};