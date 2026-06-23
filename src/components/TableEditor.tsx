import type {PairedTable} from "../types/rollTypes.ts";

type TableEditorProps = {
    table: PairedTable;
    onChange: (table: PairedTable) => void;
}

export function TableEditor({ table, onChange }: TableEditorProps) {
    const setColumn = (index: 0 | 1, value: string) => {
        const columns: [string, string] =
            index === 0 ? [value, table.columns[1]] : [table.columns[0], value];
        onChange({...table, columns: columns});
    };

    const setCell = (rowIndex: number, col: 0 | 1, value: string) => {
        const rows = table.rows.map((row, i): [string, string] => {
            if (i !== rowIndex) return row;
            return col === 0 ? [value, row[1]] : [row[0], value];
        });
        onChange({ ...table, rows });
    };

    const addRow = () => {
        const blank: [string, string] = ["", ""];
        onChange({ ...table, rows: [...table.rows, blank] });
    };

    const removeRow = (rowIndex: number) => {
        onChange({ ...table, rows: table.rows.filter((_, i) => i !== rowIndex) });
    };

    return (
        <table style={{ borderCollapse: "collapse" }}>
            <thead>
            <tr>
                <th style={{ width: 32 }} />
                <th>
                    <input value={table.columns[0]} onChange={e => setColumn(0, e.target.value)} />
                </th>
                <th>
                    <input value={table.columns[1]} onChange={e => setColumn(1, e.target.value)} />
                </th>
                <th />
            </tr>
            </thead>
            <tbody>
            {table.rows.map((row, i) => (
                <tr key={i}>
                    <td style={{ color: "#666", textAlign: "right" }}>{i + 1}</td>
                    <td>
                        <input value={row[0]} onChange={e => setCell(i, 0, e.target.value)} />
                    </td>
                    <td>
                        <input value={row[1]} onChange={e => setCell(i, 1, e.target.value)} />
                    </td>
                    <td>
                        <button onClick={() => removeRow(i)} disabled={table.rows.length === 1}>
                            Remove
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
            <tfoot>
            <tr>
                <td colSpan={4}>
                    <button onClick={addRow}>Add row</button>
                </td>
            </tr>
            </tfoot>
        </table>
    );
}