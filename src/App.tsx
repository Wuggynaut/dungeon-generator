import { useEffect, useMemo, useState } from "react";
import { generate } from "./core/generate.ts";
import { dominantFactionIndex } from "./core/context.ts";
import { type Config, defaultConfig } from "./core/config.ts";
import type { Overrides, SlotControls } from "./types/rollTypes.ts";
import { Section } from "./components/Section.tsx";
import { RoomList } from "./components/RoomList.tsx";
import { MapView } from "./components/MapView.tsx";
import { decodeState, encodeState, fromJson, type ShareState, toJson } from "./core/share.ts";
import { serializeMarkdown } from "./core/serialize.ts";
import { marked } from "marked";
import { serializeMapSvg } from "./core/serializeMap.ts";
import { ConfigPage } from "./components/ConfigPage.tsx";
import {ConfigEditor} from "./components/ConfigEditor.tsx";
import styles from "./App.module.css";
import NameGeneratorPage from "./components/NameGeneratorPage.tsx";

const PRINT_STYLES = `
    body { font-family: Georgia, serif; max-width: 40rem; margin: 2rem auto;
           color: #000; line-height: 1.5; }
    h1 { font-size: 1.6rem; border-bottom: 2px solid #000; padding-bottom: 0.3rem; }
    h2 { font-size: 1.2rem; margin-top: 1.5rem; border-bottom: 1px solid #999; }
    h3 { font-size: 1rem; margin-bottom: 0.3rem; }
    blockquote { border-left: 3px solid #999; margin: 0.5rem 0;
                 padding-left: 0.8rem; color: #333; font-style: italic; }
    ul { margin: 0.3rem 0; }
    svg { max-width: 100%; height: auto; border: 1px solid #999; }
`;

const TABS = [
    { id: "worksheet", label: "Worksheet" },
    { id: "setup", label: "Setup" },
    { id: "names", label: "Names" },
] as const;

type ViewId = typeof TABS[number]["id"];

function randomSeed(): string {
    return Math.random().toString(36).slice(2, 10);
}

function readInitialState(): ShareState {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("d");
    if (d) {
        const decoded = decodeState(d);
        if (decoded) return decoded;
    }
    const seed = params.get("seed");
    return { seed: seed || randomSeed(), config: defaultConfig, overrides: {}, notes: {} };
}

