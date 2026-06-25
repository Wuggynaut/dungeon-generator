import type { Config, Tables } from "../core/config.ts";
import type { PairedTable } from "../types/rollTypes.ts";
import { RoomTypeEditor } from "./RoomTypeEditor.tsx";
import { TableEditor } from "./TableEditor.tsx";
import styles from "./ConfigPage.module.css";

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

export function ConfigPage({ config, onChange }: ConfigPageProps) {
    const setTable = (key: keyof Tables, table: PairedTable) => {
        onChange({ ...config, tables: { ...config.tables, [key]: table } });
    };

    return (
        <>
            <section>
                <RoomTypeEditor config={config} onChange={onChange} />
            </section>

            <section>
                <h2 className={styles.heading}>Core tables</h2>
                <p className={styles.note}>
                    These feed History, Denizens, and Factions. Editing them changes what each seed rolls.
                </p>

                <div className={styles.tables}>
                    {FIXED_TABLES.map(({ key, title }) => {
                        const table = config.tables[key];
                        return (
                            <details key={key} className={styles.details}>
                                <summary className={styles.summary}>
                                    <span className={styles.summaryRow}>
                                        <span className={styles.summaryTitle}>{title}</span>
                                        <span className={styles.summaryMeta}>
                                            {table.columns[0]} × {table.columns[1]} · {table.rows.length} rows
                                        </span>
                                    </span>
                                </summary>
                                <div className={styles.detailsBody}>
                                    <TableEditor table={table} onChange={t => setTable(key, t)} />
                                </div>
                            </details>
                        );
                    })}
                </div>
            </section>
        </>
    );
}