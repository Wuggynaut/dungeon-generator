import type { Subtables } from "../../types/rollTypes.ts";

// Child tables for Special rooms. A value in the Special table names one of these by id (see SUBTABLE_ROUTES in build-tables).
// First-pass content.
export const subtables: Subtables = {
    "mirror-details": {
        columns: [
            { label: "Frame", values: ["iron", "wood", "gilded wood", "silver", "stone", "black glass"] },
            { label: "Surface", values: ["clouded", "spotless", "fogged", "webbed with cracks", "showing the wrong room", "shows a warped image", "shows apparitions"] },
        ],
    },
    "pool-details": {
        columns: [
            { label: "Liquid", values: ["clear water", "murky water", "saltwater", "black water", "pus", "blood", "oil"] },
            { label: "Depth", values: ["ankle-deep", "waist-deep", "deep"] },
        ],
    },
    "statue-details": {
        columns: [
            { label: "Subject", values: ["a robed figure", "a snarling beast", "a king", "a many-armed person", "a weeping woman",
                    "a beautiful man", "a beautiful woman", "a saint", "a holy figure", "a war general", "abstract form", "a warrior"] },
            { label: "Condition", values: ["weathered smooth", "defaced", "pristine", "toppled", "cracked", "in pieces"] },
        ],
    },
    "door-details": {
        columns: [
            { label: "Material", values: ["iron-banded oak", "solid bronze", "bone", "a stone slab", "rotted planks", "solid iron", "painted wood"] },
            { label: "Detail", values: ["barred", "ajar", "sealed with wax", "off its hinges", "extraordinarily large", "holes", "burn marks", "decorated"] },
        ],
    },
    "writing-details": {
        columns: [
            { label: "Script", values: ["an unknown tongue", "common tongue", "angular runes", "tally marks", "a child's hand", "thieves' cant"] },
            { label: "Medium", values: ["carved", "painted in soot", "frantic scratchings", "dried blood", "burned"] },
        ],
    },
    "treasure-details": {
        columns: [
            { label: "Form", values: ["loose coins", "a jeweled reliquary", "stacked ingots", "a hoard of oddments", "a decorated vase", "religious relic"] },
            { label: "State", values: ["dusty and forgotten", "inside a warding circle", "trapped", "fused to the floor", "hidden under detritus"] },
        ],
    },
};