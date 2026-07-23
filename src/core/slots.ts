// Slot-id scheme.
// Every generated value has a stable string id (for example "room.3.col.1").
// The overrides map is keyed by these ids, so their exact shape is a contract:
// changing a string here changes which dungeon a saved seed or share link
// reproduces.

// Fixed sections. Each is a base id passed to rollTable, which appends
// `.col.<i>` per column.
export const history = {
    purpose: "history.purpose",
    construction: "history.construction",
    ruination: "history.ruination",
} as const;

export const denizens = {
    attitude: "denizens.attitude",
    standoutNPC: "denizens.standoutNPC",
} as const;

// Per-faction slots, indexed by faction position.
export const faction = {
    group: (i: number) => `faction.${i}.group`,
    strength: (i: number) => `faction.${i}.strength`,
    agenda: (i: number) => `faction.${i}.agenda`,
};

// Per-room slots, indexed by room id.
export const room = {
    base: (id: number) => `room.${id}`, // the room's own table roll
    type: (id: number) => `room.${id}.type`,
    occupant: (id: number) => `room.${id}.occupant`,
    monster: (id: number) => `room.${id}.monster`,
    family: (id: number) => `room.${id}.family`,
    detail: (id: number, n: number) => `room.${id}.detail.${n}`,
};

// One cell within a rolled table, and the base id for that cell's subtable child
export const col = (baseId: string, i: number) => `${baseId}.col.${i}`;
export const subBase = (baseId: string, i: number) => `${col(baseId, i)}.sub`;

// A corridor between two rooms
export const edge = (a: number, b: number) => `edge.${Math.min(a, b)}.${Math.max(a, b)}`;

// Reroll labels
export const reroll = (slotId: string, count: number) =>
    count > 0 ? `${slotId}#${count}` : slotId;

// A reroll label that also carries a retry index, used where selection redraws
// in a loop until the value differs from the previous one.
export const rerollTry = (slotId: string, count: number, t: number) =>
    `${slotId}#${count}.${t}`;