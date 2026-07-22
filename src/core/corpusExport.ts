import type { Detail, Family, Subtables, Table, ColumnValues } from "../types/rollTypes.ts";
import type { ConstructionKind } from "./data/constructionKind.ts";

// Serializers that turn an edited corpus back into its source .ts file. The
// Setup editors call these; copy or download the result and commit it.

const S = (x: string) => JSON.stringify(x);
const list = (xs: string[]) => `[${xs.map(S).join(", ")}]`;

export function serializePurposeVocab(vocab: { value: string; tags: string[] }[]): string {
    const entries = vocab.map(v => `    { value: ${S(v.value)}, tags: ${list(v.tags)} },`).join("\n");
    return `// Single source for the Original Use values and their affinity tags.
export const purposeVocab: { value: string; tags: string[] }[] = [
${entries}
];

export const purposeValues = purposeVocab.map(v => v.value);

const tagsByValue = new Map(purposeVocab.map(v => [v.value, v.tags]));

export function tagsForPurpose(value: string): string[] {
    return tagsByValue.get(value) ?? [];
}
`;
}

export function serializeConstructionVocab(vocab: { value: string; kind: ConstructionKind }[]): string {
    const entries = vocab.map(v => `    { value: ${S(v.value)}, kind: ${S(v.kind)} },`).join("\n");
    return `// Single source for the Composition values and their kind.
export type ConstructionKind = "natural" | "built" | "weird";

export const constructionVocab: { value: string; kind: ConstructionKind }[] = [
${entries}
];

export const constructionValues = constructionVocab.map(v => v.value);

const kindByValue = new Map(constructionVocab.map(v => [v.value, v.kind]));

export function kindOf(value: string): ConstructionKind {
    return kindByValue.get(value) ?? "built";
}
`;
}

export function serializeDressing(details: Detail[]): string {
    const entry = (d: Detail) => {
        const parts = [`text: ${S(d.text)}`];
        if (d.requires && d.requires.length) parts.push(`requires: ${list(d.requires)}`);
        if (d.affinity && d.affinity.length) parts.push(`affinity: ${list(d.affinity)}`);
        if (d.weight !== undefined) parts.push(`weight: ${d.weight}`);
        return `    { ${parts.join(", ")} },`;
    };
    return `import type { Detail } from "../../types/rollTypes.ts";

export const dressing: Detail[] = [
${details.map(entry).join("\n")}
];
`;
}

export function serializeBestiary(families: Family[]): string {
    const sp = (s: { name: string; tags: string[] }) => `{ name: ${S(s.name)}, tags: ${list(s.tags)} }`;
    const fam = (f: Family) =>
        `    { name: ${S(f.name)}, tags: ${list(f.tags)}, species: [${f.species.map(sp).join(", ")}] },`;
    return `import type { Family } from "../../types/rollTypes.ts";

export const bestiary: Family[] = [
${families.map(fam).join("\n")}
];

export const groupNames: string[] = bestiary.map(f => f.name);

export const familyByName: Record<string, Family> =
    Object.fromEntries(bestiary.map(f => [f.name, f]));

export const monstersByGroup: Record<string, string[]> =
    Object.fromEntries(bestiary.map(f => [f.name, f.species.map(s => s.name)]));
`;
}

function serializeColumnValues(values: ColumnValues): string {
    if (!Array.isArray(values)) return `{ ref: ${S(values.ref)} }`;
    const items = values.map(v =>
        typeof v === "string"
            ? S(v)
            : `{ value: ${S(v.value)}${v.subtable ? `, subtable: ${S(v.subtable)}` : ""} }`);
    return `[${items.join(", ")}]`;
}

function serializeTable(t: Table): string {
    const cols = t.columns.map(c => `{ label: ${S(c.label)}, values: ${serializeColumnValues(c.values)} }`);
    return `{ columns: [${cols.join(", ")}] }`;
}

export function serializeSubtables(subs: Subtables): string {
    const entries = Object.entries(subs).map(([id, t]) => `    ${S(id)}: ${serializeTable(t)},`).join("\n");
    return `import type { Subtables } from "../../types/rollTypes.ts";

export const subtables: Subtables = {
${entries}
};
`;
}