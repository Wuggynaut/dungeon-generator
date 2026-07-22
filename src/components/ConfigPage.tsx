import type { Config, Tables } from "../core/config.ts";
import type { Table } from "../types/rollTypes.ts";
import { RoomTypeEditor } from "./RoomTypeEditor.tsx";
import { TableEditor } from "./TableEditor.tsx";
import styles from "./ConfigPage.module.css";
import { CorpusEditor } from "./CorpusEditor.tsx";
import { TagInput } from "./TagInput.tsx";
import type { Detail } from "../types/rollTypes.ts";
import { purposeVocab } from "../core/data/purposeTags.ts";
import { constructionVocab, type ConstructionKind } from "../core/data/constructionKind.ts";
import { dressing } from "../core/data/dressing.ts";
import { serializePurposeVocab, serializeConstructionVocab, serializeDressing } from "../core/corpusExport.ts";
import { BestiaryEditor } from "./BestiaryEditor.tsx";

type ConfigPageProps = {
    config: Config;
    onChange: (config: Config) => void;
};

const FIXED_TABLES: { key: keyof Tables; title: string }[] = [
    { key: "purpose", title: "Purpose" },
    { key: "construction", title: "Construction" },
    { key: "ruination", title: "Ruination" },
    { key: "traits", title: "Traits" },
    { key: "agendas", title: "Agendas" },
];

export function ConfigPage({ config, onChange }: ConfigPageProps) {
    const setTable = (key: keyof Tables, table: Table) => {
        onChange({ ...config, tables: { ...config.tables, [key]: table } });
    };

    return (
        <>
            <section>
                <RoomTypeEditor config={config} onChange={onChange} />
            </section>

            <section>
                <h2 className={styles.heading}>Core tables</h2>
                <p className={styles.note}>
                    These feed History, Denizens, and Factions. Editing them changes what each seed rolls.
                </p>

                <div className={styles.tables}>
                    {FIXED_TABLES.map(({ key, title }) => {
                        const table = config.tables[key];
                        return (
                            <details key={key} className={styles.details}>
                                <summary className={styles.summary}>
                                    <span className={styles.summaryRow}>
                                        <span className={styles.summaryTitle}>{title}</span>
                                        <span className={styles.summaryMeta}>
                                            {table.columns.map(c => c.label).join(" × ")} · {table.columns.length} cols
                                        </span>
                                    </span>
                                </summary>
                                <div className={styles.detailsBody}>
                                    <TableEditor table={table} onChange={t => setTable(key, t)} />
                                </div>
                            </details>
                        );
                    })}
                </div>
            </section>

            <section>
                <h2 className={styles.heading}>Content</h2>
                <p className={styles.note}>
                    Author corpuses here, then Export the file and commit it. These edits do not affect
                    generation until the exported file is committed.
                </p>

                <details className={styles.details}>
                    <summary className={styles.summary}>
                        <span className={styles.summaryTitle}>Purpose vocabulary</span>
                    </summary>
                    <div className={styles.detailsBody}>
                        <CorpusEditor
                            initial={purposeVocab}
                            blank={() => ({ value: "", tags: [] })}
                            renderItem={(item, update) => (
                                <>
                                    <input value={item.value} placeholder="Original Use"
                                           onChange={e => update({ ...item, value: e.target.value })} />
                                    <TagInput value={item.tags} onChange={tags => update({ ...item, tags })} />
                                </>
                            )}
                            serialize={serializePurposeVocab}
                            filename="purposeTags.ts"
                        />
                    </div>
                </details>

                <details className={styles.details}>
                    <summary className={styles.summary}>
                        <span className={styles.summaryTitle}>Construction vocabulary</span>
                    </summary>
                    <div className={styles.detailsBody}>
                        <CorpusEditor
                            initial={constructionVocab}
                            blank={() => ({ value: "", kind: "built" as ConstructionKind })}
                            renderItem={(item, update) => (
                                <>
                                    <input value={item.value} placeholder="Composition"
                                           onChange={e => update({ ...item, value: e.target.value })} />
                                    <select value={item.kind}
                                            onChange={e => update({ ...item, kind: e.target.value as ConstructionKind })}>
                                        <option value="natural">natural</option>
                                        <option value="built">built</option>
                                        <option value="weird">weird</option>
                                    </select>
                                </>
                            )}
                            serialize={serializeConstructionVocab}
                            filename="constructionKind.ts"
                        />
                    </div>
                </details>

                <details className={styles.details}>
                    <summary className={styles.summary}>
                        <span className={styles.summaryTitle}>Bestiary</span>
                    </summary>
                    <div className={styles.detailsBody}>
                        <BestiaryEditor />
                    </div>
                </details>

                <details className={styles.details}>
                    <summary className={styles.summary}>
                        <span className={styles.summaryTitle}>Dressing details</span>
                    </summary>
                    <div className={styles.detailsBody}>
                        <CorpusEditor
                            initial={dressing}
                            blank={(): Detail => ({ text: "" })}
                            renderItem={(item, update) => (
                                <>
                                    <input value={item.text} placeholder="detail text" style={{ minWidth: "16rem" }}
                                           onChange={e => update({ ...item, text: e.target.value })} />
                                    <label>req <TagInput value={item.requires ?? []} onChange={requires => update({ ...item, requires })} /></label>
                                    <label>aff <TagInput value={item.affinity ?? []} onChange={affinity => update({ ...item, affinity })} /></label>
                                    <label>wt <input type="number" value={item.weight ?? ""} style={{ width: 48 }}
                                                     onChange={e => update({ ...item, weight: e.target.value === "" ? undefined : Number(e.target.value) })} /></label>
                                </>
                            )}
                            serialize={serializeDressing}
                            filename="dressing.ts"
                        />
                    </div>
                </details>
            </section>
        </>
    );
}