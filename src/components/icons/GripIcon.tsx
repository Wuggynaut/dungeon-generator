type IconProps = { className?: string };

export function GripIcon({ className }: IconProps) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            width={24}
            height={24}
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
        >
            <g data-part="body">
                <circle cx="9" cy="12" r="1" />
                <circle cx="9" cy="5" r="1" />
                <circle cx="9" cy="19" r="1" />
                <circle cx="15" cy="12" r="1" />
                <circle cx="15" cy="5" r="1" />
                <circle cx="15" cy="19" r="1" />
            </g>
        </svg>
    );
}