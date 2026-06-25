import type {Roll, Slot, SlotControls} from "../types/rollTypes.ts";
import RollView from "./RollView.tsx";
import styles from "./Section.module.css";

type LabeledRoll = { label: string; roll: Roll; extra?: { label: string; slot: Slot } };

type SectionProps = {
    title: string;
    prompt: string;
    items: LabeledRoll[];
    note: string;
    onNote: (text: string) => void;
    controls: SlotControls;
};

export function Section({ title, prompt, items, note, onNote, controls }: SectionProps) {
    return (
        <section>
            <h2>{title}</h2>
            <p><i>{prompt}</i></p>
            {items.map(item => (
                <div key={item.roll.left.id}>
                    <h3 className={styles.itemTitle}>{item.label}</h3>
                    <RollView roll={item.roll} controls={controls} layout="compact" extra={item.extra} />
                </div>
            ))}
            <textarea
                value={note}
                onChange={event => onNote(event.target.value)}
                placeholder="GM notes"
            />
        </section>
    );
}

