import type { ReactNode } from "react";
import styles from "./IconButton.module.css";

type IconButtonProps = {
    label: string;
    onClick: (event: React.MouseEvent) => void;
    children: ReactNode;
    disabled?: boolean;
};

export function IconButton({ label, onClick, children, disabled = false }: IconButtonProps) {
    return (
        <button
            type="button"
            className={styles.iconButton}
            onClick={onClick}
            title={label}
            aria-label={label}
            disabled={disabled}
        >
            {children}
        </button>
    );
}