import { useEffect, useState } from "react";

type TagInputProps = {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
};

function parseTags(raw: string): string[] {
    return raw.split(",").map(t => t.trim()).filter(Boolean);
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
    const [text, setText] = useState(value.join(", "));

    useEffect(() => {
        if (parseTags(text).join("\u0000") !== value.join("\u0000")) {
            setText(value.join(", "));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <input
            type="text"
            value={text}
            placeholder={placeholder ?? "tags, comma separated"}
            onChange={e => {
                setText(e.target.value);
                onChange(parseTags(e.target.value));
            }}
            style={{ minWidth: "10rem" }}
        />
    );
}