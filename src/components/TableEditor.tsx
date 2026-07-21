import type { Table, Column, ColumnValues } from "../types/rollTypes.ts";
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

// Column-oriented editor. A referenced column (its values come from a named source like the bestiary) shows read-only:
// you change it by editing the source.
export function TableEditor({ table, onChange }: TableEditorProps) {
    const cols = table.columns;
    const update = (next: Column[]) => onChange({ ...table, columns: next });

    const mapLiteral = (ci: number, fn: (values: string[]) => string[]) =>
        update(cols.map((c, i) => (i === ci && !isRef(c.values) ? { ...c, values: fn(c.values) } : c)));

    const setLabel = (ci: number, label: string) =>
        update(cols.map((c, i) => (i === ci ? { ...c, label } : c)));
    const setValue = (ci: number, vi: number, value: string) =>
        mapLiteral(ci, values => values.map((v, j) => (j === vi ? value : v)));
    const addValue = (ci: number) => mapLiteral(ci, values => [...values, ""]);
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
                                        {values.map((v, vi) => <li key={vi}>{v}</li>)}
                                    </ul>
                                </div>
                            ) : (
                                <>
                                    {values.map((v, vi) => (
                                        <div key={vi} className={styles.valueRow}>
                                            <input
                                                className={styles.cellInput}
                                                value={v}
                                                onChange={e => setValue(ci, vi, e.target.value)}
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