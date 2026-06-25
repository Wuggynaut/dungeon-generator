import { useState } from "react";
import type { PairedTable } from "../types/rollTypes.ts";
import { IconButton } from "./IconButton.tsx";
import { TrashIcon } from "./icons/TrashIcon.tsx";
import { PlusIcon } from "./icons/PlusIcon.tsx";
import { GripIcon } from "./icons/GripIcon.tsx";
import styles from "./TableEditor.module.css";

type TableEditorProps = {
    table: PairedTable;
    onChange: (table: PairedTable) => void;
};

export function TableEditor({ table, onChange }: TableEditorProps) {
    const [dragIndex, setDragIndex] = useState<number | null>(null); // row currently being dragged
    const [armed, setArmed] = useState<number | null>(null);         // row allowed to drag (handle pressed)

    const setColumn = (index: 0 | 1, value: string) => {
        const columns: [string, string] =
            index === 0 ? [value, table.columns[1]] : [table.columns[0], value];
        onChange({ ...table, columns });
    };

    const setCell = (rowIndex: number, col: 0 | 1, value: string) => {
        const rows = table.rows.map((row, i): [string, string] => {
            if (i !== rowIndex) return row;
            return col === 0 ? [value, row[1]] : [row[0], value];
        });
        onChange({ ...table, rows });
    };

    const addRow = () => onChange({ ...table, rows: [...table.rows, ["", ""]] });

    const removeRow = (rowIndex: number) =>
        onChange({ ...table, rows: table.rows.filter((_, i) => i !== rowIndex) });

    const moveRow = (from: number, to: number) => {
        if (from === to) return;
        const rows = [...table.rows];
        const [moved] = rows.splice(from, 1);
        rows.splice(to, 0, moved);
        onChange({ ...table, rows });
    };

    return (
        <div className={styles.wrap}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th className={styles.handleCol} aria-hidden="true" />
                    <th className={styles.numCol}>#</th>
                    <th>
                        <input className={styles.headInput}
                               value={table.columns[0]} onChange={e => setColumn(0, e.target.value)} />
                    </th>
                    <th>
                        <input className={styles.headInput}
                               value={table.columns[1]} onChange={e => setColumn(1, e.target.value)} />
                    </th>
                    <th className={styles.actionCol} aria-hidden="true" />
                </tr>
                </thead>
                <tbody>
                {table.rows.map((row, i) => (
                    <tr
                        key={i}
                        draggable={armed === i}
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={e => {
                            e.preventDefault();                 // required, or the drop is rejected
                            if (dragIndex === null || dragIndex === i) return;
                            moveRow(dragIndex, i);              // live reorder as you hover
                            setDragIndex(i);                   // dragged row is now at this index
                        }}
                        onDrop={e => e.preventDefault()}
                        onDragEnd={() => { setDragIndex(null); setArmed(null); }}
                        className={dragIndex === i ? styles.dragging : undefined}
                    >
                        <td className={styles.handleCol}>
                            <span
                                className={styles.handle}
                                title="Drag to reorder"
                                onMouseDown={() => setArmed(i)}
                                onMouseUp={() => setArmed(null)}
                            >
                                <GripIcon />
                            </span>
                        </td>
                        <td className={styles.num}>{i + 1}</td>
                        <td>
                            <input className={styles.cellInput}
                                   value={row[0]} onChange={e => setCell(i, 0, e.target.value)} />
                        </td>
                        <td>
                            <input className={styles.cellInput}
                                   value={row[1]} onChange={e => setCell(i, 1, e.target.value)} />
                        </td>
                        <td className={styles.actionCol}>
                            <IconButton label="Remove row"
                                        disabled={table.rows.length === 1}
                                        onClick={() => removeRow(i)}>
                                <TrashIcon />
                            </IconButton>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button type="button" className={styles.addRow} onClick={addRow}>
                <PlusIcon className={styles.addIcon} />
                Add row
            </button>
        </div>
    );
}