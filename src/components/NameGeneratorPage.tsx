import {useState} from "react";
import {generateWord} from "../core/names.ts";
import {randomSeed} from "../core/rng.ts";



export default function NameGeneratorPage() {
    const [nameList, setNameList] = useState<string[]>([]);
    const [nameCount, setNameCount] = useState("20");

    const generateNameList = () => {
        const parsed = Number(nameCount);
        const value = nameCount.trim() === "" || Number.isNaN(parsed)
            ? 20 : parsed;
        setNameList([]);
        for (let i = 1; i < value+1; i++) {
            const name = generateWord(randomSeed(), `name.${i}`);
            setNameList(prev => [...prev, name])
        }
    }

    return (
        <>
            <div>
                <h2>Name Generator</h2>
                <button onClick={generateNameList} />
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