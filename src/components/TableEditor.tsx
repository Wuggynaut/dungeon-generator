import { useState } from "react";
import type { Table, Column, ColumnValue, ColumnValues } from "../types/rollTypes.ts";
import { resolveColumn } from "../core/data/columnSources.ts";
import { IconButton } from "./IconButton.tsx";
import { TrashIcon } from "./icons/TrashIcon.tsx";
import { PlusIcon } from "./icons/PlusIcon.tsx";
import { TagInput } from "./TagInput.tsx";
import styles from "./TableEditor.module.css";

type TableEditorProps = {
    table: Table;
    onChange: (table: Table) => void;
};

function isRef(v: ColumnValues): v is { ref: string } {
    return !Array.isArray(v);
}

const valueText = (v: ColumnValue): string => (typeof v === "string" ? v : v.value);

// Column-oriented editor. Each column is an independent list, so columns can
// differ in length. A referenced column (its values come from a named source
// like the bestiary) shows read-only; you change it by editing the source.
export function TableEditor({ table, onChange }: TableEditorProps) {
    const cols = table.columns;

    // Per-value metadata (subtable id, tags, weight) is hidden behind a toggle so
    // columns keep their normal width. Keyed by "col:value" index.
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const toggleMeta = (key: string) =>
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    const update = (next: Column[]) => onChange({ ...table, columns: next });

    const mapLiteral = (ci: number, fn: (values: ColumnValue[]) => ColumnValue[]) =>
        update(cols.map((c, i) => (i === ci && !isRef(c.values) ? { ...c, values: fn(c.values) } : c)));

    const setLabel = (ci: number, label: string) =>
        update(cols.map((c, i) => (i === ci ? { ...c, label } : c)));
    const setValue = (ci: number, vi: number, value: string) =>
        mapLiteral(ci, values => values.map((v, j) =>
            (j === vi ? (typeof v === "string" ? value : { ...v, value }) : v)));
    const addValue = (ci: number) => mapLiteral(ci, values => [...values, ""]);
    const setField = (
        ci: number, vi: number,
        patch: Partial<{ subtable: string; requires: string[]; affinity: string[]; weight: number }>,
    ) =>
        mapLiteral(ci, values => values.map((v, j) => {
            if (j !== vi) return v;
            const obj: { value: string; subtable?: string; requires?: string[]; affinity?: string[]; weight?: number } =
                typeof v === "string" ? { value: v } : { ...v };
            const next = { ...obj, ...patch };
            if (!next.subtable) delete next.subtable;
            if (!next.requires?.length) delete next.requires;
            if (!next.affinity?.length) delete next.affinity;
            if (next.weight === undefined) delete next.weight;
            const { value, ...meta } = next;
            return Object.keys(meta).length === 0 ? value : next;
        }));
    const removeValue = (ci: number, vi: number) =>
        mapLiteral(ci, values => values.filter((_, j) => j !== vi));

    const addColumn = () =>
        update([...cols, { label: `Column ${cols.length + 1}`, values: [""] }]);
    const removeColumn = (ci: number) => update(cols.filter((_, i) => i !== ci));

    return (
        <div className={styles.wrap}>
            <div className={styles.columns}>
                {cols.map((col, ci) => {
                    const refName = isRef(col.values) ? col.values.ref : null;
                    const values = isRef(col.values) ? resolveColumn(col.values) : col.values;

                    return (
                        <div key={ci} className={styles.column}>
                            <div className={styles.columnHead}>
                                <input
                                    className={styles.headInput}
                                    value={col.label}
                                    onChange={e => setLabel(ci, e.target.value)}
                                />
                                <IconButton label="Remove column" disabled={cols.length === 1} onClick={() => removeColumn(ci)}>
                                    <TrashIcon />
                                </IconButton>
                            </div>

                            {refName !== null ? (
                                <div className={styles.linked}>
                                    <div className={styles.linkNote}>Linked to {refName}. Edit the source, not here.</div>
                                    <ul className={styles.linkedList}>
                                        {values.map((v, vi) => <li key={vi}>{valueText(v)}</li>)}
                                    </ul>
                                </div>
                            ) : (
                                <>
                                    {values.map((v, vi) => {
                                        const obj = typeof v === "object" ? v : null;
                                        const hasMeta = !!(obj && (obj.subtable || obj.requires?.length || obj.affinity?.length || obj.weight !== undefined));
                                        const key = `${ci}:${vi}`;
                                        const open = expanded.has(key);
                                        const metaLabel = { display: "flex", gap: "0.3rem", alignItems: "center" } as const;
                                        return (
                                            <div key={vi} className={styles.valueRow} style={{ flexDirection: "column", alignItems: "stretch" }}>
                                                <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                                                    <input className={styles.cellInput} value={valueText(v)} onChange={e => setValue(ci, vi, e.target.value)} />
                                                    <button
                                                        type="button"
                                                        title="value options: subtable, tags, weight"
                                                        onClick={() => toggleMeta(key)}
                                                        style={{ fontSize: "0.7rem", lineHeight: 1, padding: "0.15rem 0.35rem", fontWeight: hasMeta ? 700 : 400, opacity: hasMeta || open ? 1 : 0.45 }}
                                                    >
                                                        {open ? "▾" : "…"}
                                                    </button>
                                                    <IconButton label="Remove value" disabled={values.length === 1} onClick={() => removeValue(ci, vi)}>
                                                        <TrashIcon />
                                                    </IconButton>
                                                </div>
                                                {open && (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.78em", opacity: 0.85, margin: "0.25rem 0 0.4rem 0.5rem" }}>
                                                        <label style={metaLabel}>subtable <input style={{ flex: 1, minWidth: 0 }} placeholder="id" value={obj?.subtable ?? ""} onChange={e => setField(ci, vi, { subtable: e.target.value })} /></label>
                                                        <label style={metaLabel}>requires <TagInput value={obj?.requires ?? []} onChange={requires => setField(ci, vi, { requires })} /></label>
                                                        <label style={metaLabel}>affinity <TagInput value={obj?.affinity ?? []} onChange={affinity => setField(ci, vi, { affinity })} /></label>
                                                        <label style={metaLabel}>weight <input type="number" style={{ width: "4rem" }} value={obj?.weight ?? ""} onChange={e => setField(ci, vi, { weight: e.target.value === "" ? undefined : Number(e.target.value) })} /></label>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <button type="button" className={styles.addRow} onClick={() => addValue(ci)}>
                                        <PlusIcon className={styles.addIcon} /> Add value
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <button type="button" className={styles.addRow} onClick={addColumn}>
                <PlusIcon className={styles.addIcon} /> Add column
            </button>
        </div>
    );
}