import { readFileSync, writeFileSync } from "node:fs";
import { tokenizeTable } from '../src/core/markdownTable.ts';

const [, , input, output] = process.argv;
const md = readFileSync(input, "utf8");

const blocks: string[][][] = [];
let buf: string[] = [];
for (const line of md.split("\n")) {
    if (line.trim().startsWith("|")) buf.push(line);
    else if (buf.length) {
        blocks.push(tokenizeTable(buf.join("\n")));
        buf = [];
    }
}
if (buf.length) blocks.push(tokenizeTable(buf.join("\n")));


// d20 tables, keyed by their header pair -> canonical name.
const pairedNames: Record<string, string> = {
    "Original Use|Built By": "purpose",
    "Entrance|Composition": "construction",
    "Condition|Cause": "ruination",
    "Virtues|Vices": "traits",
    "Goal|Obstacle": "agendas",
    "Group|Activity": "monster",
    "Room Type|Clue": "lore",
    "Special|Feature": "special",
    "Trap|Trigger": "trap",
};

type RawTable = { columns: [string, string]; rows: [string, string][] };
const paired: Record<string, RawTable> = {};
const weights: Record<string, number> = {};

for (const rows of blocks) {
    const header = rows[0];

    // Source d20 tables carry a leading index column we drop (cols 1 & 2 are data).
    if (header[0] === "d20" && header.length === 3) {
        const name = pairedNames[`${header[1]}|${header[2]}`];
        if (!name) continue;
        paired[name] = {
            columns: [header[1], header[2]],
            rows: rows.slice(1).map((r) => [r[1], r[2]] as [string, string]),
        };
    }

        // Die Drop: turn each room kind's face count into its default weight.
    // "2-3" -> 2 faces -> weight 2.
    else if (header[0] === "d6" && header[1] === "Room") {
        for (const [face, kind] of rows.slice(1)) {
            const faces = face.includes("-")
                ? (() => {
                    const [lo, hi] = face.split("-").map(Number);
                    return hi - lo + 1;
                })()
                : 1;
            weights[kind] = (weights[kind] ?? 0) + faces;
        }
    }
}


// emit
const quote = (value: string) => JSON.stringify(value);

const literalColumn = (label: string, values: string[], routes?: Record<string, string>) => {
    const items = values.map((v) =>
        routes && routes[v] ? `{ value: ${quote(v)}, subtable: ${quote(routes[v])} }` : quote(v));
    return `    { label: ${quote(label)}, values: [${items.join(", ")}] },`;
};

// table -> column label -> rolled value -> subtable id. Baked onto the value so
// it carries its own route (see the subtables registry in src/core/data).
const SUBTABLE_ROUTES: Record<string, Record<string, Record<string, string>>> = {
    special: {
        Special: {
            Mirror: "mirror-specifics",
            Pool: "pool-specifics",
            Statue: "statue-specifics",
            Door: "door-specifics",
            Writing: "writing-specifics",
            Treasure: "treasure-specifics",
        },
    },
};

const refColumn = (label: string, ref: string) =>
    `    { label: ${quote(label)}, values: { ref: ${quote(ref)} } },`;

// Columns whose values live in a source module (with their tags), referenced so
// the list is not copied into the generated table.
const REF_COLUMNS: Record<string, Record<string, string>> = {
    purpose: { "Original Use": "purpose.uses" },
    construction: { "Composition": "construction.kinds" },
};

const constOf = (name: string, table: RawTable) => {
    const refs = REF_COLUMNS[name] ?? {};
    const col = (ci: number) => {
        const label = table.columns[ci];
        if (refs[label]) return refColumn(label, refs[label]);
        const routes = (SUBTABLE_ROUTES[name] ?? {})[label];
        return literalColumn(label, table.rows.map((r) => r[ci]), routes);
    };
    // The monster table keeps only Activity; family is chosen in generate.ts.
    const columns = name === "monster" ? [col(1)] : [col(0), col(1)];
    return [`export const ${name}: Table = {`, `  columns: [`, ...columns, `  ],`, `};`, ``].join("\n");
};

const consts = Object.entries(paired)
    .map(([name, table]) => constOf(name, table))
    .join("\n");

// Each room kind references its table const
const pool = Object.entries(weights)
    .map(([kind, weight]) => `  { name: ${quote(kind)}, weight: ${weight}, table: ${kind.toLowerCase()} },`)
    .join("\n");

const out =
    `// AUTO-GENERATED from ${input.split("/").pop()} by build-tables.ts. Do not edit by hand.\n` +
    `import type { Table, RoomType } from "../../types/rollTypes.ts";\n\n` +
    `${consts}\n` +
    `// Default room-type pool. Weight = faces on the die; total weight is the die size.\n` +
    `export const defaultRoomTypes: RoomType[] = [\n${pool}\n];\n`;

writeFileSync(output, out);
console.log(`Wrote ${output}`);
console.log("Default weights:", weights);