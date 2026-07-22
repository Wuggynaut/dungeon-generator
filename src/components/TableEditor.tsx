import type { Table, Column, ColumnValue, ColumnValues } from "../types/rollTypes.ts";
import { resolveColumn } from "../core/data/columnSources.ts";
import { IconButton } from "./IconButton.tsx";
import { TrashIcon } from "./icons/TrashIcon.tsx";
import { PlusIcon } from "./icons/PlusIcon.tsx";
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
    const update = (next: Column[]) => onChange({ ...table, columns: next });

    const mapLiteral = (ci: number, fn: (values: ColumnValue[]) => ColumnValue[]) =>
        update(cols.map((c, i) => (i === ci && !isRef(c.values) ? { ...c, values: fn(c.values) } : c)));

    const setLabel = (ci: number, label: string) =>
        update(cols.map((c, i) => (i === ci ? { ...c, label } : c)));
    const setValue = (ci: number, vi: number, value: string) =>
        mapLiteral(ci, values => values.map((v, j) =>
            (j === vi ? (typeof v === "string" ? value : { ...v, value }) : v)));
    const addValue = (ci: number) => mapLiteral(ci, values => [...values, ""]);
    const setSubtable = (ci: number, vi: number, id: string) =>
        mapLiteral(ci, values => values.map((v, j) => {
            if (j !== vi) return v;
            const value = typeof v === "string" ? v : v.value;
            return id ? { value, subtable: id } : value; // empty id -> back to a plain string
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
                                    {values.map((v, vi) => (
                                        <div key={vi} className={styles.valueRow}>
                                            <input
                                                className={styles.cellInput}
                                                value={valueText(v)}
                                                onChange={e => setValue(ci, vi, e.target.value)}
                                            />
                                            <input
                                                className={styles.cellInput}
                                                style={{ maxWidth: "8rem", opacity: 0.8 }}
                                                placeholder="subtable id"
                                                value={typeof v === "string" ? "" : (v.subtable ?? "")}
                                                onChange={e => setSubtable(ci, vi, e.target.value)}
                                            />
                                            <IconButton label="Remove value" disabled={values.length === 1} onClick={() => removeValue(ci, vi)}>
                                                <TrashIcon />
                                            </IconButton>
                                        </div>
                                    ))}
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