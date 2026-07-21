import type { Detail } from "../../types/rollTypes.ts";

// Sourced/adapted from Tome of Adventure Design.

// The dressing corpus, selected against a room's context (see core/context.ts).
//   - `requires`: suppression. Every tag must be in the context or the entry is
//     ineligible. Used for physical necessity (a chair needs `built`) and strong
//     thematic specificity (egg sacs need `arachnid`).
//   - `affinity`: steering. The entry stays eligible everywhere; each matching
//     tag raises its weight where that tag is present.
//
// Will add new tiers (more denizen families, more purpose tags) as their tags enter the vocabulary.

export const dressing: Detail[] = [
    // --- base tier: fits any room (natural, built, or weird) ---
    { text: "Dried bloodstains", affinity: ["martial"] },
    { text: "A scattering of small animal bones" },
    { text: "Human bones, picked clean", affinity: ["burial"] },
    { text: "A cracked skull", affinity: ["burial"] },
    { text: "Gnawed bones", affinity: ["bestial"] },
    { text: "Cockroaches scattering from the light" },
    { text: "Dead vermin" },
    { text: "Vermin nest tucked into a corner" },
    { text: "Droppings from some large animal", affinity: ["bestial"] },
    { text: "A layer of dust" },
    { text: "Dirt across the floor" },
    { text: "Smeared mud" },
    { text: "A shallow puddle of water" },
    { text: "Water dripping steadily from above" },
    { text: "Damp patches spreading up a wall" },
    { text: "Grey mold" },
    { text: "Clusters of pale mushrooms" },
    { text: "A cold draught" },
    { text: "A faint, sour smell" },
    { text: "Scratch marks" },
    { text: "Claw marks", affinity: ["bestial"] },
    { text: "Scorch marks" },
    { text: "Ash heap" },
    { text: "Charred bone fragments" },
    { text: "A discarded pack, empty" },
    { text: "A single worn boot" },
    { text: "Torn scraps of cloth" },
    { text: "A length of rotted rope" },
    { text: "A snapped length of rusted chain" },
    { text: "A rusted, broken blade", affinity: ["martial"] },
    { text: "Cracked clay pots" },
    { text: "Shattered wooden crates" },
    { text: "Splintered planks in a heap" },
    { text: "Candle stubs" },
    { text: "Streaks of hardened wax" },
    { text: "Loose rubble" },
    { text: "Shards of glass" },
    { text: "Fine grit that crunches underfoot" },
    { text: "A cobweb thick with dust" },
    { text: "An empty flask" },
    { text: "A cluster of crickets" },
    { text: "A colonies of pale mushrooms" },

    // --- construction: built (worked structures) ---
    { text: "A toppled wooden chair", requires: ["built"] },
    { text: "A rotting, faded tapestry", requires: ["built"] },
    { text: "Iron sconces bolted to the wall", requires: ["built"] },
    { text: "A cracked flagstone", requires: ["built"] },
    { text: "A worm-eaten door hanging off one hinge", requires: ["built"] },
    { text: "A fallen iron chandelier", requires: ["built"] },
    { text: "An empty, dust-choked bookshelf", requires: ["built"], affinity: ["scholarly"] },
    { text: "A long banquet table", requires: ["built"] },
    { text: "Braziers of cold ashes", requires: ["built"] },
    { text: "A tarnished mirror in a wooden frame", requires: ["built"] },
    { text: "Stacks of mildewed crates", requires: ["built"] },
    { text: "A stone basin set into the floor", requires: ["built"] },
    { text: "A louse-eaten wooden bench", requires: ["built"] },
    { text: "A soot-stained hearth", requires: ["built"] },
    { text: "A flaking mural", requires: ["built"] },
    { text: "Rows of rusted coat hooks", requires: ["built"] },
    { text: "Copper piping", requires: ["built"]},
    { text: "Animal heads mounted on the wall", requires: ["built"]},

    // --- construction: natural (caves, grown places) ---
    { text: "Stalactites", requires: ["natural"] },
    { text: "A vein of ore", requires: ["natural"], affinity: ["wealth"] },
    { text: "Roots breaking through the ceiling", requires: ["natural"] },
    { text: "A slick of guano across the floor", requires: ["natural"] },
    { text: "Moss carpeting the walls", requires: ["natural"] },
    { text: "A shallow pool fed by seepage", requires: ["natural"] },
    { text: "A small fissure exhaling cold air", requires: ["natural"] },
    { text: "Dried pools", requires: ["natural"] },
    { text: "Large boulders", requires: ["natural"] },
    { text: "Gnarled roots in knots underfoot", requires: ["natural"] },
    { text: "Damp sand carpeting the floor", requires: ["natural"] },

    // --- construction: weird (bone, flesh, ethereal, shadow, floating) ---
    { text: "Walls vibrate", requires: ["weird"] },
    { text: "Floor ripples slightly", requires: ["weird"] },
    { text: "A steady rhythm of a heartbeat", requires: ["weird"] },
    { text: "Shimmering light with no source", requires: ["weird"] },
    { text: "Stone shards levitating in the air", requires: ["weird"] },
    { text: "A faint, brassy tone", requires: ["weird"] },
    { text: "Pools of blood", requires: ["weird"] },

    // --- denizen: arachnid ---
    { text: "Thick webbing strung across corners", requires: ["arachnid"], affinity: ["arachnid"] },
    { text: "Clusters of egg sacs", requires: ["arachnid"], affinity: ["arachnid"] },
    { text: "Wrapped web-sacks", requires: ["arachnid"], affinity: ["arachnid"] },
    { text: "Silk-bound bundles hanging from above", requires: ["arachnid"], affinity: ["arachnid"] },
    { text: "A carpet of web underfoot", requires: ["arachnid"], affinity: ["arachnid"] },
    { text: "The molted skin of a large spider", requires: ["arachnid"], affinity: ["arachnid"] },
    { text: "Prey cocooned in a niche", requires: ["arachnid"], affinity: ["arachnid"] },
    { text: "Silk-strands crisscross the area", requires: ["arachnid"], affinity: ["arachnid"] },

    // --- denizen: undead ---
    { text: "Grave-dust across the floor", requires: ["undead"], affinity: ["undead"] },
    { text: "Scratched coffin lids", requires: ["undead"], affinity: ["undead"] },
    { text: "Withered wreaths", requires: ["undead"], affinity: ["undead"] },
    { text: "A reek of rot and decay", requires: ["undead"], affinity: ["undead"] },

    // --- purpose: sacred ---
    { text: "Am altar stone", requires: ["sacred"], affinity: ["sacred"] },
    { text: "A row of guttered votive candles", requires: ["sacred"], affinity: ["sacred"] },
    { text: "A prayer scratched into stone", requires: ["sacred"], affinity: ["sacred"] },
    { text: "A niche with an idol", requires: ["sacred"], affinity: ["sacred"] },
    { text: "Prayer beads scattered across the floor", requires: ["sacred"], affinity: ["sacred"] },
    { text: "A censer on a chain", requires: ["sacred"], affinity: ["sacred"] },

    // --- purpose: arcane ---
    { text: "Half-scuffed chalk sigils", requires: ["arcane"], affinity: ["arcane"] },
    { text: "A circle of black candles", requires: ["arcane"], affinity: ["arcane"] },
    { text: "Glass vessels crusted with dried residue", requires: ["arcane"], affinity: ["arcane"] },
    { text: "A slate covered in frantic equations", requires: ["arcane"], affinity: ["arcane", "scholarly"] },
    { text: "Salt poured in a broken warding line", requires: ["arcane"], affinity: ["arcane"] },
];