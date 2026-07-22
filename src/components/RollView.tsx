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
    rerollable?: boolean;
};

function Cell({ label, slotId, value, controls, rerollable = true }: CellProps) {
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
                {rerollable && (
                    <IconButton label="Reroll" onClick={() => controls.reroll(slotId)}>
                        <DiceIcon />
                    </IconButton>
                )}
                <IconButton label="Edit" onClick={startEdit}>
                    <EditIcon />
                </IconButton>
            </span>
        </div>
    );
}

// Renders a subtable child roll indented under its parent value.
function SubCells({ roll, controls }: { roll: Roll; controls: SlotControls }) {
    return (
        <div style={{ marginLeft: "1rem", borderLeft: "2px solid var(--color-border, #ddd)", paddingLeft: "0.5rem" }}>
            {roll.columns.map((label, i) => (
                <div key={roll.cells[i].id}>
                    <Cell label={label} slotId={roll.cells[i].id} value={roll.cells[i].value} controls={controls} />
                    {roll.subrolls?.[i] && <SubCells roll={roll.subrolls[i]!} controls={controls} />}
                </div>
            ))}
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
    extra?: { label: string; slot: Slot; rerollable?: boolean };
    extras?: { label: string; slot: Slot; rerollable?: boolean }[];
}) {
    const hasSubs = roll.subrolls?.some(Boolean) ?? false;
    return (
        <div className={layout === "compact" ? styles.compact : undefined}>
            {hasSubs
                ? roll.columns.map((label, i) => (
                    <div key={roll.cells[i].id}>
                        <Cell label={label} slotId={roll.cells[i].id} value={roll.cells[i].value} controls={controls} />
                        {roll.subrolls?.[i] && <SubCells roll={roll.subrolls[i]!} controls={controls} />}
                    </div>
                ))
                : roll.columns.map((label, i) => (
                    <Cell key={roll.cells[i].id} label={label} slotId={roll.cells[i].id} value={roll.cells[i].value} controls={controls} />
                ))}
            {extra && (
                <Cell label={extra.label} slotId={extra.slot.id} value={extra.slot.value} controls={controls} rerollable={extra.rerollable} />
            )}
            {extras?.map(x => (
                <Cell key={x.slot.id} label={x.label} slotId={x.slot.id} value={x.slot.value} controls={controls} rerollable={x.rerollable} />
            ))}
        </div>
    );
}