import { useState } from "react";
import type { Roll, SlotControls } from "../types/rollTypes.ts";

type CellProps = {
    label: string;
    slotId: string;
    value: string;
    controls: SlotControls;
};

function Cell({ label, slotId, value, controls }: CellProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const startEdit = () => {
        setDraft(value);
        setEditing(true);
    };

    const saveEdit = () => {
        controls.edit(slotId, draft);
        setEditing(false);
    };

    if (editing) {
        return (
            <div>
                <strong>{label}:</strong>{" "}
                <input value={draft} onChange={e => setDraft(e.target.value)} />
                <button onClick={saveEdit}>Save</button>
                <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
        );
    }

    return (
        <div>
            <strong>{label}:</strong> {value}{" "}
            <button onClick={() => controls.reroll(slotId)}>Reroll</button>
            <button onClick={startEdit}>Edit</button>
        </div>
    );
}

export default function RollView({ roll, controls }: { roll: Roll; controls: SlotControls }) {
    return (
        <div>
            <Cell
                label={roll.columns[0]}
                slotId={roll.left.id}
                value={roll.left.value}
                controls={controls}
            />
            <Cell
                label={roll.columns[1]}
                slotId={roll.right.id}
                value={roll.right.value}
                controls={controls}
            />
        </div>
    );
}