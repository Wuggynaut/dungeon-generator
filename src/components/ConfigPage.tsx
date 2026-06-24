import type {Config, Tables} from "../core/config.ts";
import type {PairedTable} from "../types/rollTypes.ts";
import {RoomTypeEditor} from "./RoomTypeEditor.tsx";
import {TableEditor} from "./TableEditor.tsx";

type ConfigPageProps = {
    config: Config;
    onChange: (config: Config) => void;
};

const FIXED_TABLES: { key: keyof Tables; title: string }[] = [
    { key: "purpose", title: "Purpose" },
    { key: "construction", title: "Construction" },
    { key: "ruination", title: "Ruination" },
    { key: "traits", title: "Traits" },
    { key: "agendas", title: "Agendas" },
];

export function ConfigPage({config, onChange}: ConfigPageProps) {
    const setTable = (key: keyof Tables, table: PairedTable) => {
        onChange({...config, tables: {...config.tables, [key]: table}});
    };

    return (
        <div>
            <RoomTypeEditor config={config} onChange={onChange} />

            <section>
                <h2>Core Tables</h2>
                <p style={{ color: "#666", fontSize: 13 }}>
                    These feed History, Denizens, and Factions. Editing them changes what each seed rolls.
                </p>
                {FIXED_TABLES.map(({ key, title }) => {
                    const table = config.tables[key];
                    return (
                        <details key={key} style={{ marginBottom: 8 }}>
                            <summary style={{ cursor: "pointer" }}>
                                {title}{" "}
                                <span style={{ color: "#666" }}>
                                    ({table.columns[0]} × {table.columns[1]}, {table.rows.length} rows)
                                </span>
                            </summary>
                            <div style={{ marginTop: 8 }}>
                                <TableEditor table={table} onChange={t => setTable(key, t)} />
                            </div>
                        </details>
                    );
                })}
            </section>
        </div>
    )
}