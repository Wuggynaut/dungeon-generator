import { useEffect, useState } from "react";
import type { Config } from "../core/config.ts";

type ConfigEditorProps = {
    config: Config;
    onChange: (config: Config) => void;
};

const MIN_COUNT = 1;
const MAX_COUNT = 256;

function clamp(value: number): number {
    return Math.max(MIN_COUNT, Math.min(MAX_COUNT, Math.floor(value)));
}

export function ConfigEditor({ config, onChange }: ConfigEditorProps) {
    // Text state for the inputs, so a field can sit empty or half-typed
    // without forcing config to a number on every keystroke.
    const [roomsText, setRoomsText] = useState(String(config.roomCount));
    const [factionsText, setFactionsText] = useState(String(config.factionCount));

    // If config changes from outside (e.g. importing JSON), refill the fields.
    useEffect(() => setRoomsText(String(config.roomCount)), [config.roomCount]);
    useEffect(() => setFactionsText(String(config.factionCount)), [config.factionCount]);

    const commitRooms = () => {
        const parsed = Number(roomsText);
        const value = roomsText.trim() === "" || Number.isNaN(parsed)
            ? config.roomCount          // empty/invalid: keep the current value
            : clamp(parsed);
        setRoomsText(String(value));    // normalize the display ("012" -> "12")
        if (value !== config.roomCount) onChange({ ...config, roomCount: value });
    };

    const commitFactions = () => {
        const parsed = Number(factionsText);
        const value = factionsText.trim() === "" || Number.isNaN(parsed)
            ? config.factionCount
            : clamp(parsed);
        setFactionsText(String(value));
        if (value !== config.factionCount) onChange({ ...config, factionCount: value });
    };

    return (
        <section>
            <h2>Dungeon size</h2>
            <div>
                <label>
                    Rooms:{" "}
                    <input
                        type="number"
                        min={MIN_COUNT}
                        max={MAX_COUNT}
                        value={roomsText}
                        onChange={e => setRoomsText(e.target.value)}
                        onBlur={commitRooms}
                        onKeyDown={e => e.key === "Enter" && commitRooms()}
                        style={{ width: 64 }}
                    />
                </label>
            </div>
            <div>
                <label>
                    Factions:{" "}
                    <input
                        type="number"
                        min={MIN_COUNT}
                        max={MAX_COUNT}
                        value={factionsText}
                        onChange={e => setFactionsText(e.target.value)}
                        onBlur={commitFactions}
                        onKeyDown={e => e.key === "Enter" && commitFactions()}
                        style={{ width: 64 }}
                    />
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={config.resolveDetails}
                        onChange={e => onChange({ ...config, resolveDetails: e.target.checked })}
                    />{" "}
                    Resolve room details
                </label>
            </div>
        </section>
    );
}