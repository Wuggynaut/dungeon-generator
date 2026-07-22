// AUTO-GENERATED from Dungeon_Seeds.md by build-tables.ts. Do not edit by hand.
import type { Table, RoomType } from "../../types/rollTypes.ts";

export const purpose: Table = {
    columns: [
        { label: "Original Use", values: { ref: "purpose.uses" } },
        { label: "Built By", values: ["A Fallen Hero", "A Fanatical Cult", "A Forgotten Empire", "A Long-Dead Poet", "A Militant Order", "A Renowned Alchemist", "A Royal Dynasty", "A Secret Society", "A Tyrannical Ruler", "A Warrior Tribe", "A Wealthy Recluse", "Desperate Rebels", "Heretical Alchemists", "Heretical Monks", "Immoral Sorcerers", "Inverted Astrologers", "Mob Families", "Opulent Merchants", "Pilgrims to a Dead God", "Rogue Scholars"] },
    ],
};

export const construction: Table = {
    columns: [
        { label: "Entrance", values: ["A Creature's Lair", "A Dream", "A Massive Tree", "A Well", "An Enormous Grave", "Behind a Waterfall", "Between Menhirs", "Cave", "Center of a Maze", "Cliff door", "Hollow Statue", "Illusory Wall", "Mine Shaft", "Sinking Sand", "Skyward Beam of Light", "Starlight Path", "Through a Painting", "Under a Bridge", "Underwater Tunnel", "Veil of Mist"] },
        { label: "Composition", values: { ref: "construction.kinds" } },
    ],
};

export const ruination: Table = {
    columns: [
        { label: "Condition", values: ["Corpse", "Crumbling", "Cursed", "Desecrated", "Devoured", "Displaced", "Divided", "Frozen", "Haunted", "Infested", "Overgrown", "Overpopulated", "Petrified", "Plundered", "Poisoned", "Scorched", "Shrouded in Mist", "Submerged", "Unending", "Warped"] },
        { label: "Cause", values: ["Alchemical Accident", "Ancient Curse", "Cataclysmic Flood", "Civil War", "Competing Rituals", "Consumed by a Beast", "Disease", "Hedonism", "Invasion", "Long-Term Abandonment", "Magic Gone Awry", "Magical Seal", "Natural Disaster", "Natural Erosion", "Obfuscation", "Overrun with Monsters", "Sudden Change in Climate", "Teleported to Another Realm", "Turned to Stone", "Unresolved Spirits"] },
    ],
};

export const traits: Table = {
    columns: [
        { label: "Virtues", values: ["Compassionate", "Courageous", "Creative", "Deductive", "Honest", "Incisive", "Incorruptible", "Individualistic", "Loyal", "Methodical", "Polite", "Practical", "Resilient", "Scholarly", "Self-Sufficient", "Solid", "Studious", "Suave", "Unwavering", "Witty"] },
        { label: "Vices", values: ["Absent-Minded", "Aloof", "Critical", "Cynical", "Greedy", "Impulsive", "Inflexible", "Naive", "Obstinate", "Passive", "Pedantic", "Perfectionist", "Sarcastic", "Selfish", "Skeptical", "Stubborn", "Superficial", "Unfocused", "Unimaginative", "Vain"] },
    ],
};

export const agendas: Table = {
    columns: [
        { label: "Goal", values: ["Ascension", "Creation", "Destruction", "Dominion", "Enlightenment", "Exploration", "Growth", "Innovation", "Justice", "Knowledge", "Liberation", "Peace", "Power", "Preservation", "Protection", "Redemption", "Revenge", "Survival", "Transformation", "Wealth"] },
        { label: "Obstacle", values: ["Conflict", "Corruption", "Cost", "Danger", "Decay", "Discord", "Division", "Dogma", "Exposure", "Factionalism", "Fear", "Ignorance", "Incompetence", "Injustice", "Isolation", "Opposition", "Sacrifice", "Stagnation", "Tradition", "Weakness"] },
    ],
};

export const monster: Table = {
    columns: [
        { label: "Activity", values: ["Building", "Devouring", "Dying", "Fighting", "Growing", "Haunting", "Hiding", "Killing", "Mating", "Mourning", "Patrolling", "Praying", "Protecting", "Recuperating", "Scheming", "Sleeping", "Stalking", "Torturing", "Training", "Trapped"] },
    ],
};

export const lore: Table = {
    columns: [
        { label: "Room Type", values: ["Armory", "Barracks", "Bath", "Cistern", "Court", "Crypt", "Den", "Dining Hall", "Guard Post", "Infirmary", "Kitchen", "Latrine", "Library", "Shrine", "Smith", "Stable", "Storage", "Study", "Vault", "Workshop"] },
        { label: "Clue", values: ["Decay", "Decor", "Draft", "Echoes", "Footprints", "Leavings", "Light", "Markings", "Moisture", "Noise", "Paraphernalia", "Residue", "Scurrying", "Signs", "Smell", "Stains", "Tapping", "Temperature", "Vibrations", "Writing"] },
    ],
};

export const special: Table = {
    columns: [
        { label: "Special", values: ["Books", "Bridge", "Contraption", "Creature", { value: "Door", subtable: "door-details" }, "Flames", "Furniture", "Hole", "Liquid", { value: "Mirror", subtable: "mirror-details" }, "Mural", { value: "Pool", subtable: "pool-details" }, "Shadows", "Smoke", { value: "Statue", subtable: "statue-details" }, "Surface", { value: "Treasure", subtable: "treasure-details" }, "Voices", "Wheel", { value: "Writing", subtable: "writing-details" }] },
        { label: "Feature", values: ["Ages", "Alarms", "Animates", "Attracts", "Charges", "Closes", "Falls", "Glows", "Grows", "Illusion", "Levitates", "Locks", "Opens", "Reflects", "Repels", "Reveals", "Shifts", "Silences", "Teleport", "Transforms"] },
    ],
};

export const trap: Table = {
    columns: [
        { label: "Trap", values: ["Ages", "Burns", "Captures", "Carries", "Confuses", "Crushes", "Curses", "Cuts", "Deafens", "Drops", "Drowns", "Freezes", "Glues", "Hypnotizes", "Impales", "Infects", "Lifts", "Poisons", "Shocks", "Shoots"] },
        { label: "Trigger", values: ["Activating", "Breaking", "Crossing", "Disturbing", "Entering", "Extinguishing", "Focusing", "Interacting", "Lighting", "Moving", "Opening", "Pulling", "Pushing", "Reading", "Speaking", "Stepping", "Taking", "Talking", "Touching", "Tripping"] },
    ],
};

// Default room-type pool. Weight = faces on the die; total weight is the die size.
export const defaultRoomTypes: RoomType[] = [
    { name: "Monster", weight: 1, table: monster },
    { name: "Lore", weight: 2, table: lore },
    { name: "Special", weight: 1, table: special },
    { name: "Trap", weight: 2, table: trap },
];