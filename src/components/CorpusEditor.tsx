import { useState, type ReactNode } from "react";
import { IconButton } from "./IconButton.tsx";
import { TrashIcon } from "./icons/TrashIcon.tsx";
import { ExportPanel } from "./ExportPanel.tsx";

type CorpusEditorProps<T> = {
    initial: T[];
    blank: () => T;
    renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
    serialize: (items: T[]) => string;
    filename: string;
};

// A generic authoring list: add/remove/edit entries, then export the whole
// corpus as its source .ts file. Edits are not saved until you export and commit the file.
export function CorpusEditor<T>({ initial, blank, renderItem, serialize, filename }: CorpusEditorProps<T>) {
    const [items, setItems] = useState<T[]>(initial);

    const update = (i: number, next: T) => setItems(items.map((x, j) => (j === i ? next : x)));
    const remove = (i: number) => setItems(items.filter((_, j) => j !== i));
    const add = () => setItems([...items, blank()]);

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {items.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        {renderItem(item, next => update(i, next), i)}
                        <IconButton label="Remove entry" onClick={() => remove(i)}>
                            <TrashIcon />
                        </IconButton>
                    </div>
                ))}
            </div>

            <button type="button" onClick={add} style={{ marginTop: "0.5rem" }}>+ Add entry</button>

            <ExportPanel text={serialize(items)} filename={filename} />
        </div>
    );
}