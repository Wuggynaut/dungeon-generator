import { useEffect, useState } from "react";
import styles from "./NumberStepper.module.css";

type NumberStepperProps = {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    ariaLabel?: string;
};

export function NumberStepper({ value, onChange, min = 1, max = 999, ariaLabel }: NumberStepperProps) {
    // Local text so the field can be empty/half-typed without forcing a number every keystroke.
    const [draft, setDraft] = useState(String(value));
    useEffect(() => setDraft(String(value)), [value]);

    const clamp = (n: number) => Math.max(min, Math.min(max, Math.floor(n)));

    const commit = () => {
        const parsed = Number(draft);
        const next = draft.trim() === "" || Number.isNaN(parsed) ? value : clamp(parsed);
        setDraft(String(next));
        if (next !== value) onChange(next);
    };

    const step = (delta: number) => onChange(clamp(value + delta));

    return (
        <span className={styles.stepper}>
            <button type="button" className={styles.button}
                    onClick={() => step(-1)} disabled={value <= min} aria-label="Decrease">
                −
            </button>
            <input
                className={styles.input}
                value={draft}
                inputMode="numeric"
                aria-label={ariaLabel}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
            <button type="button" className={styles.button}
                    onClick={() => step(1)} disabled={value >= max} aria-label="Increase">
                +
            </button>
        </span>
    );
}