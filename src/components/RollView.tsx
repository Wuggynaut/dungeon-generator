import { useState } from "react";
import type { Roll, Slot, SlotControls } from "../types/rollTypes.ts";
import { IconButton } from "./IconButton.tsx";
import { DiceIcon } from "./icons/DiceIcon.tsx";
import { EditIcon } from "./icons/EditIcon.tsx";
import styles from "./RollView.module.css";

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
        <div className={styles.cell}>
            <span className={styles.text}>
                <strong>{label}:</strong> {value}
            </span>
            <span className={styles.actions}>
                <IconButton label="Reroll" onClick={() => controls.reroll(slotId)}>
                    <DiceIcon />
                </IconButton>
                <IconButton label="Edit" onClick={startEdit}>
                    <EditIcon />
                </IconButton>
            </span>
        </div>
    );
}

export default function RollView({
                                     roll,
                                     controls,
                                     layout = "spread",
                                     extra,
                                     extras,
                                 }: {
    roll: Roll;
    controls: SlotControls;
    layout?: "spread" | "compact";
    extra?: { label: string; slot: Slot };
    extras?: { label: string; slot: Slot }[];

}) {
    return (
        <div className={layout === "compact" ? styles.compact : undefined}>
            <Cell label={roll.columns[0]} slotId={roll.left.id} value={roll.left.value} controls={controls} />
            <Cell label={roll.columns[1]} slotId={roll.right.id} value={roll.right.value} controls={controls} />
            {extra && (
                <Cell label={extra.label} slotId={extra.slot.id} value={extra.slot.value} controls={controls} />
            )}
            {extras?.map(x => (
                <Cell key={x.slot.id} label={x.label} slotId={x.slot.id} value={x.slot.value} controls={controls} />
            ))}
        </div>
    );
}