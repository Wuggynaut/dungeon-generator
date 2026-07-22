import { useState } from "react";
import type { Family } from "../types/rollTypes.ts";
import { bestiary } from "../core/data/monsters.ts";
import { serializeBestiary } from "../core/corpusExport.ts";
import { TagInput } from "./TagInput.tsx";
import { ExportPanel } from "./ExportPanel.tsx";
import { IconButton } from "./IconButton.tsx";
import { TrashIcon } from "./icons/TrashIcon.tsx";

// Two-level authoring: families, each with its species. Tags on both. Export
// only, like the flat corpus editors.
export function BestiaryEditor() {
    const [families, setFamilies] = useState<Family[]>(bestiary);

    const setFamily = (fi: number, next: Family) =>
        setFamilies(families.map((f, i) => (i === fi ? next : f)));

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {families.map((fam, fi) => (
                    <div key={fi} style={{ border: "1px solid var(--color-border, #ccc)", borderRadius: 6, padding: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                            <input value={fam.name} placeholder="Family name"
                                   onChange={e => setFamily(fi, { ...fam, name: e.target.value })} />
                            <TagInput value={fam.tags} placeholder="family tags"
                                      onChange={tags => setFamily(fi, { ...fam, tags })} />
                            <IconButton label="Remove family" onClick={() => setFamilies(families.filter((_, i) => i !== fi))}>
                                <TrashIcon />
                            </IconButton>
                        </div>

                        <div style={{ marginLeft: "1rem", marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            {fam.species.map((s, si) => (
                                <div key={si} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                                    <input value={s.name} placeholder="Species name"
                                           onChange={e => setFamily(fi, { ...fam, species: fam.species.map((x, j) => (j === si ? { ...x, name: e.target.value } : x)) })} />
                                    <TagInput value={s.tags} placeholder="species tags"
                                              onChange={tags => setFamily(fi, { ...fam, species: fam.species.map((x, j) => (j === si ? { ...x, tags } : x)) })} />
                                    <IconButton label="Remove species"
                                                onClick={() => setFamily(fi, { ...fam, species: fam.species.filter((_, j) => j !== si) })}>
                                        <TrashIcon />
                                    </IconButton>
                                </div>
                            ))}
                            <button type="button"
                                    onClick={() => setFamily(fi, { ...fam, species: [...fam.species, { name: "New Species", tags: [] }] })}>
                                + Add species
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" style={{ marginTop: "0.5rem" }}
                    onClick={() => setFamilies([...families, { name: "New Family", tags: [], species: [] }])}>
                + Add family
            </button>

            <ExportPanel text={serializeBestiary(families)} filename="monsters.ts" />
        </div>
    );
}