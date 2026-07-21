import type { Family } from "../../types/rollTypes.ts";

// New family-based bestiary: A family is a set of creatures that could plausibly
// band together or share a lair. Solitary creatures are families of one.
// Family.tags apply to every member; Species.tags distinguish a member.

export const bestiary: Family[] = [
    { name: "Goblinoid", tags: ["goblinoid", "savage"], species: [{ name: "Bugbear", tags: [] }, { name: "Goblin", tags: [] }, { name: "Hobgoblin", tags: [] }, { name: "Ogre", tags: [] }, { name: "Root Goblin", tags: ["forest"] }, { name: "Troll", tags: ["regenerating"] }, { name: "Wood Troll", tags: ["forest", "regenerating"] }] },
    { name: "Undead", tags: ["undead"], species: [{ name: "Skeleton", tags: [] }, { name: "Zombie", tags: [] }, { name: "Ghoul", tags: [] }, { name: "Wight", tags: [] }, { name: "Mummy", tags: [] }, { name: "Vampire", tags: [] }, { name: "Lich", tags: ["spellcaster"] }, { name: "Crypt Guardian", tags: ["guardian"] }, { name: "Ghost", tags: ["spectral", "incorporeal"] }, { name: "Banshee", tags: ["spectral", "incorporeal"] }, { name: "Shadow", tags: ["spectral", "incorporeal"] }] },
    { name: "Construct", tags: ["construct", "artificial"], species: [{ name: "Bone Construct", tags: [] }, { name: "Cobblehounds", tags: [] }, { name: "Gargoyle", tags: [] }] },
    { name: "Vermin", tags: ["arthropod", "vermin"], species: [{ name: "Burrowing Horror", tags: ["burrower"] }, { name: "Cave Locust", tags: ["swarm"] }, { name: "Giant Scorpion", tags: ["venomous"] }] },
    { name: "Arachnid", tags: ["arthropod", "arachnid"], species: [{ name: "Aranea", tags: ["shapeshifter", "web-builder"] }] },
    { name: "Fey", tags: ["fey"], species: [{ name: "Boggart", tags: ["shapeshifter"] }, { name: "Pixie", tags: [] }, { name: "Red Cap", tags: ["savage"] }, { name: "Will-o-Wisp", tags: ["spectral"] }, { name: "Dryad", tags: ["plant", "forest"] }] },
    { name: "Hags", tags: ["fey", "hag"], species: [{ name: "Night Hag", tags: ["fiend"] }, { name: "Sea Hag", tags: ["aquatic"] }] },
    { name: "Humanfolk", tags: ["humanoid"], species: [{ name: "Acolyte", tags: ["spellcaster"] }, { name: "Bandit", tags: [] }, { name: "Hooded Men", tags: ["cultist"] }] },
    { name: "Giant", tags: ["giant"], species: [{ name: "Ettin", tags: [] }, { name: "Sky Giant", tags: [] }, { name: "Storm Giant", tags: ["cold"] }] },
    { name: "Plant", tags: ["plant", "forest"], species: [{ name: "Creeping Vines", tags: [] }, { name: "Root Witch", tags: ["fey"] }, { name: "Shambling Mound", tags: [] }, { name: "Treant", tags: [] }] },
    { name: "Shapeshifter", tags: ["shapeshifter"], species: [{ name: "Swine Thing", tags: [] }, { name: "Werewolf", tags: ["beast"] }] },
    { name: "Elemental", tags: ["elemental"], species: [{ name: "Water Elemental", tags: ["aquatic"] }, { name: "Invisible Stalker", tags: ["air", "incorporeal"] }] },
    { name: "Aberration", tags: ["aberration"], species: [{ name: "Eye of Terror", tags: [] }, { name: "Mind Lasher", tags: ["psionic"] }] },
    { name: "Fiend", tags: ["fiend", "infernal"], species: [{ name: "Hellhound", tags: ["fire"] }, { name: "Nightmare", tags: ["fire"] }] },
    // solitary families (one species each)
    { name: "Phoenix", tags: ["avian", "winged", "fire", "mythic"], species: [{ name: "Phoenix", tags: [] }] },
    { name: "Roc", tags: ["avian", "winged", "giant"], species: [{ name: "Roc", tags: [] }] },
    { name: "Wyvern", tags: ["avian", "winged", "draconic"], species: [{ name: "Wyvern", tags: [] }] },
    { name: "Grizzly Bear", tags: ["beast"], species: [{ name: "Grizzly Bear", tags: [] }] },
    { name: "Night Cat", tags: ["beast"], species: [{ name: "Night Cat", tags: [] }] },
    { name: "Viper", tags: ["beast", "serpentine"], species: [{ name: "Viper", tags: [] }] },
    { name: "Blood Elk", tags: ["beast"], species: [{ name: "Blood Elk", tags: [] }] },
    { name: "Killer Bees", tags: ["beast", "swarm", "arthropod"], species: [{ name: "Killer Bees", tags: [] }] },
    { name: "Wolf", tags: ["beast", "pack"], species: [{ name: "Wolf", tags: [] }] },
    { name: "Green Dragon", tags: ["draconic", "colossal", "mythic"], species: [{ name: "Green Dragon", tags: [] }] },
    { name: "Purple Worm", tags: ["colossal", "burrower"], species: [{ name: "Purple Worm", tags: [] }] },
    { name: "Titan", tags: ["giant", "divine", "mythic"], species: [{ name: "Titan", tags: [] }] },
    { name: "Frost Elf", tags: ["fey", "cold", "humanoid"], species: [{ name: "Frost Elf", tags: [] }] },
    { name: "Gnoll", tags: ["humanoid", "savage", "pack"], species: [{ name: "Gnoll", tags: [] }] },
    { name: "Triton", tags: ["humanoid", "aquatic"], species: [{ name: "Triton", tags: [] }] },
    { name: "Centaur", tags: ["hybrid", "humanoid"], species: [{ name: "Centaur", tags: [] }] },
    { name: "Manticore", tags: ["hybrid", "beast", "winged"], species: [{ name: "Manticore", tags: [] }] },
    { name: "Minotaur", tags: ["hybrid", "savage"], species: [{ name: "Minotaur", tags: [] }] },
    { name: "Owlbear", tags: ["hybrid", "beast"], species: [{ name: "Owlbear", tags: [] }] },
    { name: "Basilisk", tags: ["reptilian", "beast", "petrifying", "mythic"], species: [{ name: "Basilisk", tags: [] }] },
    { name: "Hydra", tags: ["reptilian", "serpentine", "mythic"], species: [{ name: "Hydra", tags: [] }] },
    { name: "Kobold", tags: ["reptilian", "draconic", "humanoid"], species: [{ name: "Kobold", tags: [] }] },
    { name: "Naga", tags: ["reptilian", "serpentine"], species: [{ name: "Naga", tags: [] }] },
    { name: "Reptilian", tags: ["reptilian", "humanoid"], species: [{ name: "Reptilian", tags: [] }] },
    { name: "Blink Dog", tags: ["beast", "fey", "teleporter", "pack"], species: [{ name: "Blink Dog", tags: [] }] },
    { name: "Warp Panther", tags: ["beast", "teleporter"], species: [{ name: "Warp Panther", tags: [] }] },
    { name: "Griffon", tags: ["avian", "winged", "beast", "mythic"], species: [{ name: "Griffon", tags: [] }] },
    { name: "Harpy", tags: ["avian", "winged", "mythic"], species: [{ name: "Harpy", tags: [] }] },
    { name: "Lamia", tags: ["monstrous", "mythic"], species: [{ name: "Lamia", tags: [] }] },
    { name: "Unicorn", tags: ["beast", "fey", "mythic"], species: [{ name: "Unicorn", tags: [] }] },
    { name: "Gelatinous Ooze", tags: ["ooze", "mindless"], species: [{ name: "Gelatinous Ooze", tags: [] }] },
    { name: "Mimic", tags: ["aberration", "shapeshifter", "ambusher"], species: [{ name: "Mimic", tags: [] }] },
    { name: "Rust Monster", tags: ["aberration", "vermin"], species: [{ name: "Rust Monster", tags: [] }] },
    { name: "Warrior Snail", tags: ["beast", "armored"], species: [{ name: "Warrior Snail", tags: [] }] },
];

export const groupNames: string[] = bestiary.map(f => f.name);

export const familyByName: Record<string, Family> =
    Object.fromEntries(bestiary.map(f => [f.name, f]));

export const monstersByGroup: Record<string, string[]> =
    Object.fromEntries(bestiary.map(f => [f.name, f.species.map(s => s.name)]));