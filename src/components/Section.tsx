import type {Roll, Slot, SlotControls} from "../types/rollTypes.ts";
import RollView from "./RollView.tsx";
import styles from "./Section.module.css";

type LabeledRoll = {
    label: string;
    roll: Roll;
    extra?: { label: string; slot: Slot };
    extras?: { label: string; slot: Slot }[];
    meta?: string;
};

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
                    {item.meta && <div style={{ fontSize: "0.85em", opacity: 0.7 }}>{item.meta}</div>}
                    <RollView roll={item.roll} controls={controls} layout="compact" extra={item.extra} extras={item.extras} />
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