function downloadFile(filename: string, mime: string, contents: string) {
    const blob = new Blob([contents], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function App() {
    const [initial] = useState(readInitialState);
    const [seed, setSeed] = useState(initial.seed);
    const [seedInput, setSeedInput] = useState(initial.seed);
    const [overrides, setOverrides] = useState<Overrides>(initial.overrides);
    const [notes, setNotes] = useState<Record<string, string>>(initial.notes);
    const [selected, setSelected] = useState<number | null>(null);
    const [config, setConfig] = useState<Config>(initial.config);
    const [view, setView] = useState<ViewId>("worksheet");

    const dungeon = useMemo(
        () => generate(seed, config, overrides),
        [seed, config, overrides],
    );

    useEffect(() => {
        const encoded = encodeState({ seed, config, overrides, notes });
        window.history.replaceState(null, "", `?d=${encoded}`);
    }, [seed, config, overrides, notes]);

    const numberByRoomId = useMemo(() => {
        const m = new Map<number, number>();
        for (const node of dungeon.map.nodes) m.set(node.roomId, node.number);
        return m;
    }, [dungeon]);

    const handleGenerate = () => {
        setSeed(seedInput);
        setOverrides({});
        setSelected(null);
    };

    const handleReroll = () => {
        const next = randomSeed();
        setSeedInput(next);
        setSeed(next);
        setOverrides({});
        setSelected(null);
    };

    const setNote = (id: string, text: string) => {
        setNotes(prev => ({ ...prev, [id]: text }));
    };

    const rerollSlot = (slotId: string) => {
        setOverrides(prev => {
            const count = (prev[slotId]?.rerollCount ?? 0) + 1;
            return { ...prev, [slotId]: { rerollCount: count } };
        });
    };

    const editSlot = (slotId: string, value: string) => {
        setOverrides(prev => ({ ...prev, [slotId]: { editValue: value } }));
    };

    const controls: SlotControls = { reroll: rerollSlot, edit: editSlot };

    const applyState = (state: ShareState) => {
        setSeed(state.seed);
        setSeedInput(state.seed);
        setConfig(state.config);
        setOverrides(state.overrides);
        setNotes(state.notes);
        setSelected(null);
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
    };

    const handleExport = () => {
        downloadFile(`dungeon-${seed}.json`, "application/json",
            toJson({ seed, config, overrides, notes }));
    };

    const handleExportMarkdown = () => {
        downloadFile(`dungeon-${seed}.md`, "text/markdown", serializeMarkdown(dungeon, notes));
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const state = fromJson(await file.text());
        if (!state) {
            alert("Could not read that file.");
            return;
        }
        applyState(state);
        e.target.value = "";
    };

    const handlePrint = () => {
        const html = marked.parse(serializeMarkdown(dungeon, notes)) as string;
        const svg = serializeMapSvg(dungeon);
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`
        <!DOCTYPE html>
        <html lang="en">
            <head><title>Dungeon ${seed}</title><style>${PRINT_STYLES}</style></head>
            <body><h2>Map</h2>${svg}${html}</body>
        </html>`);
        win.document.close();
        win.print();
    };

    return (
        <div className={styles.app}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}>Dungeon Seeds</h1>
                    <nav className={styles.tabs}>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.tab} ${view === tab.id ? styles.tabActive : ""}`}
                                onClick={() => setView(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className={styles.main}>
                {view === "setup" && (
                    <div className={styles.panel}>
                        <ConfigPage config={config} onChange={setConfig} />
                    </div>
                )}
                {view === "names" && (
                    <div className={styles.panel}>
                        <NameGeneratorPage/>
                    </div>
                )}
                {view === "worksheet" && (
                    <div className={styles.panel}>
                        <div className={styles.toolbar}>
                            <div className={styles.seedRow}>
                                <input value={seedInput} onChange={e => setSeedInput(e.target.value)} />
                                <button className="primary" onClick={handleGenerate}>Generate</button>
                                <button className="primary" onClick={handleReroll}>Reroll all</button>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button onClick={handleCopyLink}>Copy link</button>
                                <button onClick={handleExport}>Export JSON</button>
                                <label className={styles.fileButton}>
                                    Import JSON
                                    <input type="file" accept="application/json"
                                           onChange={handleImport} style={{ display: "none" }} />
                                </label>
                                <button onClick={handleExportMarkdown}>Export Markdown</button>
                                <button onClick={handlePrint}>Print</button>
                            </div>
                        </div>
                        <ConfigEditor config={config} onChange={setConfig} />
                        <Section
                            title="History"
                            prompt="Why was this dungeon built, how was it built, and what caused its downfall?"
                            items={[
                                { label: "Purpose", roll: dungeon.history.purpose },
                                { label: "Construction", roll: dungeon.history.construction },
                                { label: "Ruination", roll: dungeon.history.ruination },
                            ]}
                            note={notes["notes.history"] ?? ""}
                            onNote={text => setNote("notes.history", text)}
                            controls={controls}
                        />
                        <Section
                            title="Denizens"
                            prompt="What do we know about the creatures and factions that occupy the dungeon?"
                            items={[
                                { label: "General attitude", roll: dungeon.denizens.attitude },
                                { label: "Standout NPC", roll: dungeon.denizens.standoutNPC },
                            ]}
                            note={notes["notes.denizens"] ?? ""}
                            onNote={text => setNote("notes.denizens", text)}
                            controls={controls}
                        />
                        <Section
                            title="Factions"
                            prompt="What is each faction trying to achieve, and what stands in their way?"
                            items={dungeon.factions.map((faction, index) => ({
                                label: `Faction ${index + 1}`,
                                roll: faction.agenda,
                                extra: { label: "Type", slot: faction.group },
                                meta: `Strength ${faction.strength}${index === dominantFactionIndex(dungeon.factions) ? ", dominant" : ""}`,
                            }))}
                            note={notes["notes.factions"] ?? ""}
                            onNote={text => setNote("notes.factions", text)}
                            controls={controls}
                        />

                        <div className={styles.mapBlock}>
                            <MapView map={dungeon.map} rooms={dungeon.rooms}
                                     selected={selected} onSelect={setSelected}
                                     controls={controls} onRerollAll={handleReroll} />
                        </div>
                        <RoomList rooms={dungeon.rooms} numberByRoomId={numberByRoomId}
                                  selected={selected} onSelect={setSelected} controls={controls} />
                    </div>
                )}
            </main>
        </div>
    );
}