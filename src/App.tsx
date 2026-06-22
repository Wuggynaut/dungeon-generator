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

    const dungeon = useMemo(() => generate(seed), [seed]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set('seed', seed);
        window.history.replaceState(null, "", `?${params}`);
    }, [seed]);

    const handleGenerate = () => {
        setSeed(seedInput);
    };

    const handleReroll = () => {
        const next  = randomSeed();
        setSeedInput(next);
        setSeed(next);
    };

    const setNote = (id: string, text: string) => {
        setNotes(prev => ({ ...prev, [id]: text }));
    };

    return (
        <div>
            <input
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
            />
            <button onClick={handleGenerate}>Generate</button>
            <button onClick={handleReroll}>Reroll all</button>

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

            <RoomList rooms={dungeon.rooms} />

            <section>
                <h2>Map</h2>
                <MapView map={dungeon.map} rooms={dungeon.rooms} />
            </section>
        </div>
    )
}