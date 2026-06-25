import { useState } from "react";
import type { Config } from "../core/config.ts";
import type { PairedTable, RoomType } from "../types/rollTypes.ts";
import { TableEditor } from "./TableEditor.tsx";
import { NumberStepper } from "./NumberStepper.tsx";
import { IconButton } from "./IconButton.tsx";
import { TrashIcon } from "./icons/TrashIcon.tsx";
import { EditIcon } from "./icons/EditIcon.tsx";
import { PlusIcon } from "./icons/PlusIcon.tsx";
import styles from "./RoomTypeEditor.module.css";

type RoomTypeEditorProps = {
    config: Config;
    onChange: (config: Config) => void;
};

function cumulativeRanges(pool: RoomType[]): { lo: number; hi: number }[] {
    const ranges: { lo: number; hi: number }[] = [];
    let start = 1;
    for (const rt of pool) {
        ranges.push({ lo: start, hi: start + rt.weight - 1 });
        start += rt.weight;
    }
    return ranges;
}

function starterTable(): PairedTable {
    return { columns: ["Column A", "Column B"], rows: [["", ""]] };
}

export function RoomTypeEditor({ config, onChange }: RoomTypeEditorProps) {
    const pool = config.roomTypes;
    const ranges = cumulativeRanges(pool);
    const dieSize = pool.reduce((sum, rt) => sum + rt.weight, 0);

    const [newName, setNewName] = useState("");
    const [openName, setOpenName] = useState<string | null>(null);

    const setWeight = (index: number, weight: number) => {
        const next = pool.map((rt, i) => (i === index ? { ...rt, weight } : rt));
        onChange({ ...config, roomTypes: next });
    };

    const setTable = (index: number, table: PairedTable) => {
        const next = pool.map((rt, i) => (i === index ? { ...rt, table } : rt));
        onChange({ ...config, roomTypes: next });
    };

    const removeType = (index: number) => {
        onChange({ ...config, roomTypes: pool.filter((_, i) => i !== index) });
    };

    const addType = () => {
        const trimmed = newName.trim();
        if (!trimmed || pool.some(rt => rt.name === trimmed)) return;
        const newType: RoomType = { name: trimmed, weight: 1, table: starterTable() };
        onChange({ ...config, roomTypes: [...pool, newType] });
        setNewName("");
        setOpenName(trimmed);   // open the new type so you can fill in its table
    };

    return (
        <div>
            <div className={styles.head}>
                <h2 className={styles.title}>Room types</h2>
                <span className={styles.die}>d{dieSize}</span>
            </div>

            <ul className={styles.list}>
                {pool.map((rt, i) => (
                    <li key={rt.name} className={styles.type}>
                        <div className={styles.row}>
                            <span className={styles.name}>{rt.name}</span>

                            <NumberStepper
                                value={rt.weight}
                                min={1}
                                ariaLabel={`${rt.name} weight`}
                                onChange={w => setWeight(i, w)}
                            />

                            <span className={styles.range}>
                                rolls {ranges[i].lo}
                                {ranges[i].hi > ranges[i].lo ? `–${ranges[i].hi}` : ""}
                            </span>

                            <span className={styles.meta}>
                                {rt.table.columns[0]} × {rt.table.columns[1]} · {rt.table.rows.length} rows
                            </span>

                            <span className={styles.actions}>
                                <IconButton
                                    label={openName === rt.name ? "Close table" : "Edit table"}
                                    onClick={() => setOpenName(openName === rt.name ? null : rt.name)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    label="Remove room type"
                                    disabled={pool.length === 1}
                                    onClick={() => removeType(i)}
                                >
                                    <TrashIcon />
                                </IconButton>
                            </span>
                        </div>

                        {openName === rt.name && (
                            <div className={styles.tableWrap}>
                                <TableEditor table={rt.table} onChange={t => setTable(i, t)} />
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <div className={styles.add}>
                <input
                    className={styles.addInput}
                    placeholder="New room type name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addType()}
                />
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={addType}
                    disabled={!newName.trim()}
                >
                    <PlusIcon className={styles.addIcon} /> Add type
                </button>
            </div>
        </div>
    );
}