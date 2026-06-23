import {useEffect, useMemo, useState} from "react";
import {generate} from "./core/generate.ts";
import {Section} from "./components/Section.tsx";
import {RoomList} from "./components/RoomList.tsx";
import {MapView} from "./components/MapView.tsx";

function readSeedFromUrl(): string {
    return new URLSearchParams(window.location.search).get('seed') ?? "";
}

function randomSeed(): string {
    return Math.random().toString(36).slice(2, 10);
}

export default function App() {
    const [seed, setSeed] = useState(() => readSeedFromUrl() || randomSeed());
    const [seedInput, setSeedInput] = useState(seed);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [selected, setSelected] = useState<number | null>(null);

    const dungeon = useMemo(() => generate(seed), [seed]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set('seed', seed);
        window.history.replaceState(null, "", `?${params}`);
    }, [seed]);

    // roomId -> display number (BFS order), shared by map and list
    const numberByRoomId = useMemo(() => {
        const m = new Map<number, number>();
        for (const node of dungeon.map.nodes) m.set(node.roomId, node.number);
        return m;
    }, [dungeon]);

    const handleGenerate = () => { setSeed(seedInput); setSelected(null); };

    const handleReroll = () => {
        const next = randomSeed();
        setSeedInput(next);
        setSeed(next);
        setSelected(null);
    };

    const setNote = (id: string, text: string) => {
        setNotes(prev => ({ ...prev, [id]: text }));
    };

    return (
        <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
                <input value={seedInput} onChange={e => setSeedInput(e.target.value)} />
                <button onClick={handleGenerate}>Generate</button>
                <button onClick={handleReroll}>Reroll all</button>
            </div>

            {/* full-width worksheet sections */}
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
            />

            {/* map and room list, side by side */}
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
                    />
                </div>
            </div>
            <button onClick={handleReroll}>Reroll all</button>
        </div>
    );
}