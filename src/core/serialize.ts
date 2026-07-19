import type {Dungeon, Roll} from "../types/rollTypes.ts";
import type {PathType} from "../types/mapTypes.ts";
import {dominantFactionIndex} from "./generate.ts";

type Notes = Record<string, string>;

function rollLine(label: string, r: Roll): string {
    return `- **${label}** — ${r.columns[0]}: ${r.left.value}; ${r.columns[1]}: ${r.right.value}`;
}

function noteBlock(notes: Notes, key: string): string {
    const text = notes[key]?.trim();
    if (!text) return "";
    return text.split("\n").map(line => `> ${line}`).join("\n");
}

function section(heading: string, prompt: string, bullets: string[], note: string): string {
    const parts = [`## ${heading}`, `*${prompt}*`, bullets.join("\n")];
    if (note) parts.push(note);
    return parts.join("\n\n");
}

function roomsSection(dungeon: Dungeon): string {
    // roomId → display number, taken from the map's BFS numbering
    const numberOf = new Map<number, number>();
    for (const node of dungeon.map.nodes) numberOf.set(node.roomId, node.number);

    // roomId → list of {number, pathType} for everything it connects to
    const neighbours = new Map<number, { number: number; type: PathType }[]>();
    for (const room of dungeon.rooms) neighbours.set(room.id, []);
    for (const edge of dungeon.map.edges) {
        neighbours.get(edge.a)!.push({ number: numberOf.get(edge.b)!, type: edge.type });
        neighbours.get(edge.b)!.push({ number: numberOf.get(edge.a)!, type: edge.type });
    }

    const ordered = [...dungeon.rooms].sort(
        (a, b) => numberOf.get(a.id)! - numberOf.get(b.id)!,
    );

    const blocks = ["## Rooms"];
    for (const room of ordered) {
        const number = numberOf.get(room.id)!;
        const isEntrance = room.id === dungeon.map.entrance;
        const title = `### ${number}. ${room.type}${isEntrance ? " (Entrance)" : ""}`;

        const links = neighbours.get(room.id)!
            .sort((a, b) => a.number - b.number)
            .map(n => `${n.number} (${n.type})`)
            .join(", ");

        const body = [
            `- ${room.roll.columns[0]}: ${room.roll.left.value}`,
            `- ${room.roll.columns[1]}: ${room.roll.right.value}`,
            ...(room.monster ? [`- Monster: ${room.monster.value}`] : []),
            ...(room.details ?? []).map(d => `- Detail: ${d.value}`),
            ...(room.occupantFaction !== undefined ? [`- Held by: Faction ${room.occupantFaction + 1}`] : []),
            `- Connections: ${links || "none"}`,
        ].join("\n");

        blocks.push(`${title}\n\n${body}`);
    }
    return blocks.join("\n\n");
}

export function serializeMarkdown(dungeon: Dungeon, notes: Notes = {}): string {
    const blocks: string[] = [`# Dungeon: ${dungeon.seed}`];
    const dominant = dominantFactionIndex(dungeon.factions);

    blocks.push(section(
        "History",
        "Why was this dungeon built, how was it built, and what caused its downfall?",
        [
            rollLine("Purpose", dungeon.history.purpose),
            rollLine("Construction", dungeon.history.construction),
            rollLine("Ruination", dungeon.history.ruination),
        ],
        noteBlock(notes, "notes.history"),
    ));

    blocks.push(section(
        "Denizens",
        "What do we know about the creatures and factions that occupy the dungeon?",
        [
            rollLine("General attitude", dungeon.denizens.attitude),
            rollLine("Standout NPC", dungeon.denizens.standoutNPC),
        ],
        noteBlock(notes, "notes.denizens"),
    ));

    blocks.push(section(
        "Factions",
        "What is each faction trying to achieve, and what stands in their way?",
        dungeon.factions.map((f, i) =>
            `${rollLine(`Faction ${i + 1}`, f.agenda)} (${f.group.value}: ${f.species.value}, strength ${f.strength}${i === dominant ? ", dominant" : ""})`
        ),
        noteBlock(notes, "notes.factions"),
    ));

    blocks.push(roomsSection(dungeon));

    return blocks.join("\n\n") + "\n";
}