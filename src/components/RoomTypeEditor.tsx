import { useState } from "react";
import type { Config } from "../core/config.ts";
import type { PairedTable, RoomType } from "../types/rollTypes.ts";
import { TableEditor } from "./TableEditor.tsx";

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
        const next = pool.map((rt, i) =>
            i === index ? { ...rt, weight: Math.max(1, Math.floor(weight)) } : rt,
        );
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
        setOpenName(trimmed); // open the new type so you can fill in its table
    };

    return (
        <section>
            <h2>Room types (d{dieSize})</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {pool.map((rt, i) => (
                    <li key={rt.name} style={{ marginBottom: 12 }}>
                        <strong>{rt.name}</strong>{" "}
                        <label>
                            weight{" "}
                            <input
                                type="number"
                                min={1}
                                value={rt.weight}
                                onChange={e => setWeight(i, Number(e.target.value))}
                                style={{ width: 48 }}
                            />
                        </label>{" "}
                        <span>
                            rolls {ranges[i].lo}
                            {ranges[i].hi > ranges[i].lo ? `–${ranges[i].hi}` : ""}
                        </span>{" "}
                        <span style={{ color: "#666" }}>
                            ({rt.table.columns[0]} × {rt.table.columns[1]}, {rt.table.rows.length} rows)
                        </span>{" "}
                        <button onClick={() => setOpenName(openName === rt.name ? null : rt.name)}>
                            {openName === rt.name ? "Close table" : "Edit table"}
                        </button>{" "}
                        <button onClick={() => removeType(i)} disabled={pool.length === 1}>
                            Remove
                        </button>

                        {openName === rt.name && (
                            <div style={{ marginTop: 8 }}>
                                <TableEditor table={rt.table} onChange={table => setTable(i, table)} />
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <h3>Add a room type</h3>
            <input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
            <button onClick={addType}>Add type</button>
        </section>
    );
}