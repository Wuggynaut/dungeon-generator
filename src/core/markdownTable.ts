import type { Table } from "../types/rollTypes.ts";

export function tokenizeTable(text: string): string[][] {
    return text
        .split("\n")
        .filter((line) => line.trim().startsWith("|"))
        .map((line) =>
            line.split("|").slice(1,-1).map((char) => char.replace(/\*\*/g, "").trim()),)
        .filter((cells) => !cells.every((c) => /^-+$/.test(c))) // separator row
        .filter((cells) => !cells.every((c) => c === "")); // blank row
}

export type ParseResult =
    | { ok: true; table: Table }
    | { ok: false; errors: string[] };

// User pastes a Markdown table (header + rows).
// Each column becomes an independent list of that column's values.
export function parseUserTable(text: string): ParseResult {
    const rows = tokenizeTable(text);

    if (rows.length < 2)
        return { ok: false, errors: ["Need header row and at least one data row."] };

    const width = rows[0].length;
    if (width < 1)
        return { ok: false, errors: ["Need at least one column."] };

    const [header, ...data] = rows;
    const errors: string[] = [];
    data.forEach((row, i) => {
        if (row.length !== width || row.some((c) => c === ""))
            errors.push(`Row ${i + 1} must have ${width} non-empty cells.`);
    });
    if (errors.length) return { ok: false, errors };

    return {
        ok: true,
        table: {
            columns: header.map((label, ci) => ({
                label,
                values: data.map((r) => r[ci]),
            })),
        },
    };
}