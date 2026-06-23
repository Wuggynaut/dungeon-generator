import { useEffect, useMemo, useState } from "react";
import { generate } from "./core/generate.ts";
import { defaultConfig } from "./core/config.ts";
import type { Overrides, SlotControls } from "./types/rollTypes.ts";
import { Section } from "./components/Section.tsx";
import { RoomList } from "./components/RoomList.tsx";
import { MapView } from "./components/MapView.tsx";
import {decodeState, encodeState, fromJson, type ShareState, toJson} from "./core/share.ts";

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

    const seed = params.get("seed"); // fall back to old ?seed= links
    return { seed: seed || randomSeed(), overrides: {}, notes: {} };
}

export default function App() {
    const [initial] = useState(readInitialState);
    const [seed, setSeed] = useState(initial.seed);
    const [seedInput, setSeedInput] = useState(initial.seed);
    const [overrides, setOverrides] = useState<Overrides>(initial.overrides);
    const [notes, setNotes] = useState<Record<string, string>>(initial.notes);
    const [selected, setSelected] = useState<number | null>(null);

    const dungeon = useMemo(
        () => generate(seed, defaultConfig, overrides),
        [seed, overrides],
    );

    useEffect(() => {
        const encoded = encodeState({ seed, overrides, notes });
        window.history.replaceState(null, "", `?d=${encoded}`);
    }, [seed, overrides, notes]);

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

    const controls: SlotControls = {
        reroll: rerollSlot,
        edit: editSlot,
    };

    const applyState = (state: ShareState) => {
        setSeed(state.seed);
        setSeedInput(state.seed);
        setOverrides(state.overrides);
        setNotes(state.notes);
        setSelected(null);
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
    };

    const handleExport = () => {
        const text = toJson({ seed, overrides, notes });
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `dungeon-${seed}.json`;
        a.click();

        URL.revokeObjectURL(url);
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

    return (
        <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
                <input value={seedInput} onChange={e => setSeedInput(e.target.value)} />
                <button onClick={handleGenerate}>Generate</button>
                <button onClick={handleReroll}>Reroll all</button>
                <p>
                    <button onClick={handleCopyLink}>Copy link</button>
                    <button onClick={handleExport}>Export JSON</button>
                    <label style={{ cursor: "pointer" }}>
                        Import JSON
                        <input
                            type="file"
                            accept="application/json"
                            onChange={handleImport}
                            style={{ display: "none" }}
                        />
                    </label>
                </p>
            </div>

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
                }))}
                note={notes["notes.factions"] ?? ""}
                onNote={text => setNote("notes.factions", text)}
                controls={controls}
            />

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 520px" }}>
                    <MapView
                        map={dungeon.map}
                        rooms={dungeon.rooms}
                        selected={selected}
                        onSelect={setSelected}
                    />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <RoomList
                        rooms={dungeon.rooms}
                        numberByRoomId={numberByRoomId}
                        selected={selected}
                        onSelect={setSelected}
                        controls={controls}
                    />
                </div>
            </div>
            <button onClick={handleReroll}>Reroll all</button>
        </div>
    );
}