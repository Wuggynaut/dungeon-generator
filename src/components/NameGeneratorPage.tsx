import {useState} from "react";
import {generateName} from "../core/names.ts";
import {randomSeed} from "../core/rng.ts";
import {german, vainan} from "../core/data/languages.ts";

export default function NameGeneratorPage() {
    const [nameList, setNameList] = useState<string[]>([]);
    const [nameCount, setNameCount] = useState("20");

    const generateNameList = () => {
        const parsed = Number(nameCount);
        const value = nameCount.trim() === "" || Number.isNaN(parsed)
            ? 20 : parsed;
        const seed = randomSeed();
        const names: string[] = [];
        for (let i = 1; i < value + 1; i++) {
            names.push(generateName(german, seed, `name.${i}`));
        }
        setNameList(names);
    }

    return (
        <>
            <div>
                <h2>Name Generator</h2>
                <div/>
                <button onClick={generateNameList}>Generate</button>
                <div/>
                <input
                    type="number"
                    value={nameCount}
                    onChange={e => setNameCount(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && generateNameList()}
                    style={{ width: 64 }}
                />
            </div>
            <ul>
                {nameList.map((name, i) => (
                    <li key={i}>
                        <span>{name}</span>
                    </li>
                ))}
            </ul>
        </>
    )
}