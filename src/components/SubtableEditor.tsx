import { useState } from "react";
import type { Table } from "../types/rollTypes.ts";
import { subtables } from "../core/data/subtables.ts";
import { serializeSubtables } from "../core/corpusExport.ts";
import { TableEditor } from "./TableEditor.tsx";
import { ExportPanel } from "./ExportPanel.tsx";
import { IconButton } from "./IconButton.tsx";
import { TrashIcon } from "./icons/TrashIcon.tsx";

// Edits the subtable registry: named child tables, each a Table (reusing the
// TableEditor). A value routes to one of these by id, set on the value in the parent table (see TableEditor).
export function SubtableEditor() {
    const [entries, setEntries] = useState<[string, Table][]>(Object.entries(subtables));

    const setId = (i: number, id: string) => setEntries(entries.map((e, j) => (j === i ? [id, e[1]] : e)));
    const setTable = (i: number, t: Table) => setEntries(entries.map((e, j) => (j === i ? [e[0], t] : e)));

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {entries.map(([id, table], i) => (
                    <div key={i} style={{ border: "1px solid var(--color-border, #ccc)", borderRadius: 6, padding: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input value={id} placeholder="subtable id" onChange={e => setId(i, e.target.value)} />
                            <IconButton label="Remove subtable" onClick={() => setEntries(entries.filter((_, j) => j !== i))}>
                                <TrashIcon />
                            </IconButton>
                        </div>
                        <div style={{ marginTop: "0.4rem" }}>
                            <TableEditor table={table} onChange={t => setTable(i, t)} />
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" style={{ marginTop: "0.5rem" }}
                    onClick={() => setEntries([...entries, ["new-subtable", { columns: [{ label: "Column A", values: [""] }] }]])}>
                + Add subtable
            </button>

            <ExportPanel text={serializeSubtables(Object.fromEntries(entries))} filename="subtables.ts" />
        </div>
    );
}