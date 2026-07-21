// The purpose table's Original Use column references this list (values: { ref: "purpose.uses"}).
export const purposeVocab: { value: string; tags: string[] }[] = [
    { value: "Ancestral Rites", tags: ["sacred", "burial"] },
    { value: "Arcane Library", tags: ["arcane", "scholarly"] },
    { value: "Astral Trading Hub", tags: ["arcane", "wealth"] },
    { value: "Bestial Creations", tags: ["bestial", "arcane"] },
    { value: "Breeding Grounds", tags: ["bestial"] },
    { value: "Burial Site", tags: ["burial", "sacred"] },
    { value: "Celestial Observations", tags: ["celestial", "scholarly"] },
    { value: "Covert Experiments", tags: ["arcane", "secret"] },
    { value: "Forbidden Trysts", tags: ["secret"] },
    { value: "Forge for a Great Weapon", tags: ["martial"] },
    { value: "Hideout", tags: ["secret"] },
    { value: "Impenetrable Vault", tags: ["wealth"] },
    { value: "Invasion of Dreams", tags: ["arcane"] },
    { value: "Isolated Refuge", tags: ["domestic", "secret"] },
    { value: "Military Outpost", tags: ["martial"] },
    { value: "Observatory", tags: ["celestial", "scholarly"] },
    { value: "Pilgrimage Site", tags: ["sacred"] },
    { value: "Protection of Rare Artifacts", tags: ["wealth", "arcane"] },
    { value: "Secret Meeting Place", tags: ["secret"] },
    { value: "Treasure Horde", tags: ["wealth"] },
];

export const purposeValues = purposeVocab.map(v => v.value);

const tagsByValue = new Map(purposeVocab.map(v => [v.value, v.tags]));

export function tagsForPurpose(value: string): string[] {
    return tagsByValue.get(value) ?? [];
}