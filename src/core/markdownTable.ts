import type { PairedTable } from "../types.ts";

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
    | { ok: true; table: PairedTable }
    | { ok: false; errors: string[] };

// User pastes a 2-column Markdown table (header + rows).
// Returns the table or a list  of errors
export function parseUserTable(text: string): ParseResult {
    const rows = tokenizeTable(text);

    if (rows.length < 2)
        return { ok: false, errors: ["Need header row and at least one data row."] };
    if (rows[0].length !== 2)
        return { ok: false, errors: [`Expected 2 columns, found ${rows[0].length}.`] };

    const [header, ...data] = rows;
    const errors: string[] = [];
    data.forEach((row, i) => {
        if (row.length !== 2 || row[0] === "" || row[1] === "")
            errors.push(`Row ${i +1} must have two non-empty cells.`);
    });
    if (errors.length) return { ok: false, errors };

    return {
        ok: true,
        table: {
            columns: [header[0], header[1]],
            rows: data.map((r) => [r[0], r[1]]),
        },
    };
}