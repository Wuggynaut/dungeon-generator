import type { Family } from "../../types/rollTypes.ts";

// The bestiary: families of creatures, each holding the species that belong to it.

export const bestiary: Family[] = [
    { name: "Avian", tags: [], species: [{ name: "Phoenix", tags: [] }, { name: "Roc", tags: [] }, { name: "Wyvern", tags: [] }] },
    { name: "Beast", tags: [], species: [{ name: "Blood Elk", tags: [] }, { name: "Grizzly Bear", tags: [] }, { name: "Killer Bees", tags: [] }, { name: "Night Cat", tags: [] }, { name: "Viper", tags: [] }, { name: "Wolf", tags: [] }] },
    { name: "Behemoth", tags: [], species: [{ name: "Green Dragon", tags: [] }, { name: "Purple Worm", tags: [] }] },
    { name: "Construct", tags: [], species: [{ name: "Bone Construct", tags: [] }, { name: "Cobblehounds", tags: [] }, { name: "Gargoyle", tags: [] }] },
    { name: "Demon", tags: [], species: [{ name: "Hellhound", tags: [] }, { name: "Nightmare", tags: [] }] },
    { name: "Extraplanar", tags: [], species: [{ name: "Eye of Terror", tags: [] }, { name: "Mind Lasher", tags: [] }] },
    { name: "Fey", tags: [], species: [{ name: "Boggart", tags: [] }, { name: "Dryad", tags: [] }, { name: "Frost Elf", tags: [] }, { name: "Pixie", tags: [] }, { name: "Red Cap", tags: [] }, { name: "Night Hag", tags: [] }, { name: "Sea Hag", tags: [] }, { name: "Will-o-Wisp", tags: [] }] },
    { name: "Giant", tags: [], species: [{ name: "Ettin", tags: [] }, { name: "Sky Giant", tags: [] }, { name: "Storm Giant", tags: [] }, { name: "Titan", tags: [] }] },
    { name: "Goblinoid", tags: [], species: [{ name: "Bugbear", tags: [] }, { name: "Goblin", tags: [] }, { name: "Hobgoblin", tags: [] }, { name: "Ogre", tags: [] }, { name: "Root Goblin", tags: [] }, { name: "Troll", tags: [] }, { name: "Wood Troll", tags: [] }] },
    { name: "Humanoid", tags: [], species: [{ name: "Acolyte", tags: [] }, { name: "Bandit", tags: [] }, { name: "Gnoll", tags: [] }, { name: "Hooded Men", tags: [] }, { name: "Triton", tags: [] }] },
    { name: "Hybrid", tags: [], species: [{ name: "Centaur", tags: [] }, { name: "Manticore", tags: [] }, { name: "Minotaur", tags: [] }, { name: "Owlbear", tags: [] }] },
    { name: "Incorporeal", tags: [], species: [{ name: "Invisible Stalker", tags: [] }, { name: "Shadow", tags: [] }] },
    { name: "Insectoid", tags: [], species: [{ name: "Aranea", tags: [] }, { name: "Burrowing Horror", tags: [] }, { name: "Cave Locust", tags: [] }, { name: "Giant Scorpion", tags: [] }] },
    { name: "Lizard", tags: [], species: [{ name: "Basilisk", tags: [] }, { name: "Hydra", tags: [] }, { name: "Kobold", tags: [] }, { name: "Naga", tags: [] }, { name: "Reptilian", tags: [] }] },
    { name: "Magical", tags: [], species: [{ name: "Blink Dog", tags: [] }, { name: "Warp Panther", tags: [] }, { name: "Water Elemental", tags: [] }] },
    { name: "Mythical", tags: [], species: [{ name: "Banshee", tags: [] }, { name: "Griffon", tags: [] }, { name: "Harpy", tags: [] }, { name: "Hydra", tags: [] }, { name: "Lamia", tags: [] }, { name: "Unicorn", tags: [] }] },
    { name: "Plant", tags: [], species: [{ name: "Creeping Vines", tags: [] }, { name: "Root Witch", tags: [] }, { name: "Shambling Mound", tags: [] }, { name: "Treant", tags: [] }] },
    { name: "Shape Shifter", tags: [], species: [{ name: "Swine Thing", tags: [] }, { name: "Werewolf", tags: [] }] },
    { name: "Undead", tags: [], species: [{ name: "Crypt Guardian", tags: [] }, { name: "Ghost", tags: [] }, { name: "Ghoul", tags: [] }, { name: "Lich", tags: [] }, { name: "Mummy", tags: [] }, { name: "Skeleton", tags: [] }, { name: "Vampire", tags: [] }, { name: "Wight", tags: [] }, { name: "Zombie", tags: [] }] },
    { name: "Unusual", tags: [], species: [{ name: "Gelatinous Ooze", tags: [] }, { name: "Mimic", tags: [] }, { name: "Rust Monster", tags: [] }, { name: "Warrior Snail", tags: [] }] },
];

// Derived lookups. These follow `bestiary`; do not edit them by hand.
export const groupNames: string[] = bestiary.map(f => f.name);

export const familyByName: Record<string, Family> =
    Object.fromEntries(bestiary.map(f => [f.name, f]));

// Species names only, keyed by family. Used to roll a species: the roll stores a
// name string, and tags are looked up from `familyByName` at read time.
export const monstersByGroup: Record<string, string[]> =
    Object.fromEntries(bestiary.map(f => [f.name, f.species.map(s => s.name)]));