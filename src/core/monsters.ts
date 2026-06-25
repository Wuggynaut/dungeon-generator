export const monstersByGroup: Record<string, string[]> = {
    Avian: ["Phoenix", "Roc", "Wyvern"],
    Beast: ["Blood Elk", "Grizzly Bear", "Killer Bees", "Night Cat", "Viper", "Wolf"],
    Behemoth: ["Green Dragon", "Purple Worm"],
    Construct: ["Bone Construct", "Cobblehounds", "Gargoyle"],
    Demon: ["Hellhound", "Nightmare"],
    Extraplanar: ["Eye of Terror", "Mind Lasher"],
    Fey: ["Boggart", "Dryad", "Frost Elf", "Pixie", "Red Cap", "Night Hag", "Sea Hag", "Will-o-Wisp"],
    Giant: ["Ettin", "Sky Giant", "Storm Giant", "Titan"],
    Goblinoid: ["Bugbear", "Goblin", "Hobgoblin", "Ogre", "Root Goblin", "Troll", "Wood Troll"],
    Humanoid: ["Acolyte", "Bandit", "Gnoll", "Hooded Men", "Triton"],
    Hybrid: ["Centaur", "Manticore", "Minotaur", "Owlbear"],
    Incorporeal: ["Invisible Stalker", "Shadow"],
    Insectoid: ["Aranea", "Burrowing Horror", "Cave Locust", "Giant Scorpion"],
    Lizard: ["Basilisk", "Hydra", "Kobold", "Naga", "Reptilian"],
    Magical: ["Blink Dog", "Warp Panther", "Water Elemental"],
    Mythical: ["Banshee", "Griffon", "Harpy", "Hydra", "Lamia", "Unicorn"],
    Plant: ["Creeping Vines", "Root Witch", "Shambling Mound", "Treant"],
    "Shape Shifter": ["Swine Thing", "Werewolf"],
    Undead: ["Crypt Guardian", "Ghost", "Ghoul", "Lich", "Mummy", "Skeleton", "Vampire", "Wight", "Zombie"],
    Unusual: ["Gelatinous Ooze", "Mimic", "Rust Monster", "Warrior Snail"],
};

export const groupNames: string[] = Object.keys(monstersByGroup);