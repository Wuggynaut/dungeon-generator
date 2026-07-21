export type ConstructionKind = "natural" | "built" | "weird";

// The construction table's Composition column references this list (values: { ref: "construction.kinds" })
export const constructionVocab: { value: string; kind: ConstructionKind }[] = [
    { value: "Bone", kind: "weird" },
    { value: "Coral", kind: "natural" },
    { value: "Crystal", kind: "natural" },
    { value: "Earth", kind: "natural" },
    { value: "Ethereal Fabric", kind: "weird" },
    { value: "Flesh", kind: "weird" },
    { value: "Floating Platforms", kind: "weird" },
    { value: "Fungi", kind: "natural" },
    { value: "Glass", kind: "built" },
    { value: "Ice", kind: "natural" },
    { value: "Living Plants", kind: "natural" },
    { value: "Marble", kind: "built" },
    { value: "Metal", kind: "built" },
    { value: "Obsidian", kind: "built" },
    { value: "Petrified Wood", kind: "built" },
    { value: "Sand", kind: "natural" },
    { value: "Shadow Material", kind: "weird" },
    { value: "Stone", kind: "built" },
    { value: "Webs", kind: "natural" },
    { value: "Wood", kind: "built" },
];

export const constructionValues = constructionVocab.map(v => v.value);

const kindByValue = new Map(constructionVocab.map(v => [v.value, v.kind]));

export function kindOf(value: string): ConstructionKind {
    return kindByValue.get(value) ?? "built";
}