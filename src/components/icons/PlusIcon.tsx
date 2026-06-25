type IconProps = { className?: string };

export function PlusIcon({ className }: IconProps) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            width={24}
            height={24}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <g data-part="body">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
            </g>
        </svg>
    );
}